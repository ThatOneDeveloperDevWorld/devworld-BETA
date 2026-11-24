/* gamemenu.js - Dev World game menu
 *
 * Clicking any game link (play.html?id=...) opens this menu instead of jumping
 * straight into the game. The menu lets you:
 *   - Enter the game, or Fork it (editor.html?fork=<id>)
 *   - Like it (stored in games/{id}.likes, an array of user ids)
 *   - Follow the creator (same followers/following arrays userprofile.html uses)
 *   - Read, write, reply to and delete your own comments
 *     (stored in games/{id}/comments; comments can be replied to but not liked)
 *   - Report the game or its creator through the Discord webhook below
 *
 * Needs firebase-app, firebase-auth and firebase-firestore (v8) on the page, and i18n.js
 * (optional). Include it with:  <script src="gamemenu.js"></script>
 */
(function () {
    "use strict";
    if (window.DWGameMenu) return;

    /* ---------- settings ---------- */
    var REPORT_WEBHOOK_URL = "https://discord.com/api/webhooks/1573348339632840734/PF4z37kxJSyDuGgJGczPf3DE9sOfNLERlw0__KA1cVHRCX40MkM1HsX0UYuIWy9niQoz";
    var DEFAULT_ICON = "gameres.png";
    var DEFAULT_PFP = "people.png";
    var ICON_EXTS = [".png", ".jpg", ".jpeg", ".gif"];
    var REPORT_COOLDOWN_MS = 30000;
    var REPORT_KEY = "devworld_last_report";
    var LOCALES = { en: "en-US", es: "es-ES", ja: "ja-JP" };
    var REASONS = ["Inappropriate Content", "Harassment or Bullying", "Spam", "Other"];

    /* ---------- tiny helpers ---------- */
    function T(s) {
        try { return (window.DWLang && DWLang.t) ? DWLang.t(s) : s; } catch (e) { return s; }
    }
    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }
    function db() { return firebase.firestore(); }
    function FV() { return firebase.firestore.FieldValue; }
    function $(id) { return document.getElementById(id); }

    function toDate(ts) {
        if (!ts) return null;
        if (typeof ts.toDate === "function") return ts.toDate();
        if (ts instanceof Date) return ts;
        return null;
    }
    function fmtDate(ts) {
        var d = toDate(ts);
        if (!d) return "";
        var lang = (window.DWLang && DWLang.get) ? DWLang.get() : "en";
        try {
            return d.toLocaleString(LOCALES[lang] || "en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
        } catch (e) { return d.toLocaleString(); }
    }
    function safeIcon(url) {
        if (!url || typeof url !== "string") return DEFAULT_ICON;
        var clean = url.split("?")[0].split("#")[0].toLowerCase();
        for (var i = 0; i < ICON_EXTS.length; i++) {
            if (clean.slice(-ICON_EXTS[i].length) === ICON_EXTS[i]) return url;
        }
        return DEFAULT_ICON;
    }
    function validBanner(url) {
        if (!url || typeof url !== "string") return null;
        var clean = url.split("?")[0].split("#")[0].toLowerCase();
        for (var i = 0; i < ICON_EXTS.length; i++) {
            if (clean.slice(-ICON_EXTS[i].length) === ICON_EXTS[i]) return url;
        }
        return null;
    }
    function clearBanner() {
        var head = $("dwgm-head");
        head.classList.remove("dwgm-hasbanner");
        head.style.backgroundImage = "";
    }
    function showBanner(url) {
        var good = validBanner(url);
        if (!good) return;
        var id = S.gameId;
        var probe = new Image();
        probe.onload = function () {
            if (!S.open || S.gameId !== id) return;   // menu was closed or switched to another game
            var bar = $("dwgm-head");
            bar.style.backgroundImage = 'url("' + good.replace(/[\\"\n\r]/g, encodeURIComponent) + '")';
            bar.classList.add("dwgm-hasbanner");
        };
        probe.src = good;   // if it fails to load, no banner is shown
    }
    function safePfp(url) {
        if (!url || typeof url !== "string") return DEFAULT_PFP;
        if (/\.(mp4|webm|mov)(\?|#|$)/i.test(url)) return DEFAULT_PFP; // video avatars: use the default picture here
        return url;
    }
    function withFallback(img, fallback) {
        img.onerror = function () { img.onerror = null; img.src = fallback; };
    }

    /* ---------- state ---------- */
    var S = {
        open: false, token: 0,
        gameId: null, game: null,
        creatorId: null, creatorName: "",
        user: null,
        likes: [], busyLike: false,
        following: false, busyFollow: false,
        reportKind: "game"
    };
    var userCache = {};   // uid -> Promise<{name,pfp}>
    var userInfo = {};    // uid -> {name,pfp}, filled once the lookup finishes (used for synchronous rendering)
    var built = false, authHooked = false, toastTimer = null;

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
        ".dwgm-overlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:5000;display:none;align-items:center;justify-content:center;padding:14px;background:rgba(0,0,0,.65);font-family:'Cherry Bomb One',cursive,sans-serif;color:#212529;-webkit-tap-highlight-color:transparent}",
        ".dwgm-overlay.dwgm-open{display:flex}",
        ".dwgm-overlay *{box-sizing:border-box}",
        ".dwgm-card{position:relative;display:flex;flex-direction:column;width:100%;max-width:460px;max-height:100%;background:#fff;border:4px solid #000;border-radius:20px;box-shadow:0 8px 0 #000;overflow:hidden}",
        ".dwgm-scroll{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}",
        /* top bar + header */
        ".dwgm-head{background:#5ce1e6;border-bottom:4px solid #000;padding:12px 14px 16px}",
        ".dwgm-topbar{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}",
        ".dwgm-head.dwgm-hasbanner{background-color:#2b9aa0;background-size:cover;background-position:center}",
        ".dwgm-head.dwgm-hasbanner .dwgm-topbar{margin-bottom:30px}",
        ".dwgm-head.dwgm-hasbanner .dwgm-icon{background:transparent}",
        ".dwgm-head.dwgm-hasbanner .dwgm-title,.dwgm-head.dwgm-hasbanner .dwgm-visits{color:#000;text-shadow:none}",
        ".dwgm-head.dwgm-hasbanner .dwgm-icon,.dwgm-head.dwgm-hasbanner .dwgm-pill{box-shadow:none}",
        ".dwgm-pill{background:#fff;border:2px solid #000;border-radius:10px;padding:8px 16px;font-family:inherit;font-size:14px;color:#000;cursor:pointer;box-shadow:2px 2px 0 #000;transition:transform .1s ease}",
        ".dwgm-pill:active{transform:translate(1px,1px);box-shadow:1px 1px 0 #000}",
        ".dwgm-menuwrap{position:relative}",
        ".dwgm-dropdown{position:absolute;top:50px;right:0;width:200px;display:none;flex-direction:column;padding:8px;background:#fff;border:3px solid #000;border-radius:14px;box-shadow:4px 4px 0 #000;z-index:30}",
        ".dwgm-dropdown.dwgm-active{display:flex}",
        ".dwgm-ditem{background:#f8f9fa;border:2px solid #000;text-align:left;padding:10px;font-size:13px;font-family:inherit;border-radius:10px;cursor:pointer;color:#000;margin-bottom:6px;box-shadow:2px 2px 0 #000}",
        ".dwgm-ditem:last-child{margin-bottom:0}",
        ".dwgm-ditem:hover{background:#e2e6ea}",
        ".dwgm-titlerow{display:flex;align-items:center;gap:14px}",
        ".dwgm-icon{width:78px;height:78px;flex:none;object-fit:cover;background:#fff;border:3px solid #000;border-radius:12px;box-shadow:3px 3px 0 #000}",
        ".dwgm-title{margin:0;font-size:24px;line-height:1.15;font-weight:400;color:#000;word-break:break-word}",
        ".dwgm-visits{margin-top:4px;font-size:13px;color:#000}",
        /* action buttons */
        ".dwgm-actions{display:flex;gap:10px;padding:14px 14px 0}",
        ".dwgm-btn{display:flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 16px;font-family:inherit;font-size:17px;color:#000;border:3px solid #000;border-radius:12px;box-shadow:3px 3px 0 #000;cursor:pointer;transition:transform .1s ease}",
        ".dwgm-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #000}",
        ".dwgm-btn svg{width:20px;height:20px;flex:none}",
        ".dwgm-enter{flex:1;background:#55ff55}",
        ".dwgm-fork{background:#ffb703}",
        ".dwgm-share{background:#fff;padding:0 13px}",
        /* body */
        ".dwgm-body{padding:14px}",
        ".dwgm-likerow{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
        ".dwgm-like{display:flex;align-items:center;gap:8px;height:48px;background:#f1f3f5;border:3px solid #000;border-radius:12px;padding:0 16px 0 12px;font-family:inherit;font-size:17px;color:#000;cursor:pointer;box-shadow:3px 3px 0 #000;transition:background .15s,transform .1s ease}",
        ".dwgm-like:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #000}",
        ".dwgm-like img{width:26px;height:26px;object-fit:contain;filter:grayscale(1);opacity:.55;transition:filter .15s,opacity .15s}",
        ".dwgm-like.dwgm-liked{background:#ffd6d6}",
        ".dwgm-like.dwgm-liked img{filter:none;opacity:1}",
        ".dwgm-like:disabled{opacity:.7;cursor:default}",
        ".dwgm-creator{display:flex;align-items:center;gap:10px;margin-top:14px;padding:10px;background:#f8f9fa;border:2px solid #000;border-radius:12px;box-shadow:2px 2px 0 #000}",
        ".dwgm-pfp{width:46px;height:46px;flex:none;object-fit:cover;border:2px solid #000;border-radius:10px;background:#fff}",
        ".dwgm-cinfo{min-width:0;flex:1}",
        ".dwgm-crow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
        ".dwgm-cname{font-size:16px;color:#000;text-decoration:none;word-break:break-word;cursor:pointer}",
        ".dwgm-cname:hover{text-decoration:underline}",
        ".dwgm-follow{padding:4px 12px;font-family:inherit;font-size:12px;color:#000;background:#55ff55;border:2px solid #000;border-radius:8px;box-shadow:2px 2px 0 #000;cursor:pointer}",
        ".dwgm-follow.dwgm-following{background:#ffbe0b}",
        ".dwgm-follow:disabled{opacity:.7}",
        ".dwgm-forked{margin-top:3px;font-size:12px;color:#555}",
        ".dwgm-desc{margin-top:12px;font-size:14px;line-height:1.4;color:#222;white-space:pre-wrap;word-break:break-word;font-family:Arial,Helvetica,sans-serif}",
        ".dwgm-dates{margin-top:10px;font-size:12px;color:#666;line-height:1.5}",
        ".dwgm-events{margin-top:10px;padding:7px 10px;font-size:13px;line-height:1.4;color:#000;background:#e7fbfc;border:2px solid #000;border-radius:10px;word-break:break-word}",
        /* toast + report modal */
        ".dwgm-toast{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);display:none;max-width:90%;padding:8px 16px;font-size:13px;color:#fff;background:#000;border-radius:999px;z-index:40;text-align:center}",
        ".dwgm-modal{position:fixed;top:0;left:0;width:100%;height:100%;z-index:5100;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.6)}",
        ".dwgm-modal.dwgm-active{display:flex}",
        ".dwgm-modalbox{display:flex;flex-direction:column;gap:12px;width:100%;max-width:360px;padding:20px;background:#fff;border:3px solid #000;border-radius:14px;box-shadow:5px 5px 0 #000}",
        ".dwgm-modalbox h3{margin:0;font-size:20px;font-weight:400;color:#000}",
        ".dwgm-modalbox p{margin:0;font-size:13px;color:#333}",
        ".dwgm-field{width:100%;padding:10px;font-family:inherit;font-size:16px;color:#000;background:#f8f9fa;border:2px solid #000;border-radius:8px}",
        ".dwgm-modalrow{display:flex;gap:10px}",
        ".dwgm-modalrow .dwgm-btn{flex:1;height:44px;font-size:15px}",
        ".dwgm-cancel{background:#ff6b6b;color:#fff}",
        ".dwgm-submit{background:#ffcc00}",
        "@media(max-width:420px){.dwgm-overlay{padding:8px}.dwgm-title{font-size:21px}.dwgm-icon{width:66px;height:66px}}"
    ].join("\n");

    /* ---------- DOM ---------- */
    var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="#000"><path d="M6 4l14 8-14 8z"/></svg>';
    var ICON_FORK = '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5" r="2.4"/><circle cx="18" cy="5" r="2.4"/><circle cx="12" cy="19" r="2.4"/><path d="M6 7.5v1.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.5M12 12v4.5"/></svg>';
    var ICON_SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';

    function build() {
        if (built) return;
        built = true;

        var style = document.createElement("style");
        style.textContent = CSS;
        document.head.appendChild(style);

        var root = document.createElement("div");
        root.className = "dwgm-overlay";
        root.id = "dwgm-overlay";
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-modal", "true");
        root.innerHTML =
            '<div class="dwgm-card" id="dwgm-card">' +
              '<div class="dwgm-scroll">' +
                '<div class="dwgm-head" id="dwgm-head">' +
                  '<div class="dwgm-topbar">' +
                    '<button type="button" class="dwgm-pill" id="dwgm-back">\u2190 ' + T("Back") + '</button>' +
                    '<div class="dwgm-menuwrap">' +
                      '<button type="button" class="dwgm-pill" id="dwgm-menubtn">' + T("Menu") + '</button>' +
                      '<div class="dwgm-dropdown" id="dwgm-dropdown">' +
                        '<button type="button" class="dwgm-ditem" id="dwgm-add-event" style="display:none">' + T("Add to Event") + '</button>' +
                        '<button type="button" class="dwgm-ditem" id="dwgm-report-game">' + T("Report") + '</button>' +
                        '<button type="button" class="dwgm-ditem" id="dwgm-report-creator">' + T("Report Creator") + '</button>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="dwgm-titlerow">' +
                    '<img class="dwgm-icon" id="dwgm-icon" alt="">' +
                    '<div><h2 class="dwgm-title" id="dwgm-title" data-no-i18n></h2><div class="dwgm-visits" id="dwgm-visits"></div></div>' +
                  '</div>' +
                '</div>' +
                '<div class="dwgm-actions">' +
                  '<button type="button" class="dwgm-btn dwgm-enter" id="dwgm-enter">' + ICON_PLAY + '<span>' + T("Enter") + '</span></button>' +
                  '<button type="button" class="dwgm-btn dwgm-fork" id="dwgm-fork">' + ICON_FORK + '<span>' + T("Fork") + '</span></button>' +
                  '<button type="button" class="dwgm-btn dwgm-share" id="dwgm-share" aria-label="' + T("Share") + '" title="' + T("Share") + '">' + ICON_SHARE + '</button>' +
                '</div>' +
                '<div class="dwgm-body">' +
                  '<div class="dwgm-likerow">' +
                    '<button type="button" class="dwgm-like" id="dwgm-like"><img src="like.png" alt=""><span id="dwgm-like-text"></span></button>' +
                  '</div>' +
                  '<div class="dwgm-creator">' +
                    '<img class="dwgm-pfp" id="dwgm-pfp" alt="">' +
                    '<div class="dwgm-cinfo">' +
                      '<div class="dwgm-crow"><a class="dwgm-cname" id="dwgm-cname" data-no-i18n></a>' +
                        '<button type="button" class="dwgm-follow" id="dwgm-follow">' + T("Follow") + '</button></div>' +
                      '<div class="dwgm-forked" id="dwgm-forked" style="display:none"></div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="dwgm-desc" id="dwgm-desc" data-no-i18n style="display:none"></div>' +
                  '<div class="dwgm-events" id="dwgm-events" data-no-i18n style="display:none"></div>' +
                  '<div class="dwgm-dates" id="dwgm-dates"></div>' +
                  '<div id="dwgm-comments"></div>' +
                '</div>' +
              '</div>' +
              '<div class="dwgm-toast" id="dwgm-toast"></div>' +
            '</div>' +
            '<div class="dwgm-modal" id="dwgm-report-modal">' +
              '<div class="dwgm-modalbox">' +
                '<h3 id="dwgm-report-title"></h3>' +
                '<p id="dwgm-report-prompt"></p>' +
                '<select class="dwgm-field" id="dwgm-report-reason"></select>' +
                '<textarea class="dwgm-field" id="dwgm-report-details" maxlength="200" style="resize:none;height:70px" placeholder="' + T("Optional details...") + '"></textarea>' +
                '<div class="dwgm-modalrow">' +
                  '<button type="button" class="dwgm-btn dwgm-cancel" id="dwgm-report-cancel">' + T("Cancel") + '</button>' +
                  '<button type="button" class="dwgm-btn dwgm-submit" id="dwgm-report-send">' + T("Send Report") + '</button>' +
                '</div>' +
              '</div>' +
            '</div>';
        document.body.appendChild(root);

        var sel = $("dwgm-report-reason");
        REASONS.forEach(function (r) {
            var o = document.createElement("option");
            o.value = r; o.textContent = T(r);
            sel.appendChild(o);
        });

        /* wiring */
        $("dwgm-back").onclick = close;
        root.addEventListener("mousedown", function (e) { if (e.target === root) close(); });
        $("dwgm-menubtn").onclick = function (e) { e.stopPropagation(); $("dwgm-dropdown").classList.toggle("dwgm-active"); };
        $("dwgm-card").addEventListener("click", function (e) {
            var dd = $("dwgm-dropdown");
            if (dd.classList.contains("dwgm-active") && !e.target.closest(".dwgm-menuwrap")) dd.classList.remove("dwgm-active");
        });
        $("dwgm-add-event").onclick = function () {
            $("dwgm-dropdown").classList.remove("dwgm-active");
            if (!S.gameId || !window.DWEvents || !DWEvents.addGame) return;
            DWEvents.addGame(S.gameId, { onChange: function (ids) { if (S.game) { S.game.eventIds = ids; renderEventLine(); } } });
        };
        $("dwgm-report-game").onclick = function () { openReport("game"); };
        $("dwgm-report-creator").onclick = function () { openReport("creator"); };
        $("dwgm-report-cancel").onclick = closeReport;
        $("dwgm-report-send").onclick = sendReport;
        $("dwgm-enter").onclick = function () { if (S.gameId) window.location.href = "play.html?id=" + encodeURIComponent(S.gameId); };
        $("dwgm-fork").onclick = function () { if (S.gameId) window.location.href = "editor.html?fork=" + encodeURIComponent(S.gameId); };
        $("dwgm-share").onclick = share;
        $("dwgm-like").onclick = toggleLike;
        $("dwgm-follow").onclick = toggleFollow;
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape" || !S.open) return;
            if (window.DWEvents && DWEvents.isOpen && DWEvents.isOpen()) return;   // the event window handles Escape first
            if ($("dwgm-report-modal").classList.contains("dwgm-active")) closeReport(); else close();
        });
    }

    function hookAuth() {
        if (authHooked) return;
        authHooked = true;
        try {
            S.user = firebase.auth().currentUser || null;
            firebase.auth().onAuthStateChanged(function (u) {
                S.user = u || null;
                if (S.open && S.game) refreshUserDependent();
            });
        } catch (e) { S.user = null; }
    }

    function toast(msg) {
        var t = $("dwgm-toast");
        t.textContent = T(msg);
        t.style.display = "block";
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.style.display = "none"; }, 2200);
    }

    /* ---------- open / close ---------- */
    function open(gameId) {
        build();
        hookAuth();
        var token = ++S.token;
        S.open = true; S.gameId = gameId; S.game = null;
        S.creatorId = null; S.creatorName = "";
        S.likes = []; S.following = false;

        $("dwgm-overlay").classList.add("dwgm-open");
        document.body.style.overflow = "hidden";
        $("dwgm-dropdown").classList.remove("dwgm-active");
        clearBanner();
        $("dwgm-title").textContent = T("Loading...");
        $("dwgm-icon").src = DEFAULT_ICON;
        $("dwgm-visits").textContent = "";
        $("dwgm-cname").textContent = "";
        $("dwgm-cname").removeAttribute("href");
        $("dwgm-pfp").src = DEFAULT_PFP;
        $("dwgm-follow").style.display = "none";
        $("dwgm-forked").style.display = "none";
        $("dwgm-events").style.display = "none";
        $("dwgm-dates").textContent = "";
        $("dwgm-desc").style.display = "none";
        $("dwgm-desc").textContent = "";
        $("dwgm-comments").textContent = "";
        paintLike();

        db().collection("games").doc(gameId).get().then(function (doc) {
            if (token !== S.token) return;
            if (!doc.exists) { alert("Game not found."); close(); return; }
            S.game = doc.data();
            renderGame();
            refreshUserDependent();
            loadCreator(token);
            mountComments(gameId);
        }).catch(function (err) {
            console.error("Game menu: could not load game", err);
            if (token !== S.token) return;
            alert("Could not load this game.");
            close();
        });
    }

    function close() {
        if (!built) return;
        S.open = false;
        S.token++;
        $("dwgm-overlay").classList.remove("dwgm-open");
        $("dwgm-dropdown").classList.remove("dwgm-active");
        closeReport();
        document.body.style.overflow = "";
    }

    /* ---------- game info ---------- */
    function renderGame() {
        var g = S.game;
        var icon = $("dwgm-icon");
        withFallback(icon, DEFAULT_ICON);
        icon.src = safeIcon(g.iconUrl);
        showBanner(g.bannerUrl);
        $("dwgm-title").textContent = g.title || T("Untitled Level");
        $("dwgm-visits").textContent = T((g.visits || 0) + " visits");

        var desc = $("dwgm-desc");
        var descText = (typeof g.description === "string") ? g.description.trim().slice(0, 500) : "";
        desc.textContent = descText;                       // plain text only, never HTML
        desc.style.display = descText ? "block" : "none";

        var lines = [];
        if (g.createdAt) lines.push(T("Created") + ": " + fmtDate(g.createdAt));
        if (g.updatedAt) lines.push(T("Updated") + ": " + fmtDate(g.updatedAt));
        var dates = $("dwgm-dates");
        dates.textContent = "";
        lines.forEach(function (l) { dates.appendChild(el("div", null, l)); });

        renderEventLine();

        S.creatorId = g.authorId || g.creatorId || null;
        if (S.creatorId === "anonymous_dev") S.creatorId = null;
        var cname = $("dwgm-cname");
        S.creatorName = g.creatorUsername || g.Username || "";
        cname.textContent = S.creatorName || T("Unknown Creator");
        $("dwgm-report-creator").style.display = S.creatorId ? "" : "none";
        if (S.creatorId) {
            cname.href = "userprofile.html?id=" + encodeURIComponent(S.creatorId);
            cname.onclick = function (e) { e.preventDefault(); window.location.href = cname.href; };
        }
    }

    // "In event: <title>" for every known event this game was entered in
    function renderEventLine() {
        var box = $("dwgm-events");
        if (!box) return;
        var ids = (S.game && Array.isArray(S.game.eventIds)) ? S.game.eventIds : [];
        var known = Array.isArray(window.DW_EVENTS) ? window.DW_EVENTS : [];
        var lang = (window.DWLang && DWLang.get) ? DWLang.get() : "en";
        var names = [];
        known.forEach(function (e) {
            if (ids.indexOf(e.id) === -1) return;
            var t = e.title;
            names.push(!t ? e.id : (typeof t === "string" ? t : (t[lang] || t.en || e.id)));
        });
        box.textContent = names.length ? T("In event") + ": " + names.join(", ") : "";
        box.style.display = names.length ? "block" : "none";
    }

    function loadCreator(token) {
        var g = S.game;
        if (S.creatorId) {
            getUser(S.creatorId).then(function (u) {
                if (token !== S.token) return;
                if (u.name) { S.creatorName = u.name; $("dwgm-cname").textContent = u.name; }
                var pfp = $("dwgm-pfp");
                withFallback(pfp, DEFAULT_PFP);
                pfp.src = safePfp(u.pfp);
            });
        }
        if (g.forkedFrom && g.forkedFrom.creatorId) {
            getUser(g.forkedFrom.creatorId).then(function (u) {
                if (token !== S.token) return;
                var f = $("dwgm-forked");
                f.textContent = T("Forked from") + " " + (u.name || T("Unknown Creator"));
                f.setAttribute("data-no-i18n", "");
                f.style.display = "block";
            });
        }
    }

    function refreshUserDependent() {
        var g = S.game;
        if (!g) return;
        S.likes = Array.isArray(g.likes) ? g.likes.slice() : [];
        paintLike();

        var fb = $("dwgm-follow");
        var mine = S.user && S.creatorId && S.user.uid === S.creatorId;
        var canEvent = mine && window.DWEvents && DWEvents.addGame && Array.isArray(window.DW_EVENTS) && window.DW_EVENTS.length > 0;
        $("dwgm-add-event").style.display = canEvent ? "" : "none";
        if (!S.creatorId || mine) {
            fb.style.display = "none";
        } else {
            fb.style.display = "";
            paintFollow();
            if (S.user) {
                var token = S.token;
                db().collection("users").doc(S.user.uid).get().then(function (d) {
                    if (token !== S.token) return;
                    var f = d.exists && Array.isArray(d.data().following) ? d.data().following : [];
                    S.following = f.indexOf(S.creatorId) !== -1;
                    paintFollow();
                }).catch(function () {});
            } else {
                S.following = false;
                paintFollow();
            }
        }
    }

    /* ---------- like ---------- */
    function isLiked() { return !!(S.user && S.likes.indexOf(S.user.uid) !== -1); }
    function paintLike() {
        var n = S.likes.length;
        var btn = $("dwgm-like");
        btn.classList.toggle("dwgm-liked", isLiked());
        btn.disabled = S.busyLike;
        $("dwgm-like-text").textContent = n + " " + T(n === 1 ? "like" : "likes");
    }
    function toggleLike() {
        if (!S.user) { alert("Log in to like games."); return; }
        if (S.busyLike || !S.gameId) return;
        var uid = S.user.uid, was = isLiked();
        S.busyLike = true;
        if (was) S.likes = S.likes.filter(function (x) { return x !== uid; }); else S.likes.push(uid);
        paintLike();
        db().collection("games").doc(S.gameId).update({
            likes: was ? FV().arrayRemove(uid) : FV().arrayUnion(uid)
        }).catch(function (err) {
            console.error("Game menu: like failed", err);
            if (was) S.likes.push(uid); else S.likes = S.likes.filter(function (x) { return x !== uid; });
            alert("Failed to update like.");
        }).then(function () {
            S.busyLike = false;
            if (S.game) S.game.likes = S.likes.slice();
            paintLike();
        });
    }

    /* ---------- follow ---------- */
    function paintFollow() {
        var b = $("dwgm-follow");
        b.classList.toggle("dwgm-following", S.following);
        b.textContent = T(S.following ? "Followed" : "Follow");
        b.disabled = S.busyFollow;
    }
    function toggleFollow() {
        if (!S.user) { alert("please sign into or create an account to follow users."); return; }
        if (S.busyFollow || !S.creatorId || S.user.uid === S.creatorId) return;
        var me = S.user.uid, them = S.creatorId, was = S.following;
        S.busyFollow = true;
        S.following = !was;
        paintFollow();
        var users = db().collection("users");
        var F = FV();
        users.doc(me).set({ following: was ? F.arrayRemove(them) : F.arrayUnion(them) }, { merge: true })
            .then(function () { return users.doc(them).set({ followers: was ? F.arrayRemove(me) : F.arrayUnion(me) }, { merge: true }); })
            .catch(function (err) {
                console.error("Game menu: follow failed", err);
                S.following = was;
                alert("Failed to update follow status.");
            }).then(function () { S.busyFollow = false; paintFollow(); });
    }

    /* ---------- share ---------- */
    // The browser's native share sheet is only used on phones/tablets. On desktop (especially Chrome on
    // Windows) it can crash the page, so there we just copy the link instead.
    function canNativeShare() {
        if (!navigator.share) return false;
        var ua = navigator.userAgent || "";
        var mobile = /Android|iPhone|iPad|iPod/i.test(ua) ||
                     (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);   // iPadOS reports as a Mac
        return mobile;
    }
    function share() {
        if (!S.gameId) return;
        var url = new URL("play.html?id=" + encodeURIComponent(S.gameId), window.location.href).href;
        var copy = function () {
            var done = function () { toast("Link copied!"); };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(done, function () { legacyCopy(url, done); });
            } else {
                legacyCopy(url, done);
            }
        };
        if (canNativeShare()) {
            try {
                var p = navigator.share({ url: url });
                if (p && p.catch) p.catch(function (err) { if (!err || err.name !== "AbortError") copy(); });
            } catch (e) { copy(); }
            return;
        }
        copy();
    }
    function legacyCopy(text, cb) {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); cb(); } catch (e) {}
        document.body.removeChild(ta);
    }

    /* ---------- comments (shared component, same look as the comments on posts) ---------- */
    function mountComments(gameId) {
        if (!window.DWComments) { console.error("Game menu: dwcomments.js is not loaded"); return; }
        DWComments.mount($("dwgm-comments"), {
            collection: function () { return db().collection("games").doc(gameId).collection("comments"); }
        });
    }

    /* ---------- reporting (Discord webhook) ---------- */
    function openReport(kind) {
        $("dwgm-dropdown").classList.remove("dwgm-active");
        if (!S.user) { alert("Please log in to send a report."); return; }
        S.reportKind = kind;
        $("dwgm-report-title").textContent = T(kind === "creator" ? "Report Creator" : "Report Game");
        $("dwgm-report-prompt").textContent = T(kind === "creator"
            ? "Please select a reason for reporting this creator:"
            : "Please select a reason for reporting this game:");
        $("dwgm-report-reason").selectedIndex = 0;
        $("dwgm-report-details").value = "";
        $("dwgm-report-modal").classList.add("dwgm-active");
    }
    function closeReport() {
        if (built) $("dwgm-report-modal").classList.remove("dwgm-active");
    }
    function clip(s, n) {
        s = String(s == null ? "" : s).replace(/`/g, "'");
        return s.length > n ? s.slice(0, n - 1) + "\u2026" : s;
    }

    function sendReport() {
        if (!S.user || !S.game) return;
        var last = 0;
        try { last = parseInt(localStorage.getItem(REPORT_KEY) || "0", 10) || 0; } catch (e) {}
        if (Date.now() - last < REPORT_COOLDOWN_MS) { alert("Please wait a bit before sending another report."); return; }

        var reason = $("dwgm-report-reason").value;
        var details = $("dwgm-report-details").value.trim();
        var btn = $("dwgm-report-send");
        btn.disabled = true;

        var base = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1);
        var gameLink = base + "play.html?id=" + encodeURIComponent(S.gameId);
        var creatorLink = S.creatorId ? base + "userprofile.html?id=" + encodeURIComponent(S.creatorId) : "N/A";

        getUser(S.user.uid).then(function (me) {
            var who = clip(me.name || "Unknown", 60) + " (`" + clip(S.user.uid, 40) + "`)";
            var lines = [
                S.reportKind === "creator" ? "\uD83D\uDEA8 **New Creator Report!**" : "\uD83D\uDEA8 **New Game Report!**",
                "\u2022 **Reporter:** " + who,
                "\u2022 **Reason:** " + clip(reason, 60)
            ];
            if (S.reportKind === "game") {
                lines.push("\u2022 **Game:** " + clip(S.game.title || "Untitled", 80) + " (`" + clip(S.gameId, 40) + "`)");
                lines.push("\u2022 **Creator:** " + clip(S.creatorName || "Unknown", 60) + " (`" + clip(S.creatorId || "N/A", 40) + "`)");
                lines.push("\u2022 **Game Link:** " + gameLink);
            } else {
                lines.push("\u2022 **Creator:** " + clip(S.creatorName || "Unknown", 60) + " (`" + clip(S.creatorId || "N/A", 40) + "`)");
                lines.push("\u2022 **Reported from game:** " + clip(S.game.title || "Untitled", 80) + " (`" + clip(S.gameId, 40) + "`)");
                lines.push("\u2022 **Profile Link:** " + creatorLink);
            }
            lines.push("\u2022 **Details:** " + (details ? clip(details, 200) : "None"));

            return fetch(REPORT_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: lines.join("\n").slice(0, 1900), allowed_mentions: { parse: [] } })
            });
        }).then(function (res) {
            if (res && (res.ok || res.status === 204)) {
                try { localStorage.setItem(REPORT_KEY, String(Date.now())); } catch (e) {}
                alert("Report sent. Thank you!");
                closeReport();
            } else {
                alert("Failed to send report. Please try again later.");
            }
        }).catch(function (err) {
            console.error("Game menu: report failed", err);
            alert("Failed to send report. Please try again later.");
        }).then(function () { btn.disabled = false; });
    }

    /* ---------- intercept game links ---------- */
    function gameIdFromLink(a) {
        try {
            var u = new URL(a.getAttribute("href"), window.location.href);
            if (!/\/play\.html$/i.test(u.pathname)) return null;
            if (u.searchParams.get("mode") === "test") return null;
            return u.searchParams.get("id");
        } catch (e) { return null; }
    }
    document.addEventListener("click", function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
        if (!a) return;
        var id = gameIdFromLink(a);
        if (!id) return;
        e.preventDefault();
        open(id);
    }, true);

    window.DWGameMenu = { open: open, close: close };
})();
