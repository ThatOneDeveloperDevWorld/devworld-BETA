#!/usr/bin/env node
/* build-content.js - turns the text files in  events/  and  announcements/  into the data files the app loads.
 *
 *   node build-content.js            (or:  npm run build:content)
 *
 * Why this exists: a web page cannot list the folders inside events/ and cannot read files straight from
 * your disk when you open home.html from a folder. So this script reads everything once and writes
 *   events/events-data.js
 *   announcements/announcements-data.js
 * which home.html loads. Run it again every time you add, edit or remove an event or announcement.
 *
 * Formats are explained in events/README.txt and announcements/README.txt.
 * No packages needed - only Node.
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(process.argv[2] || __dirname);
var EVENTS_DIR = path.join(ROOT, "events");
var ANN_DIR = path.join(ROOT, "announcements");
var LANGS = ["en", "es", "ja"];
var IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

var problems = { errors: 0, warnings: 0 };
function error(where, msg) { problems.errors++; console.log("  ERROR   " + where + ": " + msg); }
function warn(where, msg) { problems.warnings++; console.log("  warning " + where + ": " + msg); }

/* ---------- parsing the simple "key: value" text format ---------- */
// known: { key: { lang: true|false } }   - lang:true means "key.es: ..." style translations are allowed
function parseFields(text, known, where) {
    var fields = {};        // key -> { en: "...", es: "..." }   (non-translated keys use "en")
    var lines = text.replace(/\r\n?/g, "\n").split("\n");
    var current = null;     // { key, lang }
    lines.forEach(function (raw) {
        var line = raw;
        if (/^\s*\/\//.test(line)) return;                       // comment line
        var m = /^([A-Za-z]+)(?:\.([a-z]{2}))?\s*:(.*)$/.exec(line);
        if (m && Object.prototype.hasOwnProperty.call(known, m[1].toLowerCase())) {
            var key = m[1].toLowerCase(), lang = m[2] || "en";
            if (m[2] && !known[key]) { warn(where, '"' + key + "." + lang + '" - ' + key + " cannot be translated, ignored"); current = null; return; }
            if (m[2] && LANGS.indexOf(lang) === -1) { warn(where, 'unknown language "' + lang + '" (use ' + LANGS.join(", ") + ")"); current = null; return; }
            fields[key] = fields[key] || {};
            if (fields[key][lang] !== undefined) warn(where, '"' + key + (m[2] ? "." + lang : "") + '" appears twice, using the last one');
            fields[key][lang] = m[3].replace(/^\s/, "");
            current = { key: key, lang: lang };
            return;
        }
        if (current) { fields[current.key][current.lang] += "\n" + line; return; }   // continuation line
        if (line.trim() !== "") warn(where, 'text before the first "key:" line was ignored: "' + line.trim().slice(0, 40) + '"');
    });
    Object.keys(fields).forEach(function (k) {
        Object.keys(fields[k]).forEach(function (l) { fields[k][l] = fields[k][l].replace(/\s+$/, ""); });
    });
    return fields;
}

function texts(field) {   // { en:.., es:.. } without empty values
    var out = {};
    if (!field) return out;
    Object.keys(field).forEach(function (l) { if (field[l] !== "") out[l] = field[l]; });
    return out;
}
function plain(field) { return field && field.en !== undefined ? field.en : ""; }

/* ---------- dates ---------- */
// "2026-12-31", "2026-12-31 23:59", "2026-12-31 23:59 UTC", "2026-12-31 18:00 -06:00", "2026-12-31T23:59:59Z"
// no time zone = UTC.  a date with no time means the END of that day (23:59:59).
function parseDate(str, endOfDayIfNoTime) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?\s*(Z|UTC|[+-]\d{2}:?\d{2})?$/i.exec(String(str).trim());
    if (!m) return null;
    var hasTime = m[4] !== undefined;
    var h = hasTime ? +m[4] : (endOfDayIfNoTime ? 23 : 0);
    var mi = hasTime ? +m[5] : (endOfDayIfNoTime ? 59 : 0);
    var s = hasTime ? (m[6] ? +m[6] : 0) : (endOfDayIfNoTime ? 59 : 0);
    var ms = Date.UTC(+m[1], +m[2] - 1, +m[3], h, mi, s);
    var check = new Date(ms);
    if (check.getUTCMonth() !== +m[2] - 1 || check.getUTCDate() !== +m[3] || h > 23 || mi > 59 || s > 59) return null;   // e.g. 2026-02-31
    var tz = m[7];
    if (tz && !/^(Z|UTC)$/i.test(tz)) {
        var sign = tz[0] === "-" ? -1 : 1, digits = tz.replace(/[^0-9]/g, "");
        ms -= sign * (+digits.slice(0, 2) * 60 + +digits.slice(2, 4)) * 60000;
    }
    return new Date(ms);
}

