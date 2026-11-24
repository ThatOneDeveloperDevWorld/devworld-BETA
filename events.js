/* events.js - the Announcements and Events buttons at the top of the home page
 *
 * The page needs two buttons:   <button id="announce-btn">   and   <button id="events-btn">
 * Their icons are  app.announce.png  and  game-events.png  (a simple drawn icon is used if a file is missing).
 *
 * Creators can enter their games in a running event ("Add a game") and everyone can browse the entries.
 *
 * Content comes from two generated files (see build-content.js):
 *     announcements/announcements-data.js   ->  window.DW_ANNOUNCEMENTS
 *     events/events-data.js                 ->  window.DW_EVENTS
 * If they are missing the windows just say there is nothing yet.
 */
(function () {
    "use strict";

    var SEEN_ANN = "devworld_seen_announcements";
    var SEEN_EVENTS = "devworld_seen_events";
    var LOCALES = { en: "en-US", es: "es-ES", ja: "ja-JP" };
    var ICON_ANN = "app.announce.png";
    var ICON_EVENTS = "game-events.png";

    var SVG_ANN = '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4h3l8 5V5L6 10H3z" fill="#ffb703"/><path d="M17.5 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11"/></svg>';
    var SVG_EVENTS = '<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="#5ce1e6"/><path d="M8 3v4M16 3v4M3.5 10h17"/><path d="M12 12.2l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z" fill="#ffb703" stroke-width="1.4"/></svg>';

    /* ---------- helpers ---------- */
    function T(s) { try { return (window.DWLang && DWLang.t) ? DWLang.t(s) : s; } catch (e) { return s; } }
    function lang() { try { return (window.DWLang && DWLang.get) ? DWLang.get() : "en"; } catch (e) { return "en"; } }
    function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

    // text that may be a plain string or { en: "...", es: "..." }
    function pick(v) {
        if (!v) return "";
        if (typeof v === "string") return v;
        return v[lang()] || v.en || v[Object.keys(v)[0]] || "";
    }
    function fmtDate(iso, withTime) {
        var d = new Date(iso);
        if (isNaN(d.getTime())) return "";
        var opts = withTime ? { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
                            : { year: "numeric", month: "short", day: "numeric" };
        try { return d.toLocaleString(LOCALES[lang()] || "en-US", opts); } catch (e) { return d.toLocaleString(); }
    }
    function readSeen(key) {
        try { var v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; }
    }
    function writeSeen(key, ids) { try { localStorage.setItem(key, JSON.stringify(ids)); } catch (e) {} }

    function isColor(v) { return typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v); }
    function isBannerPath(p) { return typeof p === "string" && /^events\/[A-Za-z0-9_\-.]+\/[A-Za-z0-9_\-.]+\.(png|jpe?g|gif|webp)$/i.test(p); }
    function isSafeUrl(u) { return typeof u === "string" && /^(https?:\/\/|[A-Za-z0-9_\-.\/?=&#%]+$)/i.test(u) && !/^\s*(javascript|data|vbscript):/i.test(u); }

    function remaining(ms) {
        var d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
        if (d > 0) return d + "d " + h + "h";
        if (h > 0) return h + "h " + m + "m";
        return Math.max(m, 1) + "m";
    }

    function announcements() { return Array.isArray(window.DW_ANNOUNCEMENTS) ? window.DW_ANNOUNCEMENTS : []; }
    function allEvents() { return Array.isArray(window.DW_EVENTS) ? window.DW_EVENTS : []; }
    function isActive(e, now) { return !e.end || Date.parse(e.end) > now; }

    /* ---------- styles ---------- */
    var CSS = [
        ".dwe-iconbtn{position:relative;width:46px;height:46px;padding:0;display:flex;align-items:center;justify-content:center;background:#fff;border:3px solid #000;border-radius:12px;box-shadow:2px 2px 0 #000;cursor:pointer;transition:transform .1s ease}",
        ".dwe-iconbtn:active{transform:translate(1px,1px);box-shadow:1px 1px 0 #000}",
        ".dwe-iconbtn img,.dwe-iconbtn svg{width:28px;height:28px;object-fit:contain;display:block}",
        ".dwe-dot{position:absolute;top:-7px;right:-7px;width:15px;height:15px;background:#ff3b3b;border:2px solid #000;border-radius:50%}",
        ".dwe-dot[hidden]{display:none}",
        ".dwe-overlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:4500;display:none;align-items:center;justify-content:center;padding:14px;background:rgba(0,0,0,.65);font-family:'Cherry Bomb One',cursive,sans-serif;color:#212529}",
        ".dwe-overlay.dwe-open{display:flex}",
        ".dwe-overlay *{box-sizing:border-box}",
        ".dwe-card{display:flex;flex-direction:column;width:100%;max-width:460px;max-height:100%;background:#fff;border:4px solid #000;border-radius:20px;box-shadow:0 8px 0 #000;overflow:hidden}",
        ".dwe-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:#5ce1e6;border-bottom:4px solid #000}",
        ".dwe-head h2{margin:0;font-size:22px;font-weight:400;color:#000}",
        ".dwe-close{padding:7px 14px;font-family:inherit;font-size:13px;color:#000;background:#fff;border:2px solid #000;border-radius:10px;box-shadow:2px 2px 0 #000;cursor:pointer}",
        ".dwe-body{display:flex;flex-direction:column;gap:14px;padding:14px;overflow-y:auto;-webkit-overflow-scrolling:touch}",
        ".dwe-empty{padding:18px 0;text-align:center;font-size:14px;color:#777}",
        ".dwe-newtag{display:inline-block;margin-left:6px;padding:1px 8px;font-size:10px;vertical-align:middle;color:#fff;background:#ff3b3b;border:2px solid #000;border-radius:999px}",
        /* announcements */
        ".dwe-ann{padding:10px 12px;background:#f8f9fa;border:2px solid #000;border-radius:12px;box-shadow:2px 2px 0 #000}",
        ".dwe-ann.dwe-new{background:#fff7cc}",
        ".dwe-ann h3{margin:0;font-size:17px;font-weight:400;color:#000;word-break:break-word}",
        ".dwe-date{margin-top:2px;font-size:11px;color:#777}",
        ".dwe-annbody{margin-top:8px;font-size:14px;line-height:1.4;color:#222;white-space:pre-wrap;word-break:break-word;font-family:Arial,Helvetica,sans-serif}",
        /* events */
        ".dwe-section{margin:2px 0 -6px;font-size:14px;color:#555}",
        ".dwe-event{overflow:hidden;background:var(--dwe-bg,#fff);color:var(--dwe-tx,#000);border:3px solid #000;border-radius:14px;box-shadow:3px 3px 0 #000}",
        ".dwe-banner{display:block;width:100%;height:130px;object-fit:cover;background:#ddd;border-bottom:3px solid #000}",
        ".dwe-eb{display:flex;flex-direction:column;gap:7px;padding:10px 12px 12px}",
        ".dwe-et{margin:0;font-size:19px;font-weight:400;color:var(--dwe-tx,#000);word-break:break-word}",
        ".dwe-ed{font-size:14px;line-height:1.4;white-space:pre-wrap;word-break:break-word;font-family:Arial,Helvetica,sans-serif;color:var(--dwe-tx,#000)}",
        ".dwe-pill{align-self:flex-start;padding:3px 11px;font-size:12px;color:#000;background:var(--dwe-ac,#5ce1e6);border:2px solid #000;border-radius:999px}",
        ".dwe-until{font-size:11px;opacity:.75}",
        ".dwe-ebtn{align-self:flex-start;padding:8px 16px;font-family:inherit;font-size:14px;color:#000;background:var(--dwe-ac,#5ce1e6);border:3px solid #000;border-radius:10px;box-shadow:2px 2px 0 #000;cursor:pointer}",
        ".dwe-event.dwe-ended{opacity:.6}",
        ".dwe-event.dwe-ended .dwe-banner{filter:grayscale(1)}",
        ".dwe-event.dwe-ended .dwe-pill{background:#ced4da}",
        /* entering games in events */
        ".dwe-overlay.dwe-top{z-index:5200}",
        ".dwe-head h2{flex:1;min-width:0}",
        ".dwe-btnrow{display:flex;flex-wrap:wrap;gap:8px}",
        ".dwe-ebtn.dwe-alt{background:#fff}",
        ".dwe-sub{font-size:14px;line-height:1.35;color:#555;word-break:break-word}",
        ".dwe-sub b{font-weight:400;font-size:17px;color:#000}",
        ".dwe-row{display:flex;align-items:center;gap:10px;padding:8px 10px;background:#f8f9fa;border:2px solid #000;border-radius:12px;box-shadow:2px 2px 0 #000}",
        ".dwe-rowclick{cursor:pointer}",
        ".dwe-rowclick:hover{background:#e2e6ea}",
        ".dwe-rowicon{width:46px;height:46px;flex:none;object-fit:cover;background:#fff;border:2px solid #000;border-radius:10px}",
        ".dwe-rowinfo{flex:1;min-width:0}",
        ".dwe-rowtitle{font-size:16px;color:#000;word-break:break-word}",
        ".dwe-rowmeta{margin-top:2px;font-size:11px;color:#777;word-break:break-word}",
        ".dwe-rowbtn{flex:none;padding:7px 14px;font-family:inherit;font-size:13px;color:#000;background:#55ff55;border:2px solid #000;border-radius:10px;box-shadow:2px 2px 0 #000;cursor:pointer}",
        ".dwe-rowbtn.dwe-on{background:#ffbe0b}",
        ".dwe-rowbtn:disabled{opacity:.6;cursor:default}",
        ".dwe-msg{padding:4px 0;text-align:center;font-size:14px;color:#555}"
    ].join("\n");

    /* ---------- state ---------- */
    var built = false, styled = false, timer = null, active = null;   // active: "ann" | "events" | null
    var annDot, evDot, overlay, titleEl, bodyEl, backBtn;
    var view = "events", viewToken = 0, prevOverflow = "", backAction = null;   // view: ann | events | picker | entries | choose

    function iconNode(src, svg, alt) {
        var wrap = el("span");
        wrap.style.display = "flex";
        var img = new Image();
        img.alt = alt;
        img.onerror = function () { wrap.innerHTML = svg; };      // no picture file yet -> drawn icon
        img.src = src;
        wrap.appendChild(img);
        return wrap;
    }

    function updateDots() {
        var now = Date.now();
        var seenA = readSeen(SEEN_ANN), seenE = readSeen(SEEN_EVENTS);
        if (annDot) annDot.hidden = !announcements().some(function (a) { return seenA.indexOf(a.id) === -1; });
        if (evDot) evDot.hidden = !allEvents().some(function (e) { return isActive(e, now) && seenE.indexOf(e.id) === -1; });
    }

    function ensureStyle() {
        if (styled) return;
        styled = true;
        var style = document.createElement("style");
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    /* ---------- the shared window ---------- */
    function build() {
        if (built) return;
        built = true;
        ensureStyle();

        overlay = el("div", "dwe-overlay");
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        var card = el("div", "dwe-card");
        var head = el("div", "dwe-head");
        titleEl = el("h2");
        var close = el("button", "dwe-close", T("Close")); close.type = "button";
        close.onclick = closeWindow;
        backBtn = el("button", "dwe-close dwe-back", "\u2190 " + T("Back")); backBtn.type = "button"; backBtn.style.display = "none";
        backBtn.onclick = function () { if (backAction) backAction(); };
        head.appendChild(backBtn); head.appendChild(titleEl); head.appendChild(close);
        bodyEl = el("div", "dwe-body");
        card.appendChild(head); card.appendChild(bodyEl);
        overlay.appendChild(card);
        overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) closeWindow(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape" && active) closeWindow(); });
        document.body.appendChild(overlay);
    }

    function openWindow(kind) {
        build();
        active = kind; view = kind;
        viewToken++;
        overlay.classList.remove("dwe-top");
        backBtn.style.display = "none"; backAction = null;
        titleEl.textContent = T(kind === "ann" ? "Announcements" : "Events");
        if (!overlay.classList.contains("dwe-open")) prevOverflow = document.body.style.overflow;
        overlay.classList.add("dwe-open");
        document.body.style.overflow = "hidden";
        clearInterval(timer);
        if (kind === "ann") renderAnnouncements(); else { renderEvents(); timer = setInterval(renderEvents, 30000); }
        bodyEl.scrollTop = 0;
    }
    function closeWindow() {
        if (!built) return;
        active = null;
        viewToken++;
        clearInterval(timer);
        overlay.classList.remove("dwe-open");
        overlay.classList.remove("dwe-top");
        document.body.style.overflow = prevOverflow;
        prevOverflow = "";
    }

    /* ---------- announcements ---------- */
    function renderAnnouncements() {
        var list = announcements();
        var seen = readSeen(SEEN_ANN);
        bodyEl.textContent = "";
        if (!list.length) { bodyEl.appendChild(el("div", "dwe-empty", T("No announcements yet."))); }
        list.forEach(function (a) {
            var isNew = seen.indexOf(a.id) === -1;
            var item = el("div", "dwe-ann" + (isNew ? " dwe-new" : ""));
            var h = el("h3", null, pick(a.title)); h.setAttribute("data-no-i18n", "");
            if (isNew) h.appendChild(el("span", "dwe-newtag", T("New")));
            item.appendChild(h);
            item.appendChild(el("div", "dwe-date", fmtDate(a.date, false)));
            var body = el("div", "dwe-annbody", pick(a.body)); body.setAttribute("data-no-i18n", "");
            if (body.textContent) item.appendChild(body);
            bodyEl.appendChild(item);
        });
        writeSeen(SEEN_ANN, list.map(function (a) { return a.id; }));     // opening them counts as reading them
        updateDots();
    }

    /* ---------- events ---------- */
    function eventCard(e, now, isNew) {
        var ended = !isActive(e, now);
        var card = el("div", "dwe-event" + (ended ? " dwe-ended" : ""));
        var th = e.theme || {};
        if (isColor(th.background)) card.style.setProperty("--dwe-bg", th.background);
        if (isColor(th.text)) card.style.setProperty("--dwe-tx", th.text);
        if (isColor(th.accent)) card.style.setProperty("--dwe-ac", th.accent);

        if (isBannerPath(e.banner)) {
            var img = new Image();
            img.className = "dwe-banner"; img.alt = "";
            img.onerror = function () { if (img.parentNode) img.parentNode.removeChild(img); };   // missing file -> no banner
            img.src = e.banner;
            card.appendChild(img);
        }
        var b = el("div", "dwe-eb");
        var t = el("h3", "dwe-et", pick(e.title)); t.setAttribute("data-no-i18n", "");
        if (isNew && !ended) t.appendChild(el("span", "dwe-newtag", T("New")));
        b.appendChild(t);
        var desc = pick(e.description);
        if (desc) { var d = el("div", "dwe-ed", desc); d.setAttribute("data-no-i18n", ""); b.appendChild(d); }

        if (e.end) {
            var left = Date.parse(e.end) - now;
            b.appendChild(el("span", "dwe-pill", ended ? T("Ended") : T("Ends in") + " " + remaining(left)));
            b.appendChild(el("div", "dwe-until", T(ended ? "Ended" : "Ends") + ": " + fmtDate(e.end, true)));
        }
        if (!ended && e.button && isSafeUrl(e.button.url) && pick(e.button.label)) {
            var btn = el("button", "dwe-ebtn", pick(e.button.label)); btn.type = "button";
            btn.setAttribute("data-no-i18n", "");
            btn.onclick = function () {
                if (/^https?:\/\//i.test(e.button.url)) window.open(e.button.url, "_blank", "noopener");
                else window.location.href = e.button.url;
            };
            b.appendChild(btn);
        }
        if (e.entries !== false && hasFirebase()) {
            var row = el("div", "dwe-btnrow");
            if (!ended) {
                var add = el("button", "dwe-ebtn", T("Add a game")); add.type = "button";
                add.onclick = function () { showPicker(e); };
                row.appendChild(add);
            }
            var ent = el("button", "dwe-ebtn dwe-alt", T("Entries")); ent.type = "button";
            ent.onclick = function () { showEntries(e); };
            row.appendChild(ent);
            b.appendChild(row);
        }
        card.appendChild(b);
        return card;
    }

    function renderEvents() {
        var now = Date.now();
        var seen = readSeen(SEEN_EVENTS);
        var running = allEvents().filter(function (e) { return isActive(e, now); });         // already in "order" order
        var past = allEvents().filter(function (e) { return !isActive(e, now); })
                              .sort(function (a, b) { return Date.parse(b.end) - Date.parse(a.end); });   // most recent first
        var scroll = bodyEl.scrollTop;
        bodyEl.textContent = "";
        if (!running.length) { bodyEl.appendChild(el("div", "dwe-empty", T("No events right now. Check back soon!"))); }
        running.forEach(function (e) { bodyEl.appendChild(eventCard(e, now, seen.indexOf(e.id) === -1)); });
        if (past.length) {
            bodyEl.appendChild(el("div", "dwe-section", T("Past events")));
            past.forEach(function (e) { bodyEl.appendChild(eventCard(e, now, false)); });
        }
        bodyEl.scrollTop = scroll;
        writeSeen(SEEN_EVENTS, running.map(function (e) { return e.id; }));
        updateDots();
    }

    /* ---------- entering games in events (needs firebase on the page) ----------
     * A game is "in" an event when its document has the event's id in  games/{id}.eventIds  (an array).
     * Only the creator can add / remove their own game, and only while the event is running.
     */
    var ICON_EXTS = [".png", ".jpg", ".jpeg", ".gif"];
    var DEFAULT_ICON = "gameres.png";
    var ENTRY_FETCH = 100;
    var nameCache = {};

    function hasFirebase() {
        try { return !!(window.firebase && firebase.apps && firebase.apps.length && firebase.firestore); } catch (e) { return false; }
    }
    function db() { return firebase.firestore(); }
    function curUser() { try { return firebase.auth().currentUser || null; } catch (e) { return null; } }
    function acceptsEntries(e, now) { return e.entries !== false && isActive(e, now); }
    function tsMs(ts) { try { return ts && typeof ts.toDate === "function" ? ts.toDate().getTime() : 0; } catch (e) { return 0; } }
    function hasEntry(g, eventId) { return Array.isArray(g.eventIds) && g.eventIds.indexOf(eventId) !== -1; }
    function safeIcon(url) {
        if (!url || typeof url !== "string") return DEFAULT_ICON;
        var clean = url.split("?")[0].split("#")[0].toLowerCase();
        for (var i = 0; i < ICON_EXTS.length; i++) if (clean.slice(-ICON_EXTS[i].length) === ICON_EXTS[i]) return url;
        return DEFAULT_ICON;
    }
    function userName(uid) {
        if (!nameCache[uid]) {
            nameCache[uid] = db().collection("users").doc(uid).get().then(function (d) {
                var u = d.exists ? d.data() : {};
                return u.Username || u.username || "";
            }).catch(function () { return ""; });
        }
        return nameCache[uid];
    }
    function openGame(id) {
        if (window.DWGameMenu && DWGameMenu.open) DWGameMenu.open(id);
        else window.location.href = "play.html?id=" + encodeURIComponent(id);
    }

    function fetchMyGames(uid) {
        return db().collection("games").where("authorId", "==", uid).get().then(function (snap) {
            var out = [];
            snap.forEach(function (d) { var g = d.data(); g._id = d.id; out.push(g); });
            out.sort(function (a, b) { return tsMs(b.createdAt) - tsMs(a.createdAt); });
            return out;
        });
    }
    function setEntry(gameId, eventId, on) {
        var FV = firebase.firestore.FieldValue;
        return db().collection("games").doc(gameId).update({ eventIds: on ? FV.arrayUnion(eventId) : FV.arrayRemove(eventId) });
    }
    // Dev Points check (dwpermissions.js) - read-only / banned accounts cannot change their games
    function guardEntry() {
        if (window.DWPerms && DWPerms.guard) return DWPerms.guard("enterEvent");
        return Promise.resolve(true);
    }

    // switch the shared window to a sub-view; returns a token so slow loads can tell they are stale
    function enterView(name, title, onBack) {
        build();
        clearInterval(timer);
        view = name; active = name;
        titleEl.textContent = T(title);
        backBtn.style.display = ""; backAction = onBack;
        if (!overlay.classList.contains("dwe-open")) prevOverflow = document.body.style.overflow;
        overlay.classList.add("dwe-open");
        document.body.style.overflow = "hidden";
        bodyEl.textContent = ""; bodyEl.scrollTop = 0;
        return ++viewToken;
    }
    function eventHeader(ev, text) {
        var box = el("div", "dwe-sub");
        var t = el("b", null, pick(ev.title)); t.setAttribute("data-no-i18n", "");
        box.appendChild(t);
        if (text) box.appendChild(el("div", null, T(text)));
        return box;
    }
    function gameRow(title, iconUrl, metaNode, clickId) {
        var row = el("div", "dwe-row");
        var img = new Image(); img.className = "dwe-rowicon"; img.alt = "";
        img.onerror = function () { img.onerror = null; img.src = DEFAULT_ICON; };
        img.src = safeIcon(iconUrl);
        var info = el("div", "dwe-rowinfo");
        var t = el("div", "dwe-rowtitle", title || T("Untitled Level")); t.setAttribute("data-no-i18n", "");
        info.appendChild(t);
        if (metaNode) info.appendChild(metaNode);
        row.appendChild(img); row.appendChild(info);
        if (clickId) { row.classList.add("dwe-rowclick"); row.onclick = function () { openGame(clickId); }; }
        return row;
    }
    function entryButton() { var b = el("button", "dwe-rowbtn"); b.type = "button"; return b; }

    // add / remove one game in one event; g needs _id and eventIds
    function toggleEntry(g, ev, btn, paint, note, onDone) {
        if (!acceptsEntries(ev, Date.now())) { note.textContent = T("Ended"); return; }
        var on = !hasEntry(g, ev.id);
        btn.disabled = true;
        guardEntry().then(function (ok) {
            if (!ok) { btn.disabled = false; return; }
            return setEntry(g._id, ev.id, on).then(function () {
                var ids = Array.isArray(g.eventIds) ? g.eventIds.filter(function (x) { return x !== ev.id; }) : [];
                if (on) ids.push(ev.id);
                g.eventIds = ids;
                note.textContent = T(on ? "Game added to the event!" : "Game removed from the event.");
                paint(); btn.disabled = false;
                if (onDone) { try { onDone(ids); } catch (e) {} }
            });
        }).catch(function (err) {
            console.error("Events: could not update the game", err);
            note.textContent = T("Could not update the game. Try again.");
            btn.disabled = false;
        });
    }

    // Events card -> "Add a game": pick one of YOUR games to enter in this event
    function showPicker(ev) {
        var token = enterView("picker", "Add a game", function () { openWindow("events"); });
        bodyEl.appendChild(eventHeader(ev, "Choose a game to enter in this event."));
        var note = el("div", "dwe-msg");
        bodyEl.appendChild(note);
        var u = curUser();
        if (!u) { note.textContent = T("Log in to enter a game."); return; }
        note.textContent = T("Loading...");
        fetchMyGames(u.uid).then(function (games) {
            if (token !== viewToken) return;
            note.textContent = "";
            if (!games.length) {
                note.textContent = T("You have no games yet.");
                var mk = el("button", "dwe-ebtn", T("Create a game")); mk.type = "button";
                mk.onclick = function () { window.location.href = "editor.html"; };
                bodyEl.appendChild(mk);
                return;
            }
            games.forEach(function (g) {
                var meta = el("div", "dwe-rowmeta"); meta.setAttribute("data-no-i18n", "");
                var btn = entryButton();
                var paint = function () {
                    var on = hasEntry(g, ev.id);
                    btn.textContent = T(on ? "Remove" : "Add");
                    btn.className = "dwe-rowbtn" + (on ? " dwe-on" : "");
                    meta.textContent = on ? T("In this event") : T((g.visits || 0) + " visits");
                };
                paint();
                btn.onclick = function () { toggleEntry(g, ev, btn, paint, note); };
                var row = gameRow(g.title, g.iconUrl, meta, null);
                row.appendChild(btn);
                bodyEl.appendChild(row);
            });
        }).catch(function (err) {
            console.error("Events: could not load games", err);
            if (token === viewToken) note.textContent = T("Could not load games.");
        });
    }

    // Events card -> "Entries": every game entered in this event
    function showEntries(ev) {
        var token = enterView("entries", "Entries", function () { openWindow("events"); });
        bodyEl.appendChild(eventHeader(ev));
        var note = el("div", "dwe-msg"); note.textContent = T("Loading...");
        bodyEl.appendChild(note);
        db().collection("games").where("eventIds", "array-contains", ev.id).limit(ENTRY_FETCH).get().then(function (snap) {
            if (token !== viewToken) return;
            var list = [];
            snap.forEach(function (d) { var g = d.data(); g._id = d.id; list.push(g); });
            list.sort(function (a, b) { return (b.visits || 0) - (a.visits || 0); });
            note.setAttribute("data-no-i18n", "");
            note.textContent = list.length ? T("Entries") + ": " + list.length + (list.length >= ENTRY_FETCH ? "+" : "") : T("No entries yet. Be the first!");
            list.forEach(function (g) {
                var meta = el("div", "dwe-rowmeta"); meta.setAttribute("data-no-i18n", "");
                var base = T((g.visits || 0) + " visits");
                meta.textContent = base;
                var cid = g.authorId || g.creatorId;
                if (cid && cid !== "anonymous_dev") userName(cid).then(function (n) {
                    if (n && token === viewToken) meta.textContent = T("By") + " " + n + " \u00b7 " + base;
                });
                bodyEl.appendChild(gameRow(g.title, g.iconUrl, meta, g._id));
            });
        }).catch(function (err) {
            console.error("Events: could not load entries", err);
            if (token === viewToken) note.textContent = T("Could not load entries.");
        });
    }

    // Game menu -> "Add to Event": pick which running event to enter ONE game in
    function showChoose(gameId, opts) {
        if (!hasFirebase()) return;
        var token = enterView("choose", "Add to Event", closeWindow);
        overlay.classList.add("dwe-top");                 // sits above the game menu
        var note = el("div", "dwe-msg");
        bodyEl.appendChild(note);
        var u = curUser();
        if (!u) { note.textContent = T("Log in to enter a game."); return; }
        note.textContent = T("Loading...");
        db().collection("games").doc(gameId).get().then(function (doc) {
            if (token !== viewToken) return;
            var g = doc.exists ? doc.data() : null;
            if (!g || (g.authorId || g.creatorId) !== u.uid) { note.textContent = T("You can only enter your own games."); return; }
            g._id = gameId;
            var now = Date.now();
            var running = allEvents().filter(function (e) { return acceptsEntries(e, now); });
            if (!running.length) { note.textContent = T("No events are open for entries right now."); return; }
            note.textContent = T("Choose an event for this game.");
            running.forEach(function (ev) {
                var meta = el("div", "dwe-rowmeta"); meta.setAttribute("data-no-i18n", "");
                var btn = entryButton();
                var paint = function () {
                    var on = hasEntry(g, ev.id);
                    btn.textContent = T(on ? "Remove" : "Add");
                    btn.className = "dwe-rowbtn" + (on ? " dwe-on" : "");
                    meta.textContent = ev.end ? T("Ends in") + " " + remaining(Date.parse(ev.end) - Date.now()) : "";
                };
                paint();
                btn.onclick = function () { toggleEntry(g, ev, btn, paint, note, opts && opts.onChange); };
                var row = el("div", "dwe-row");
                var info = el("div", "dwe-rowinfo");
                var t = el("div", "dwe-rowtitle", pick(ev.title)); t.setAttribute("data-no-i18n", "");
                info.appendChild(t); info.appendChild(meta);
                row.appendChild(info); row.appendChild(btn);
                bodyEl.appendChild(row);
            });
        }).catch(function (err) {
            console.error("Events: could not load the game", err);
            if (token === viewToken) note.textContent = T("Could not load games.");
        });
    }

    /* ---------- wire the two top buttons ---------- */
    function init() {
        var annBtn = document.getElementById("announce-btn");
        var evBtn = document.getElementById("events-btn");
        if (!annBtn && !evBtn) return;
        ensureStyle();

        if (annBtn) {
            annBtn.classList.add("dwe-iconbtn");
            annBtn.setAttribute("aria-label", T("Announcements"));
            annBtn.title = T("Announcements");
            annBtn.appendChild(iconNode(ICON_ANN, SVG_ANN, T("Announcements")));
            annDot = el("span", "dwe-dot"); annDot.hidden = true;
            annBtn.appendChild(annDot);
            annBtn.onclick = function () { openWindow("ann"); };
        }
        if (evBtn) {
            evBtn.classList.add("dwe-iconbtn");
            evBtn.setAttribute("aria-label", T("Events"));
            evBtn.title = T("Events");
            evBtn.appendChild(iconNode(ICON_EVENTS, SVG_EVENTS, T("Events")));
            evDot = el("span", "dwe-dot"); evDot.hidden = true;
            evBtn.appendChild(evDot);
            evBtn.onclick = function () { openWindow("events"); };
        }
        updateDots();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
    window.DWEvents = {
        open: openWindow,
        close: closeWindow,
        addGame: showChoose,                                   // DWEvents.addGame(gameId, { onChange: function (eventIds) {} })
        isOpen: function () { return !!(built && overlay.classList.contains("dwe-open")); }
    };
})();
