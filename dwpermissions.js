/* dwpermissions.js - Dev Points permissions
 *
 *   90 - 100   full access
 *   80 - 89    read-only mode: no commenting, posting, publishing games, or changing
 *              username / bio / profile picture (liking and following still work)
 *   79 or less banned (same limit profile.html already uses)
 *
 * Usage (always asks the database, so a change made by an admin applies immediately):
 *     DWPerms.guard("comment").then(function (ok) { if (!ok) return; ...do the thing... });
 *
 * Actions: "comment", "post", "publish", "enterEvent", "editProfile" are blocked in read-only mode.
 *          "like", "follow" (and anything else) are only blocked for banned accounts.
 *
 * IMPORTANT: this runs in the browser, so it is only the friendly layer (clear messages, hidden
 * dead ends). The real enforcement has to live in your Firestore security rules - see
 * firestore.rules.devpoints-example.
 */
(function () {
    "use strict";
    if (window.DWPerms) return;

    var ADMIN_UID = "ccZGPg7EzbNphnL0du3msMFIpjJ3";   // same admin account the other pages use
    var RESTRICT_BELOW = 90;
    var BAN_AT_OR_BELOW = 79;
    var DEFAULT_POINTS = 100;

    // action -> end of the message "You need at least 90 to ..."  (full sentences so they can be translated)
    var RESTRICTED = {
        comment: "Your Dev Points are {n}. You need at least 90 to comment.",
        post: "Your Dev Points are {n}. You need at least 90 to post.",
        publish: "Your Dev Points are {n}. You need at least 90 to publish games.",
        enterEvent: "Your Dev Points are {n}. You need at least 90 to enter games in events.",
        editProfile: "Your Dev Points are {n}. You need at least 90 to change your username, bio or profile picture."
    };

    function currentUser() {
        try { return firebase.auth().currentUser || null; } catch (e) { return null; }
    }

    // -> Promise<{points, banned, restricted, admin}> or {loggedOut:true}
    function status() {
        var u = currentUser();
        if (!u) return Promise.resolve({ loggedOut: true });
        if (u.uid === ADMIN_UID) return Promise.resolve({ points: DEFAULT_POINTS, banned: false, restricted: false, admin: true });
        return firebase.firestore().collection("users").doc(u.uid).get().then(function (d) {
            var data = d.exists ? d.data() : {};
            var pts = (typeof data.devPoints === "number") ? data.devPoints : DEFAULT_POINTS;
            return {
                points: pts,
                banned: data.isBanned === true || pts <= BAN_AT_OR_BELOW,
                restricted: pts < RESTRICT_BELOW,
                admin: false
            };
        });
    }

    // -> Promise<boolean>. Shows the reason (via alert, so it is translated) when the action is not allowed.
    function guard(action) {
        return status().then(function (s) {
            if (s.loggedOut) return true;          // callers already handle "please log in"
            if (s.banned) {
                alert("Your account has been banned.");
                setTimeout(function () { window.location.href = "ban.html"; }, 300);
                return false;
            }
            if (s.restricted && RESTRICTED[action]) {
                alert(RESTRICTED[action].replace("{n}", String(s.points)));
                return false;
            }
            return true;
        }).catch(function (err) {
            // if the lookup itself fails (offline, rules), do not block here - the server rules decide
            console.error("DWPerms: could not check Dev Points", err);
            return true;
        });
    }

    window.DWPerms = { guard: guard, status: status, RESTRICT_BELOW: RESTRICT_BELOW, BAN_AT_OR_BELOW: BAN_AT_OR_BELOW };
})();