function isColor(v) { return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v); }
function safeUrl(v) { return /^(https?:\/\/|[A-Za-z0-9_\-./?=&#%]+$)/i.test(v) && !/^\s*(javascript|data|vbscript):/i.test(v); }
function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); }

/* ---------- events ---------- */
var EVENT_KEYS = { title: true, description: true, order: false, banner: false, end: false, background: false, text: false, accent: false, button: true, entries: false };

function buildEvents() {
    var events = [];
    if (!fs.existsSync(EVENTS_DIR)) { console.log("events/ folder not found - writing an empty list"); return events; }
    var folders = fs.readdirSync(EVENTS_DIR).filter(function (n) {
        return !/^[._]/.test(n) && fs.statSync(path.join(EVENTS_DIR, n)).isDirectory();
    }).sort();
    folders.forEach(function (folder) {
        var where = "events/" + folder;
        var file = path.join(EVENTS_DIR, folder, "event.txt");
        if (!fs.existsSync(file)) { error(where, "no event.txt file in this folder (it was skipped)"); return; }
        var f = parseFields(fs.readFileSync(file, "utf8"), EVENT_KEYS, where + "/event.txt");

        var title = texts(f.title);
        if (!title.en) { error(where, 'event.txt needs a "title:" line (it was skipped)'); return; }

        var endIso = null;
        if (f.end && plain(f.end)) {
            var d = parseDate(plain(f.end), true);
            if (!d) { error(where, 'could not read "end: ' + plain(f.end) + '" - use a form like  end: 2026-12-31 23:59 UTC  (it was skipped)'); return; }
            endIso = d.toISOString();
        } else {
            warn(where, 'no "end:" line - this event never ends');
        }

        var order = null;
        if (f.order && plain(f.order) !== "") {
            if (/^-?\d+$/.test(plain(f.order).trim())) order = parseInt(plain(f.order), 10);
            else warn(where, '"order: ' + plain(f.order) + '" is not a whole number - it will be placed last');
        } else {
            warn(where, 'no "order:" line - it will be placed last');
        }

        // banner: named in event.txt, or auto-detected as banner.png / banner.jpg / ...
        var banner = null;
        var named = f.banner && plain(f.banner).trim();
        if (named) {
            if (/[\\/]/.test(named) || IMAGE_EXTS.indexOf(path.extname(named).toLowerCase()) === -1) warn(where, '"banner: ' + named + '" must be an image file name inside the event folder (png, jpg, gif, webp)');
            else if (!fs.existsSync(path.join(EVENTS_DIR, folder, named))) warn(where, 'banner file "' + named + '" was not found in the folder - showing the event without a banner');
            else banner = "events/" + folder + "/" + named;
        } else {
            for (var i = 0; i < IMAGE_EXTS.length && !banner; i++) {
                if (fs.existsSync(path.join(EVENTS_DIR, folder, "banner" + IMAGE_EXTS[i]))) banner = "events/" + folder + "/banner" + IMAGE_EXTS[i];
            }
            if (!banner) warn(where, "no banner image (add banner.png to the folder or a banner: line)");
        }

        var theme = {};
        ["background", "text", "accent"].forEach(function (k) {
            var v = f[k] && plain(f[k]).trim();
            if (!v) return;
            if (isColor(v)) theme[k] = v; else warn(where, '"' + k + ": " + v + '" is not a hex colour like #ff8800 - using the default');
        });

        var button = null;
        if (f.button && plain(f.button)) {
            var parts = plain(f.button).split("|");
            var url = (parts[1] || "").trim();
            var label = (parts[0] || "").trim();
            if (!label || !url) warn(where, '"button:" must look like   button: Label | page.html   (ignored)');
            else if (!safeUrl(url)) warn(where, 'button link "' + url + '" is not allowed - use a page name like editor.html or an https:// link (ignored)');
            else {
                var labels = { en: label };
                Object.keys(f.button).forEach(function (l) { if (l !== "en" && f.button[l].trim()) labels[l] = f.button[l].split("|")[0].trim(); });
                button = { label: labels, url: url };
            }
        }

        // entries: off  -> hide the "Add a game" / "Entries" buttons for this event (default: on)
        var entries = true;
        if (f.entries && plain(f.entries).trim() !== "") {
            var ev = plain(f.entries).trim().toLowerCase();
            if (["off", "no", "false", "0"].indexOf(ev) !== -1) entries = false;
            else if (["on", "yes", "true", "1"].indexOf(ev) === -1) warn(where, '"entries: ' + plain(f.entries) + '" should be  entries: on  or  entries: off  - using on');
        }

        events.push({
            id: folder,
            order: order,
            title: title,
            description: texts(f.description),
            banner: banner,
            end: endIso,
            theme: theme,
            button: button,
            entries: entries
        });
    });

    // list order: by "order" number (events with no number go last), ties by folder name
    events.sort(function (a, b) {
        var ao = a.order === null ? Infinity : a.order, bo = b.order === null ? Infinity : b.order;
        return ao !== bo ? (ao < bo ? -1 : 1) : (a.id < b.id ? -1 : 1);
    });
    var seen = {};
    events.forEach(function (e) {
        if (e.order === null) return;
        if (seen[e.order]) warn("events/" + e.id, "same order number " + e.order + " as events/" + seen[e.order] + " (sorted by folder name)");
        else seen[e.order] = e.id;
    });
    return events;
}

/* ---------- announcements ---------- */
var ANN_KEYS = { id: false, date: false, title: true, body: true };

function buildAnnouncements() {
    var out = [];
    var file = path.join(ANN_DIR, "announcements.txt");
    if (!fs.existsSync(file)) { console.log("announcements/announcements.txt not found - writing an empty list"); return out; }
    var text = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
    var blocks = text.split(/^\s*-{3,}\s*$/m);
    blocks.forEach(function (block, index) {
        var content = block.split("\n").filter(function (l) { return !/^\s*\/\//.test(l); }).join("\n");
        if (content.trim() === "") return;
        var where = "announcements.txt entry " + (index + 1);
        var f = parseFields(block, ANN_KEYS, where);
        var title = texts(f.title), body = texts(f.body);
        if (!title.en) { error(where, 'needs a "title:" line (it was skipped)'); return; }
        if (!plain(f.date)) { error(where, 'needs a "date:" line like  date: 2026-11-22  (it was skipped)'); return; }
        var d = parseDate(plain(f.date), false);
        if (!d) { error(where, 'could not read "date: ' + plain(f.date) + '" (it was skipped)'); return; }
        if (!body.en) warn(where, 'no "body:" text');
        var id = (plain(f.id) || "").trim() || (d.toISOString().slice(0, 10) + "-" + slug(title.en));
        out.push({ id: id, date: d.toISOString(), title: title, body: body, _n: index });
    });
    out.sort(function (a, b) { return a.date !== b.date ? (a.date < b.date ? 1 : -1) : b._n - a._n; });   // newest first
    var ids = {};
    out.forEach(function (a) {
        if (ids[a.id]) error("announcements.txt", 'two entries have the id "' + a.id + '" - give one of them an "id:" line');
        ids[a.id] = true;
        delete a._n;
    });
    return out;
}

/* ---------- write ---------- */
function write(file, varName, data, what) {
    var header = "/* GENERATED by build-content.js - do not edit by hand. Edit the .txt files and run:  node build-content.js */\n";
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, header + "window." + varName + " = " + JSON.stringify(data, null, 2) + ";\n", "utf8");
    console.log("  wrote " + path.relative(ROOT, file) + "  (" + data.length + " " + what + (data.length === 1 ? "" : "s") + ")");
}

console.log("Dev World content build  (" + ROOT + ")\n");
console.log("Events:");
var events = buildEvents();
console.log("\nAnnouncements:");
var anns = buildAnnouncements();
console.log("");
write(path.join(EVENTS_DIR, "events-data.js"), "DW_EVENTS", events, "event");
write(path.join(ANN_DIR, "announcements-data.js"), "DW_ANNOUNCEMENTS", anns, "announcement");
console.log("\n" + (problems.errors ? problems.errors + " error(s) - the entries mentioned above were skipped. " : "") +
            (problems.warnings ? problems.warnings + " warning(s). " : "") + (problems.errors || problems.warnings ? "" : "All good. "));
events.forEach(function (e) {
    console.log("  #" + (e.order === null ? "-" : e.order) + "  " + (e.title.en) + "  -  " + (e.end ? "ends " + e.end.replace("T", " ").replace(".000Z", " UTC") : "never ends"));
});
process.exit(problems.errors ? 1 : 0);
