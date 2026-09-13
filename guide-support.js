// guide-support.js
// How guides are supported, and the two things support must never become.
//
// THE PROBLEM. A circle of pure volunteers runs out of volunteers. The
// apps that do have humans on tap (Keen, AstroTalk, Nebula) keep them by
// paying per minute — and the meter is exactly what makes those products
// feel predatory. So the question is: how do you give a guide a real
// reason to stay, without turning a blessing into a transaction?
//
// THE MODEL. Four layers, cheapest first, and none of them per reply.
//
//  1. COSTS NEVER LAND ON THE GUIDE. Identity check, background check,
//     training: EverVerse pays, always. (Already true; restated here so the
//     list is complete.)
//
//  2. A RECORD OF SERVICE. Months in the circle, blessings written,
//     standing reached, languages served — kept as facts, and printed on
//     request as a signed letter of service. Seminaries, chaplaincy
//     programmes (CPE), counselling licensure boards, universities and
//     employers all ask for exactly this, and most volunteers never get
//     it. It costs nothing and it is the thing people actually keep.
//
//  3. THE GUIDE FUND. A pot that is SEPARATE from gifts — gifts go to the
//     partner charities untouched, as giving.js promises. The fund is
//     filled by three things: the share of tips to EverVerse named below,
//     sponsors (a parish, temple, mosque or employer that covers its own
//     guides at a flat monthly amount), and grants. It pays a FLAT MONTHLY
//     STIPEND — the same amount to every guide who was present that month.
//     Not per reply. Not per word. Not more for "top" guides, because the
//     moment one guide earns more than another for answering more, we have
//     rebuilt the meter and quality goes the way it always goes.
//
//  4. BELONGING. A monthly circle call, a steward who reads your replies
//     and writes back, a name on the guides page if you want it there.
//     This is ops, not code, but it is the layer that keeps most people.
//
// THE TWO GUARD RAILS. Each exists because a promise already made elsewhere
// would break without it.
//
//  A. NEVER FROM THE ASKER, NEVER PER BLESSING. The person who asked pays
//     nothing and never learns whether their guide is stipended; the
//     guide never learns whether anyone gave anything (G6). The stipend
//     is decided by presence over a month, from counts — never from any
//     one request, reply, rating or thank-you. NEVER_IN_SUPPORT below
//     refuses the copy that would drift there.
//
//  B. NEVER PROMISED BEFORE IT EXISTS. Like PARTNERS in giving.js, the
//     fund's sponsor list is empty until an agreement is signed, and the
//     guides page says "not open yet" until then. A stipend announced and
//     not paid is worse than none.

/* What every guide gets, in the order they get it. Shown on the guides
   page and in the guide's own profile — one list, one wording. */
const SUPPORT_LAYERS = [
  { key: "costs",   title: "Every check is paid for",
    text: "Identity verification, background check and training cost you nothing. EverVerse pays, always." },
  { key: "record",  title: "A record of service",
    text: "Months in the circle, blessings written, languages served and standing reached — kept as facts, and printed as a signed letter of service whenever you ask. Chaplaincy programmes, seminaries, licensure boards and employers accept it." },
  { key: "fund",    title: "A flat monthly stipend from the Guide Fund",
    text: "When the fund is open, every guide who was present that month receives the same amount. Never per reply, never from the person who asked, never more for writing more." },
  { key: "circle",  title: "A circle of your own",
    text: "A monthly call with the other guides, and a steward who reads your replies and writes back to you." },
];

/* The Guide Fund. Sources are stated; sponsors are empty until signed. */
const FUND = {
  // Share of each tip to EverVerse that is ring-fenced for the fund. Tips
  // already pay for checks, moderation and hosting (PLATFORM_SHARE_PAYS_FOR
  // in giving.js); this is the part of them that reaches guides.
  tipShare: 0.5,
  sources: [
    "half of every tip a giver chooses to add for EverVerse",
    "sponsors — an institution that covers its own guides at a flat monthly amount",
    "grants, once there is a registered charity to receive them",
  ],
  // Never list a sponsor without a signed agreement — the guides page prints
  // this list, and "sponsored by X" is a promise X has to have made.
  sponsors: [],
};

