/* dwcoins.js - the ONE place that knows how Dev Coins are stored
 *
 * Every Dev Coins balance lives in a single field on the user's document:  users/{uid}.devCoins
 * Nothing else in the app should read or write "coins" / "DevCoins" / "devCoins" directly - use this:
 *
 *     DWCoins.FIELD                           -> "devCoins"
 *     DWCoins.getBalance(db, uid)             -> Promise<number>   (what the wallet shows)
 *     DWCoins.awardVisit(db, creatorId)       -> Promise<void>     (+1 coin when a player visits a game; call it
 *                                                                    AFTER the game's visit counter was incremented)
 *
 * Older accounts may still have their balance in a legacy field ("coins" or "DevCoins") or none at all
 * (the balance used to be the total visits of their games). Those balances are carried over into
 * devCoins the first time the account receives a coin, so nobody loses coins. Legacy fields are left in
 * place but never read again once devCoins exists.
 */
(function () {
    "use strict";
    if (window.DWCoins) return;

    var FIELD = "devCoins";
    var LEGACY_FIELDS = ["coins", "DevCoins"];   // checked in this order when devCoins is missing

    function num(v) {
        if (typeof v === "number" && isFinite(v)) return v;
        if (typeof v === "string" && v.trim() !== "" && isFinite(Number(v))) return Number(v);
        return undefined;
    }

    // devCoins first, then the legacy fields. Returns undefined when the account has no coin field at all.
    function balanceFromData(data) {
        if (!data) return undefined;
        var v = num(data[FIELD]);
        if (v !== undefined) return v;
        for (var i = 0; i < LEGACY_FIELDS.length; i++) {
            v = num(data[LEGACY_FIELDS[i]]);
            if (v !== undefined) return v;
        }
        return undefined;
    }

    // coins an account had before coin fields existed = total visits of the games they made
    function visitsTotal(db, uid) {
        return db.collection("games").where("authorId", "==", uid).get().then(function (snap) {
            var total = 0;
            snap.forEach(function (d) { total += num(d.data().visits) || 0; });
            return total;
        });
    }

    function getBalance(db, uid) {
        return db.collection("users").doc(uid).get().then(function (doc) {
            var v = doc.exists ? balanceFromData(doc.data()) : undefined;
            return v !== undefined ? v : visitsTotal(db, uid);
        });
    }

    function awardVisit(db, creatorId) {
        if (!creatorId) return Promise.resolve();
        var ref = db.collection("users").doc(creatorId);
        return ref.get().then(function (doc) {
            var data = doc.exists ? doc.data() : {};

            // normal case: already on the new field, add one atomically
            if (num(data[FIELD]) !== undefined) {
                var inc = {}; inc[FIELD] = firebase.firestore.FieldValue.increment(1);
                return ref.update(inc);
            }

            // first coin since the change: carry the old balance over, then add this visit
            var legacy = balanceFromData(data);
            if (legacy !== undefined) {
                var set1 = {}; set1[FIELD] = legacy + 1;
                return ref.set(set1, { merge: true });
            }

            // no coin field at all: their balance was their total visits (which already includes this one)
            return visitsTotal(db, creatorId).then(function (total) {
                var set2 = {}; set2[FIELD] = Math.max(total, 1);
                return ref.set(set2, { merge: true });
            });
        });
    }

    window.DWCoins = { FIELD: FIELD, balanceFromData: balanceFromData, getBalance: getBalance, awardVisit: awardVisit };
})();
