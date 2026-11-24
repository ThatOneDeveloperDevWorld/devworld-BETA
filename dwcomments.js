/* dwcomments.js - Dev World comment section (same style of comments as the game menu)
 *
 *   - "Show your thoughts" box, newest comments first
 *   - replies (one level deep) but no likes on comments
 *   - you can delete your own comments
 *
 * Usage:   DWComments.mount(containerElement, { collection: function () { return db.collection("posts").doc(id).collection("comments"); } });
 *
 * Comment documents: { authorId, text, createdAt, parentId (null for top level), replyToAuthorId, deleted }
 * Older comments that only have { authorId, text, createdAt } show up as normal top-level comments.
 * Needs firebase (v8) app/auth/firestore on the page. Works with i18n.js if present.
 */
(function () {
    "use strict";
    if (window.DWComments) return;

    var DEFAULT_PFP = "people.png";
    var MAX_COMMENT = 300;
    var PAGE_SIZE = 5;
    var FETCH_LIMIT = 300;
    var COOLDOWN_MS = 3000;
    var LOCALES = { en: "en-US", es: "es-ES", ja: "ja-JP" };

    function T(s) { try { return (window.DWLang && DWLang.t) ? DWLang.t(s) : s; } catch (e) { return s; } }
    function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
    function FV() { return firebase.firestore.FieldValue; }
    function db() { return firebase.firestore(); }

    function toDate(ts) {
        if (!ts) return null;
        if (typeof ts.toDate === "function") return ts.toDate();
        return ts instanceof Date ? ts : null;
    }
    function fmtDate(d) {
        if (!d) return "";
        var lang = (window.DWLang && DWLang.get) ? DWLang.get() : "en";
        try { return d.toLocaleString(LOCALES[lang] || "en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
        catch (e) { return d.toLocaleString(); }
    }
    function safePfp(url) {
        if (!url || typeof url !== "string" || /\.(mp4|webm|mov)(\?|#|$)/i.test(url)) return DEFAULT_PFP;
        return url;
    }

    /* ---------- users ---------- */
    var userCache = {}, userInfo = {};
    function getUser(uid) {
        if (!uid) return Promise.resolve({ name: "", pfp: "" });
        if (!userCache[uid]) {
            userCache[uid] = db().collection("users").doc(uid).get().then(function (d) {
                var u = d.exists ? d.data() : {};
                var info = { name: u.Username || u.username || "", pfp: u.pfpUrl || "" };
                userInfo[uid] = info;
                return info;
            }).catch(function () { userInfo[uid] = { name: "", pfp: "" }; return userInfo[uid]; });
        }
        return userCache[uid];
    }

    /* ---------- styles ---------- */
    var CSS = [
        ".dwc{width:100%;text-align:left;line-height:normal;font-family:'Cherry Bomb One',cursive,sans-serif;color:#212529}",
        ".dwc *{box-sizing:border-box}",
        ".dwc-title{margin:18px 0 10px;padding-top:12px;border-top:3px dashed #bbb;font-size:17px;font-weight:400;color:#000}",
        ".dwc-empty{text-align:center;font-size:13px;color:#777;padding:14px 0}",
        ".dwc-c{display:flex;gap:9px;margin-bottom:12px}",
        ".dwc-pfp{width:34px;height:34px;flex:none;object-fit:cover;border:2px solid #000;border-radius:8px;background:#fff}",
        ".dwc-body{min-width:0;flex:1}",
        ".dwc-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}",
        ".dwc-author{font-size:13px;color:#000;text-decoration:none;cursor:pointer}",
        ".dwc-author:hover{text-decoration:underline}",
        ".dwc-time{font-size:11px;color:#888}",
        ".dwc-text{margin-top:2px;font-size:14px;line-height:1.35;color:#222;white-space:pre-wrap;word-break:break-word;font-family:Arial,Helvetica,sans-serif}",
        ".dwc-text.dwc-gone{font-style:italic;color:#888}",
        ".dwc-mention{color:#0b7a82;font-weight:700;margin-right:4px}",
        ".dwc-btns{display:flex;gap:6px;margin-top:5px}",
        ".dwc-mini{padding:3px 10px;font-family:inherit;font-size:11px;color:#000;background:#f1f3f5;border:2px solid #000;border-radius:8px;cursor:pointer}",
        ".dwc-mini:hover{background:#e2e6ea}",
        ".dwc-mini.dwc-danger{background:#ff6b6b;color:#fff}",
        ".dwc-replies{margin-top:10px;padding-left:10px;border-left:3px solid #d0d4d8}",
        ".dwc-replies .dwc-c:last-child{margin-bottom:0}",
        ".dwc-more{display:block;width:100%;margin-top:4px;padding:9px;font-family:inherit;font-size:13px;color:#000;background:#fff;border:2px solid #000;border-radius:10px;box-shadow:2px 2px 0 #000;cursor:pointer}",
        ".dwc-composer{margin-top:12px}",
        ".dwc-replybar{display:none;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;padding:5px 10px;font-size:12px;color:#000;background:#e7fbfc;border:2px solid #000;border-radius:8px}",
        ".dwc-replybar.dwc-active{display:flex}",
        ".dwc-replybar button{background:none;border:none;font-family:inherit;font-size:14px;cursor:pointer;color:#000}",
        ".dwc-inputrow{display:flex;gap:8px}",
        ".dwc-input{flex:1;min-width:0;height:44px;padding:0 14px;font-family:inherit;font-size:16px;color:#000;background:#f8f9fa;border:3px solid #000;border-radius:12px;outline:none;margin:0}",
        ".dwc-input:focus{background:#fff}",
        ".dwc-send{height:44px;padding:0 16px;font-family:inherit;font-size:14px;color:#000;background:#ffb703;border:3px solid #000;border-radius:12px;box-shadow:2px 2px 0 #000;cursor:pointer;margin:0}",
        ".dwc-send:disabled{opacity:.6}"
    ].join("\n");
    var styled = false;
    function injectStyle() {
        if (styled) return; styled = true;
        var s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
    }

    /* ---------- auth (shared by every mounted section) ---------- */
    var instances = [], authHooked = false, currentUser = null;
    // forget sections whose card was removed from the page (e.g. the feed was reloaded)
    function prune() { instances = instances.filter(function (i) { return i.root && i.root.isConnected !== false; }); }
    function hookAuth() {
        if (authHooked) return; authHooked = true;
        try {
            currentUser = firebase.auth().currentUser || null;
            firebase.auth().onAuthStateChanged(function (u) {
                currentUser = u || null;
                prune();
                instances.forEach(function (i) { i.render(); });
            });
        } catch (e) { currentUser = null; }
    }

    /* ---------- one comment section ---------- */
    function mount(root, opts) {
        injectStyle();
        hookAuth();

        var inst = { root: root, comments: [], shown: opts.pageSize || PAGE_SIZE, replyTo: null, sending: false, lastAt: 0, alive: true };
        var page = opts.pageSize || PAGE_SIZE;
        function col() { return opts.collection(); }

        // one mount per container: drop an older section that was using the same container
        instances = instances.filter(function (i) { return i.root !== root; });
        root.textContent = "";
        var wrap = el("div", "dwc");
        var title = el("h3", "dwc-title");
        title.appendChild(el("span", null, T("Comments")));
        var count = el("span", null, "");
        title.appendChild(document.createTextNode(" "));
        title.appendChild(count);
        var list = el("div", "dwc-list");
        var more = el("button", "dwc-more", T("Show More")); more.type = "button"; more.style.display = "none";
        var composer = el("div", "dwc-composer");
        var replyBar = el("div", "dwc-replybar");
        var replyText = el("span"); replyText.setAttribute("data-no-i18n", "");
        var replyCancel = el("button", null, "\u2715"); replyCancel.type = "button"; replyCancel.setAttribute("aria-label", T("Cancel"));
        replyBar.appendChild(replyText); replyBar.appendChild(replyCancel);
        var row = el("div", "dwc-inputrow");
        var input = el("input", "dwc-input"); input.type = "text"; input.maxLength = MAX_COMMENT; input.autocomplete = "off";
        input.placeholder = T("Show your thoughts");
        var send = el("button", "dwc-send", T("Post")); send.type = "button";
        row.appendChild(input); row.appendChild(send);
        composer.appendChild(replyBar); composer.appendChild(row);
        wrap.appendChild(title); wrap.appendChild(list); wrap.appendChild(more); wrap.appendChild(composer);
        root.appendChild(wrap);

        list.appendChild(el("div", "dwc-empty", T("Loading comments...")));

        function clearReply() { inst.replyTo = null; replyBar.classList.remove("dwc-active"); }
        replyCancel.onclick = clearReply;
        more.onclick = function () { inst.shown += page; render(); };

        function startReply(c, name) {
            // replies are one level deep: replying to a reply attaches to the same top-level comment
            inst.replyTo = { parentId: c.parentId || c.id, authorId: c.authorId };
            replyText.textContent = T("Replying to") + " @" + name;
            replyBar.classList.add("dwc-active");
            input.focus();
        }

        function node(c, isReply) {
            var info = userInfo[c.authorId] || {};
            var name = info.name || T("Unknown");
            var box = el("div", "dwc-c");

            var pfp = el("img", "dwc-pfp"); pfp.alt = "";
            pfp.onerror = function () { pfp.onerror = null; pfp.src = DEFAULT_PFP; };
            pfp.src = c.deleted ? DEFAULT_PFP : safePfp(info.pfp);
            box.appendChild(pfp);

            var body = el("div", "dwc-body");
            var head = el("div", "dwc-head");
            if (!c.deleted) {
                var a = el("a", "dwc-author", name); a.setAttribute("data-no-i18n", "");
                if (c.authorId) {
                    a.href = "userprofile.html?id=" + encodeURIComponent(c.authorId);
                    a.onclick = function (e) { e.preventDefault(); window.location.href = a.href; };
                }
                head.appendChild(a);
                head.appendChild(el("span", "dwc-time", fmtDate(c.time)));
            }
            body.appendChild(head);

            var text = el("div", "dwc-text");
            if (c.deleted) {
                text.className += " dwc-gone";
                text.textContent = T("Comment deleted");
            } else {
                text.setAttribute("data-no-i18n", "");
                if (isReply && c.replyToAuthorId) {
                    var rn = (userInfo[c.replyToAuthorId] || {}).name;
                    if (rn) text.appendChild(el("span", "dwc-mention", "@" + rn));
                }
                text.appendChild(document.createTextNode(c.text));   // plain text, never HTML
            }
            body.appendChild(text);

            if (!c.deleted) {
                var btns = el("div", "dwc-btns");
                var rb = el("button", "dwc-mini", T("Reply")); rb.type = "button";
                rb.onclick = function () { startReply(c, name); };
                btns.appendChild(rb);
                if (currentUser && currentUser.uid === c.authorId) {
                    var del = el("button", "dwc-mini dwc-danger", T("Delete")); del.type = "button";
                    del.onclick = function () { remove(c); };
                    btns.appendChild(del);
                }
                body.appendChild(btns);
            }
            box.appendChild(body);
            return box;
        }

        function render() {
            list.textContent = "";
            var all = inst.comments;
            var tops = all.filter(function (c) { return !c.parentId; }).sort(function (a, b) { return b.time - a.time; });
            var replies = {};
            all.filter(function (c) { return c.parentId; }).sort(function (a, b) { return a.time - b.time; })
               .forEach(function (c) { (replies[c.parentId] = replies[c.parentId] || []).push(c); });

            count.textContent = "(" + all.filter(function (c) { return !c.deleted; }).length + ")";

            if (!tops.length) {
                list.appendChild(el("div", "dwc-empty", T("No comments yet. Be the first!")));
                more.style.display = "none";
                return;
            }
            tops.slice(0, inst.shown).forEach(function (c) {
                var item = node(c, false);
                var rs = replies[c.id] || [];
                if (rs.length) {
                    var rw = el("div", "dwc-replies");
                    rs.forEach(function (r) { rw.appendChild(node(r, true)); });
                    item.querySelector(".dwc-body").appendChild(rw);
                }
                list.appendChild(item);
            });
            more.style.display = tops.length > inst.shown ? "block" : "none";
        }
        inst.render = render;
        prune();
        instances.push(inst);

        function load() {
            return col().orderBy("createdAt", "desc").limit(FETCH_LIMIT).get().then(function (snap) {
                inst.comments = snap.docs.map(function (d) {
                    var c = d.data();
                    return {
                        id: d.id, authorId: c.authorId || "", text: c.text || "",
                        time: toDate(c.createdAt) || new Date(),
                        parentId: c.parentId || null, replyToAuthorId: c.replyToAuthorId || null,
                        deleted: !!c.deleted
                    };
                });
                var ids = {};
                inst.comments.forEach(function (c) { ids[c.authorId] = 1; if (c.replyToAuthorId) ids[c.replyToAuthorId] = 1; });
                return Promise.all(Object.keys(ids).map(getUser));
            }).then(render).catch(function (err) {
                console.error("Comments: could not load", err);
                list.textContent = "";
                list.appendChild(el("div", "dwc-empty", T("Failed to load comments.")));
            });
        }

        function submit() {
            if (!currentUser) { alert("Log in to comment."); return; }
            if (inst.sending) return;
            var text = input.value.trim().slice(0, MAX_COMMENT);
            if (!text) return;
            if (Date.now() - inst.lastAt < COOLDOWN_MS) { alert("Please wait a few seconds."); return; }
            inst.sending = true; send.disabled = true;
            // Dev Points check first (below 90 you cannot comment)
            var allowed = window.DWPerms ? DWPerms.guard("comment") : Promise.resolve(true);
            allowed.then(function (ok) {
                if (!ok) return;
                return col().add({
                    authorId: currentUser.uid,
                    text: text,
                    createdAt: FV().serverTimestamp(),
                    parentId: inst.replyTo ? inst.replyTo.parentId : null,
                    replyToAuthorId: inst.replyTo ? inst.replyTo.authorId : null
                }).then(function () {
                    inst.lastAt = Date.now();
                    input.value = "";
                    clearReply();
                    return load();
                });
            }).catch(function (err) {
                console.error("Comments: post failed", err);
                alert("Failed to post comment.");
            }).then(function () { inst.sending = false; send.disabled = false; });
        }

        function remove(c) {
            if (!currentUser || currentUser.uid !== c.authorId) return;
            if (!confirm("Delete this comment?")) return;
            var ref = col().doc(c.id);
            var hasReplies = !c.parentId && inst.comments.some(function (x) { return x.parentId === c.id; });
            // a comment that already has replies is blanked so the replies keep their place; otherwise it is removed
            var op = hasReplies ? ref.update({ deleted: true, text: "" }) : ref.delete();
            op.then(load).catch(function (err) {
                console.error("Comments: delete failed", err);
                alert("Failed to delete comment.");
            });
        }

        send.onclick = submit;
        input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); submit(); } });
        load();
        return { reload: load };
    }

    window.DWComments = { mount: mount };
})();
