// guide-support.js
// What a guide gets for staying — and the one thing it must not become.
//
// THE DECISION (13 September 2026). The Circle stays a free service with
// unpaid guides. Reassess in December 2026, once there are guides to ask.
// The apps that keep humans on tap (Keen, AstroTalk, Nebula) do it by
// paying per minute, and the meter is exactly what makes those products
// feel predatory; if a payback model is ever added it will be flat, never
// per reply, never from the person who asked — but that is a later
// decision, not this file's.
//
// THE MODEL, for now. Three things, none of them money.
//
//  1. COSTS NEVER LAND ON THE GUIDE. Identity check, background check,
//     training: EverVerse pays, always. (Already true; restated so the
//     list is complete.)
//
//  2. A RECORD OF SERVICE. Months in the circle, blessings written,
//     standing reached, languages served — kept as facts, and printed on
//     request as a signed letter of service. Seminaries, chaplaincy
//     programmes (CPE), counselling licensure boards, universities and
//     employers all ask for exactly this, and most volunteers never get
//     it. It costs nothing and it is the thing people actually keep.
//
//  3. BELONGING. A monthly circle call, a steward who reads your replies
//     and writes back, a name on the guides page if you want it there.
//     This is ops, not code, but it is the layer that keeps most people.
//
// THE GUARD RAIL. Nothing here is a rating, a rank, or a comparison
// between guides. The record is counts and dates; the letter says what
// they did and what we did not check. A "top guides" list would be the
// first step back toward the meter.

/* What every guide gets, in the order they get it. Shown on the guides
   page and in the guide's own profile — one list, one wording. */
const SUPPORT_LAYERS = [
  { key: "costs",   title: "Every check is paid for",
    text: "Identity verification, background check and training cost you nothing. EverVerse pays, always." },
  { key: "record",  title: "A record of service",
    text: "Months in the circle, blessings written, languages served and standing reached — kept as facts, and printed as a signed letter of service whenever you ask. Chaplaincy programmes, seminaries, licensure boards and employers accept it." },
  { key: "circle",  title: "A circle of your own",
    text: "A monthly call with the other guides, and a steward who reads your replies and writes back to you." },
];

/* When the unpaid decision is looked at again. Printed nowhere; here so
   the date is in the code next to the decision it belongs to. */
const REASSESS_ON = "2026-12-13";

/* The record of service, as facts. `counts` is { replies, replies30d,
   languages }, gathered by the app from the guide's own replies. Nothing
   here is a rating, a rank, or a comparison with anyone else. */
function serviceRecord(g, counts, today, tierOf, tiers) {
  const c = counts || {};
  const since = g && g.approvedAt ? String(g.approvedAt).slice(0, 10) : null;
  const months = since ? Math.max(0, Math.floor((new Date(today || Date.now()) - new Date(since)) / (30.44 * 864e5))) : 0;
  const t = typeof tierOf === "function" ? tierOf(g) : 0;
  const standing = tiers && tiers[t] ? tiers[t].label : "";
  return {
    since, months,
    replies: c.replies || 0, replies30d: c.replies30d || 0,
    languages: (c.languages && c.languages.length) ? c.languages : (g && g.languages) || [],
    traditions: (g && g.tradition) || [],
    standing, idVerified: !!(g && g.idVerifiedAt),
    probation: !!(g && g.probation),
  };
}

/* The letter. Fixed wording, so it says the same thing for every guide and
   nobody softens or inflates it on a busy day. Plain text; the app prints it. */
function serviceLetter(name, rec, today, labelFor, langLabel) {
  const d = new Date(today || Date.now());
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const lab = typeof labelFor === "function" ? labelFor : (x) => x;
  const ll = typeof langLabel === "function" ? langLabel : (x) => x;
  const who = (name || "This guide").trim();
  const faiths = rec.traditions.map(lab).join(", ") || "their tradition";
  const langs = rec.languages.map(ll).join(", ") || "English";
  const lines = [
    "EverVerse — Blessing Circle",
    "Letter of service",
    "",
    date,
    "",
    "To whom it may concern,",
    "",
    who + " has served as an unpaid volunteer guide in the EverVerse Blessing Circle" +
      (rec.since ? " since " + rec.since : "") + (rec.months ? " (" + rec.months + " months)" : "") + ".",
    "",
    "In that time they have written " + rec.replies + " blessing" + (rec.replies === 1 ? "" : "s") +
      " to people who asked for one, answering from the " + faiths + " tradition" +
      (rec.traditions.length > 1 ? "s" : "") + ", in " + langs + ".",
    "",
    "Every blessing on EverVerse is written by a person, in their own words; no AI writes, suggests or edits any part of one." +
      (rec.idVerified ? " This guide's identity has been confirmed by EverVerse." : "") +
      (rec.standing ? " Their standing in the circle is " + rec.standing.toLowerCase() + "," +
        " which is derived from facts recorded by other people, never from ratings." : ""),
    "",
    "Guides are volunteers offering prayer, scripture and reflection. They are not clinicians, and this letter makes no claim about training or qualification.",
    "",
    "Questions about this letter can be sent to the address on eververse.org/trust.html.",
    "",
    "EverVerse",
  ];
  return lines.join("\n");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SUPPORT_LAYERS, REASSESS_ON, serviceRecord, serviceLetter };
}
