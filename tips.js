// tips.js
// The tip engine's model: rails per country, the ledger's shape, and the
// roll-ups that turn tips into a printed number. No network, no secrets.
// The reasoning is in TIPS.txt; the giving model itself is in giving.js and
// nothing here changes it.
//
// THE FIRST RULE. EverVerse never holds a gift, a balance, or a payout.
// The charity is merchant of record; the tip is a platform fee; a licensed
// processor holds funds in between. Every function below assumes that, and
// none of them can move money.

const NO_CUSTODY = true;   // do not add a balance to anything. See TIPS.txt §2.

/* How people actually pay in each starter country, and which licensed
   processor we accept it through. "wallets" are the giver's own — Apple
   Pay, PIX, UPI, M-Pesa — never an EverVerse wallet. `live` flips to true
   per country only when that country is green on the Regions panel: we do
   not take money where we cannot yet answer. */
const RAILS = {
  US: { currency: "USD", processor: "stripe",   wallets: ["card", "apple_pay", "google_pay", "link"],            live: false },
  BR: { currency: "BRL", processor: "stripe",   wallets: ["pix", "card"],                                       live: false },
  MX: { currency: "MXN", processor: "stripe",   wallets: ["card", "oxxo", "spei"],                              live: false },
  IN: { currency: "INR", processor: "razorpay", wallets: ["upi", "card", "netbanking"],                          live: false,
        note: "Domestic only. A foreign gift to an Indian charity needs the charity's FCRA registration — refuse cross-border until confirmed." },
  PH: { currency: "PHP", processor: "xendit",   wallets: ["gcash", "maya", "card"],                             live: false },
  ID: { currency: "IDR", processor: "xendit",   wallets: ["qris", "gopay", "ovo", "dana", "card"],              live: false },
  NG: { currency: "NGN", processor: "paystack", wallets: ["card", "bank_transfer", "ussd"],                     live: false },
  KE: { currency: "KES", processor: "paystack", wallets: ["mpesa", "card"],                                     live: false },
  ZA: { currency: "ZAR", processor: "paystack", wallets: ["card", "eft", "snapscan"],                           live: false },
};

function railFor(cc) { return RAILS[cc] || null; }
function railLive(cc) { const r = RAILS[cc]; return !!(r && r.live); }

/* Bounds the worker enforces server-side, whatever the page sent. Minor
   units. A tip larger than the gift is a mistake, not generosity. */
const LIMITS = {
  minGiftMinor: 100,          // $1.00 — same as MIN_GIFT in giving.js
  maxGiftMinor: 500000,       // $5,000 — above this a person talks to the charity directly
  maxTipShare: 0.15,          // TIP_OPTIONS tops out at 15 %
};

/* One ledger entry. Numbers and codes only — no name, email, card, address
   or IP; the processor holds those under its own regulation. Written only
   by the webhook worker; never updated; corrections are new entries. */
const LEDGER_KINDS = ["gift", "refund", "dispute", "adjust"];
const LEDGER_FIELDS = ["at", "kind", "gift", "tip", "feeProcessor", "coversFees", "currency",
                       "charityId", "faith", "giverCountry", "rail", "processor", "status"];
const NEVER_IN_LEDGER = ["name", "email", "phone", "card", "last4", "address", "ip", "ua", "note", "requestId", "guide", "guideId", "responseId"];

function validateLedgerEntry(e) {
  const why = [];
  if (!e || typeof e !== "object") return { ok: false, why: ["not an object"] };
  Object.keys(e).forEach((k) => {
    if (NEVER_IN_LEDGER.indexOf(k) !== -1) why.push("identity or blessing field in ledger: " + k);
    if (LEDGER_FIELDS.indexOf(k) === -1 && NEVER_IN_LEDGER.indexOf(k) === -1) why.push("unknown field: " + k);
  });
  if (LEDGER_KINDS.indexOf(e.kind) === -1) why.push("kind must be one of " + LEDGER_KINDS.join("|"));
  ["gift", "tip", "feeProcessor"].forEach((k) => {
    if (!Number.isInteger(e[k]) || e[k] < 0) why.push(k + " must be a non-negative integer in minor units");
  });
  if (Number.isInteger(e.gift) && Number.isInteger(e.tip)) {
    if (e.kind === "gift" && e.gift < LIMITS.minGiftMinor) why.push("gift below minimum");
    if (e.gift > LIMITS.maxGiftMinor) why.push("gift above maximum");
    if (e.tip > Math.round(e.gift * LIMITS.maxTipShare)) why.push("tip above " + Math.round(LIMITS.maxTipShare * 100) + "% of gift");
  }
  if (typeof e.currency !== "string" || e.currency.length !== 3) why.push("currency must be a 3-letter code");
  if (!e.charityId) why.push("charityId missing");
  if (!e.giverCountry || !RAILS[e.giverCountry]) why.push("giverCountry missing or not a starter");
  if (typeof e.at !== "string" || isNaN(Date.parse(e.at))) why.push("at must be an ISO time");
  return { ok: why.length === 0, why };
}

