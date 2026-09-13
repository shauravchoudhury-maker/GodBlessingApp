// analytics.js — a daily visitor count, and nothing else.
//
// WHAT THIS IS. One number for our own read: how many people opened the
// site today. It uses GoatCounter, chosen because it sets no cookie, stores
// no IP address, needs no consent banner under GDPR/ePrivacy guidance for
// cookieless counting, and is open source. We see counts by day and page,
// not people. privacy.html says exactly this, in the same words.
//
// WHAT IT IS NOT. Not advertising, not sessions, not a user id, not on the
// blessing form's contents (the beacon carries the path and referrer only,
// never anything typed). It respects the browser's Do Not Track and Global
// Privacy Control signals by not loading at all.
//
// SWITCHING IT ON. Create a GoatCounter site (free for non-commercial use)
// at goatcounter.com and put its code below: "eververse" means the site is
// https://eververse.goatcounter.com. Empty = off, and no script loads.
// Then, for the daily check to read yesterday's count: Settings → API →
// create a token with "read statistics", and save it as the only line of
//   C:\Users\shaur\.claude\scheduled-tasks\eververse-daily-check\goatcounter.token
// (that folder is outside the repo; never commit the token).
const ANALYTICS = { site: "" };

(function () {
  if (!ANALYTICS.site) return;
  if (typeof navigator === "undefined") return;
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true) return;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", "https://" + ANALYTICS.site + ".goatcounter.com/count");
  // Count the path only. A request's secret link (?k=…) or a guide's tab
  // (?v=guide) must never reach a third party, so the query string is
  // stripped before the beacon is sent.
  s.setAttribute("data-goatcounter-settings", JSON.stringify({ path: location.pathname }));
  document.head.appendChild(s);
})();