/* The stipend. One number, the same for everyone eligible. */
const STIPEND = {
  monthly: 40,          // USD, flat, per present guide per month
  currency: "USD",
  minReplies: 4,        // "present" = at least this many blessings in the month …
  minTier: 1,           // … as a listener or above, not on probation …
  noUpheldReport: true, // … with no report upheld against them that month.
  maxReplies: null,     // deliberately NO upper band. More replies never earn more.
};

/* What a guide may choose to do with a stipend. Declining is always one of
   the choices and is never preselected to anything else. */
const SUPPORT_CHOICES = [
  { key: "stipend", label: "Receive the stipend" },
  { key: "charity", label: "Send mine to the partner charity of my faith" },
  { key: "decline", label: "I would rather stay unpaid" },
];
const SUPPORT_DEFAULT = "stipend";

function fundOpen() { return FUND.sponsors.length > 0; }

/* Present or not, for one month, from counts a steward can verify. `month`
   is { replies, upheldReports }. Returns every reason, not just the first,
   so the guide is told exactly what would change it. */
function stipendEligible(g, month, tierOf) {
  const why = [];
  const m = month || {};
  if (!g || g.suspended === true) why.push("suspended");
  else {
    if (g.probation === true) why.push("first replies not yet read");
    if (typeof tierOf === "function" && tierOf(g) < STIPEND.minTier) why.push("not yet a listener");
    if ((m.replies || 0) < STIPEND.minReplies)
      why.push("fewer than " + STIPEND.minReplies + " blessings this month (" + (m.replies || 0) + ")");
    if (STIPEND.noUpheldReport && (m.upheldReports || 0) > 0) why.push("a report was upheld this month");
    if ((g.supportChoice || SUPPORT_DEFAULT) === "decline") why.push("chose to stay unpaid");
  }
  return { ok: why.length === 0, why };
}

/* How much each present guide is paid this month. Equal shares, capped at
   the stipend; when the fund cannot cover everyone at the full amount,
   everyone gets the same smaller amount — never "the first N", never "the
   best N". Amounts in whole cents. */
function monthlyPayout(fundBalance, eligibleCount) {
  const bal = Math.max(0, Math.round(Number(fundBalance || 0) * 100));
  const n = Math.max(0, Math.floor(Number(eligibleCount || 0)));
  if (!n || !bal) return { each: 0, total: 0, shortfall: n * STIPEND.monthly, covered: false };
  const full = Math.round(STIPEND.monthly * 100);
  const each = Math.min(full, Math.floor(bal / n));
  return { each: each / 100, total: (each * n) / 100,
           shortfall: Math.max(0, (full - each) * n) / 100, covered: each === full };
}

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
    who + " has served as a volunteer guide in the EverVerse Blessing Circle" +
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

/* Never. Mirrors NEVER_IN_GIVING: copy that would turn support back into a
   meter, or link money to the person who asked. */
const NEVER_IN_SUPPORT = [
  // "never per reply" is the promise; "$2 per reply" is the breach.
  { re: /(?<!\b(?:never|not|nor)\s)\b(per|each|every)\s+(reply|blessing|message|answer|word|minute)\b/i,
    why: "Pays per reply. The stipend is flat and monthly; presence, not volume." },
  { re: /\b(earn|bonus|commission|rate|payout|leaderboard|top\s+guides?|best\s+guides?|rank)\b/i,
    why: "Frames guiding as earning or as a contest between guides." },
  { re: /\b(asker|person who asked|requester|they)\b.{0,40}\b(pays?|paid|tip|fund|cover)/i,
    why: "Links the money to the person who asked. They never pay and never know." },
  { re: /\b(thank|tip|reward)\s+(your|the|this)\s+guide\b/i,
    why: "Turns a blessing into a transaction." },
  { re: /\b(guaranteed|every month you will|you will receive)\b/i,
    why: "Promises a stipend the fund may not be able to pay. Say what the fund does when it is open." },
];
function checkSupportCopy(text) {
  const hit = NEVER_IN_SUPPORT.find((r) => r.re.test(String(text || "")));
  return hit ? { ok: false, why: hit.why } : { ok: true, why: "" };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SUPPORT_LAYERS, FUND, STIPEND, SUPPORT_CHOICES, SUPPORT_DEFAULT, fundOpen,
                     stipendEligible, monthlyPayout, serviceRecord, serviceLetter,
                     NEVER_IN_SUPPORT, checkSupportCopy };
}