/* The month's numbers, from ledger rows. This is what stats/latest carries
   (tips30d, giftsToCharity30d, feeTotal30d) so Health and the daily check
   see money the same way they see requests: as counts, without a person
   signing in. Refunds and disputes subtract; adjustments add or subtract. */
function rollup(entries, sinceISO, currency) {
  const since = sinceISO ? Date.parse(sinceISO) : 0;
  const cur0 = currency || "USD";
  // Money totals are in ONE currency; rows in other currencies are counted
  // in byCurrency only. Never add rupees to dollars.
  const out = { currency: cur0, gifts: 0, giftsToCharity: 0, tips: 0, feeProcessor: 0, refunds: 0, disputes: 0,
                byFaith: {}, byCountry: {}, byCurrency: {}, tipRate: 0, coveredFees: 0 };
  let tipped = 0;
  (entries || []).forEach((e) => {
    if (Date.parse(e.at) < since) return;
    const cur = e.currency || "???";
    if (cur !== cur0) { out.byCurrency[cur] = (out.byCurrency[cur] || 0) + (e.kind === "refund" || e.kind === "dispute" ? -1 : 1) * (e.gift + e.tip); return; }
    const sign = e.kind === "refund" || e.kind === "dispute" ? -1 : 1;
    if (e.kind === "gift") { out.gifts++; if (e.tip > 0) tipped++; if (e.coversFees) out.coveredFees++; }
    if (e.kind === "refund") out.refunds++;
    if (e.kind === "dispute") out.disputes++;
    const toCharity = e.coversFees ? e.gift : e.gift - e.feeProcessor;
    out.giftsToCharity += sign * toCharity;
    out.tips += sign * e.tip;
    out.feeProcessor += sign * e.feeProcessor;
    const f = e.faith || "none", c = e.giverCountry || "??";
    out.byFaith[f] = (out.byFaith[f] || 0) + sign * toCharity;
    out.byCountry[c] = (out.byCountry[c] || 0) + sign * toCharity;
    out.byCurrency[cur] = (out.byCurrency[cur] || 0) + sign * (e.gift + e.tip);
  });
  out.tipRate = out.gifts ? Math.round((tipped / out.gifts) * 100) / 100 : 0;
  return out;
}

/* "What your tips paid for", as a number instead of a mood. Costs are what
   the founder records, in minor units; the identity check is the one with
   a known unit price. Printed on the giving page and in the yearly report. */
const UNIT_COSTS = {
  identityCheckMinor: 150,   // Stripe Identity, approx. $1.50 per verification — SET TO THE INVOICED PRICE
};
function whatTipsPaidFor(roll, costs) {
  const c = Object.assign({}, UNIT_COSTS, costs || {});
  const checks = c.identityCheckMinor ? Math.floor(roll.tips / c.identityCheckMinor) : 0;
  return {
    tipsMinor: roll.tips,
    identityChecksFunded: checks,
    sentence: roll.tips > 0
      ? "Tips this month came to " + minor(roll.tips, roll.currency || "USD") + " — enough for " + checks + " identity check" + (checks === 1 ? "" : "s") + " for new guides."
      : "No tips this month. The checks were paid for anyway.",
  };
}

/* A cross-border gift is refused when the charity cannot receive it. Today
   that is India (FCRA); the table grows as charities are signed. */
const CROSS_BORDER_BLOCK = {
  IN: "This charity can only receive gifts from inside India at the moment. If you are outside India, please choose another charity — or give to this one directly.",
};
function crossBorderRefusal(giverCountry, charityCountry, charityFcra) {
  if (giverCountry === charityCountry) return null;
  if (charityCountry === "IN" && !charityFcra) return CROSS_BORDER_BLOCK.IN;
  return null;
}

/* Where a tip may be asked for: exactly where a gift may (giving.js). The
   tip never gets its own surface. */
function tipMayAppear(surface, mayAskToGiveFn) {
  return typeof mayAskToGiveFn === "function" ? mayAskToGiveFn(surface) : false;
}

function minor(n, cur) {
  const v = (n / 100).toFixed(2);
  return cur === "USD" ? "$" + v : v + " " + cur;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { NO_CUSTODY, RAILS, railFor, railLive, LIMITS, LEDGER_KINDS, LEDGER_FIELDS, NEVER_IN_LEDGER,
                     validateLedgerEntry, rollup, UNIT_COSTS, whatTipsPaidFor, CROSS_BORDER_BLOCK, crossBorderRefusal,
                     tipMayAppear, minor };
}
