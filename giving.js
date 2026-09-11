// giving.js
// How money moves, and the three places it must never touch.
//
// THE MODEL. Donations go to partner charities of the giver's own faith,
// and EverVerse takes NOTHING from them. Separately, on the same page, the
// giver may add a tip for EverVerse if they choose. Two decisions, both
// theirs, both stated in plain words. Nobody who asks pays, nobody who
// answers pays, and nobody is asked in the moment they are hurting.
//
// Why zero rather than a small percentage: "we take nothing from your gift"
// is the strongest true sentence a giving page can carry, and a platform
// whose only asset is being trusted should carry it. It is also what raises
// more — GoFundMe moved to exactly this model in 2017 and most charity
// platforms followed, because optional tips at checkout run well above any
// fixed low fee once nothing is hidden. And it is legally lighter: a
// voluntary tip to the platform is not a cut of a donation.
//
// A percentage of gifts was never going to fund year one anyway. Year one
// is the Etsy business, partner institutions covering their own guides'
// checks, and grants once there is a 501(c)(3). Tips are a pleasant
// surprise, not a plan.
//
// This is better than "donate to EverVerse" for three reasons. A giver trusts
// a hospice or a parish they already know more than they trust a prayer app.
// The charities are the same institutions we want vouching for guides, so
// they gain a reason to send us their volunteers. And the person who asked
// for a blessing is never the one being asked for money.
//
// THE THREE GUARD RAILS. Each one exists because the model, done naively,
// breaks a rule we already set.
//
//  1. NEVER LINKED TO A GUIDE OR A BLESSING. If donations flowed to the
//     charity whose guide answered you, guides would have a reason to steer
//     toward giving and charities a reason to compete through their guides.
//     The gift is routed by the GIVER'S faith, chosen on the giving page, with
//     no reference to who answered them or whether anyone did.
//
//  2. EVERY CENT IS ACCOUNTED FOR, BEFORE THE GIFT. What the charity gets,
//     what the card processor takes, and what — if anything — the giver
//     chose to tip EverVerse. Taking a cut of donations would make us a
//     fundraising platform in law (a "commercial co-venturer" in most US
//     states, a "commercial participator" in the UK); a voluntary tip is
//     not that, but the written agreement with each charity still exists
//     and the sentence is still printed. Hiding any part of it is not just
//     poor form; in most places it is illegal.
//
//  3. NEVER ASKED ON THE WOUNDED SIDE. Not on the blessing page, not in a
//     reply, not in the days after. The giving page is reached from the
//     calm side of the site — the daily verse, the front door — never from a
//     request or a conversation.

const PLATFORM_SHARE = 0;         // EverVerse takes nothing from the gift itself

// The tip is the giver's, offered after the gift amount, never folded into
// it. These are the suggested amounts as a share of the gift; "none" is
// always one of the choices and is never preselected to anything else.
const TIP_OPTIONS = [0, 0.05, 0.10, 0.15];
const TIP_DEFAULT = 0;             // the honest default is nothing

// The card processor is a third party to every gift and it is not free.
// 2.9% + 30¢ is the standard published rate for Stripe and PayPal in the
// US; nonprofit rates are a little lower. SET THIS TO THE REAL RATE of
// whichever processor is signed, because the disclosure sentence below
// prints it, and printing a wrong number is worse than printing none.
//
// With the platform share at zero, the processor is the only thing between
// the giver and the charity — and DONOR_COVERS_FEES lets the giver add it
// on top, the way most charity platforms now do, so the charity really
// does receive the whole gift.
const PROCESSING = { pct: 0.029, fixed: 0.30 };
const DONOR_COVERS_FEES = true;    // offer "add the card fee?" — default ticked
const MIN_GIFT = 1;

/* Partner charities, per faith. Empty until a written agreement exists —
   never list an organisation we have not actually signed with, because the
   giving page says "your gift goes to X", and that is a promise. */
const PARTNERS = {
  christian: [], islam: [], hindu: [], buddhist: [],
  jewish: [], sikh: [], taoist: [], none: [],
};

function partnersFor(faith) {
  return PARTNERS[faith] || [];
}
function anyPartnerAt(faith) {
  return partnersFor(faith).length > 0;
}
function givingOpen() {
  return Object.keys(PARTNERS).some(anyPartnerAt);
}

/* The split, to the cent, and where every cent goes — including the
   processor, which most platforms leave out of the sentence and which is
   exactly why "100% goes to charity" claims keep getting fined.

   coversFees: the giver chose to add the card fee on top. Then the charity
   receives the full gift less our 1%, and the giver pays a little more.
   Otherwise the fee comes out of the gift and the charity receives less. */
function splitGift(amount, coversFees, tipRate) {
  const a = Math.max(0, Math.round(Number(amount || 0) * 100));
  const tip = Math.round(a * (Number(tipRate) || 0));
  if (!a) return { total: 0, charged: 0, toCharity: 0, toPlatform: 0, toProcessor: 0,
                   tip: 0, tipPct: 0, coversFees: !!coversFees };
  // The processor is paid on the whole card charge — gift plus tip.
  if (coversFees) {
    // gross up so that, after the processor's cut, gift + tip arrive intact
    const intended = a + tip;
    const charged = Math.round((intended + PROCESSING.fixed * 100) / (1 - PROCESSING.pct));
    return { total: a / 100, charged: charged / 100, toCharity: a / 100,
             toPlatform: tip / 100, toProcessor: (charged - intended) / 100,
             tip: tip / 100, tipPct: Math.round((Number(tipRate) || 0) * 100), coversFees: true };
  }
  const charged = a + tip;
  const processor = Math.round(charged * PROCESSING.pct + PROCESSING.fixed * 100);
  // the fee comes out of the gift, never out of the tip — the tip was a
  // separate decision and the charity is the one who should not be short
  return { total: a / 100, charged: charged / 100, toCharity: (a - processor) / 100,
           toPlatform: tip / 100, toProcessor: processor / 100,
           tip: tip / 100, tipPct: Math.round((Number(tipRate) || 0) * 100), coversFees: false };
}

/* The sentence a giver reads before giving. Fixed wording, so nobody
   rephrases it into something softer on a busy day. Names all three
   destinations, every time. */
function disclosure(faith, amount, coversFees, tipRate) {
  const s = splitGift(amount, coversFees, tipRate);
  const who = anyPartnerAt(faith)
    ? partnersFor(faith).map((p) => p.name).join(" and ")
    : "a partner charity of your faith";
  const tail = " The guide who wrote to you, if anyone did, will never know.";
  if (s.total <= 0)
    return "EverVerse takes nothing from your gift. All of it goes to " + who +
      ", less the card processor's fee of about " + Math.round(PROCESSING.pct * 1000) / 10 + "% plus " +
      money(PROCESSING.fixed) + " — which you can choose to add on top so the charity receives every cent. " +
      "If you would like to support EverVerse as well, you can add a separate tip; it is never taken from the gift." + tail;
  const tipLine = s.tip > 0
    ? " You chose to add " + money(s.tip) + " (" + s.tipPct + "%) as a tip to EverVerse, which is separate from the gift and pays for identity checks, moderation and hosting."
    : " Nothing goes to EverVerse.";
  if (s.coversFees)
    return "You will be charged " + money(s.charged) + ". " + money(s.toCharity) + " — your whole gift — goes to " + who +
      ", and " + money(s.toProcessor) + " goes to the card processor." + tipLine + tail;
  return "Of your " + money(s.total) + ", " + money(s.toCharity) + " goes to " + who +
    " and " + money(s.toProcessor) + " goes to the card processor." + tipLine + tail;
}
function money(n) { return "$" + (Math.round(n * 100) / 100).toFixed(2); }

/* Where a giving link is allowed to appear, and where it is not. Used by
   the pages themselves so the rule is enforced by code, not by remembering.
   Anything about a request, a reply or a conversation is the wounded side. */
const CALM_SURFACES = ["home", "daily-verse", "about", "give", "footer"];
const WOUNDED_SURFACES = ["ask", "reply", "read", "thread", "crisis", "youth", "match"];
function mayAskToGive(surface) {
  if (WOUNDED_SURFACES.indexOf(surface) !== -1) return false;
  return CALM_SURFACES.indexOf(surface) !== -1;
}

/* What a tip is for, said concretely. "Running the platform" is a phrase
   that hides a lot; this is the list a giver is entitled to. */
const PLATFORM_SHARE_PAYS_FOR = [
  "identity checks for guides — we pay, never the volunteer",
  "the people who read reports and sit in on conversations",
  "hosting, and the crisis-line partnerships in each country",
  "translating the safety checks into every language we offer",
];

/* Never. Mirrors the reply moderation and the campaign list. */
const NEVER_IN_GIVING = [
  { re: /\b(guide|blessing|reply|answered you|who wrote to you)\b.{0,40}\b(donat|give|gift|support|thank)/i,
    why: "Ties the gift to a specific guide or blessing. Route by the giver's faith only." },
  // A tip to EverVerse is the model. A tip to a GUIDE is payment for a
  // blessing, and never appears.
  { re: /\b(?:thank|support|help|repay|reward|tip)\s+(?:your|the|this|that|a)\s+guide\b|\btip\s+(?:him|her|them)\b/i,
    why: "Frames the gift as payment for a blessing." },
  { re: /\b(urgent|before it'?s too late|running out|only \d+ (days|hours))\b/i,
    why: "Manufactured urgency has no place on a giving page." },
  { re: /\b(tax[- ]deductible)\b/i,
    why: "Do not claim deductibility until the structure is confirmed with an accountant in each jurisdiction." },
];
function checkGivingCopy(text) {
  const hit = NEVER_IN_GIVING.find((r) => r.re.test(String(text || "")));
  return hit ? { ok: false, why: hit.why } : { ok: true, why: "" };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PLATFORM_SHARE, PROCESSING, DONOR_COVERS_FEES, TIP_OPTIONS, TIP_DEFAULT, MIN_GIFT, PARTNERS, partnersFor, anyPartnerAt, givingOpen,
                     splitGift, disclosure, money, CALM_SURFACES, WOUNDED_SURFACES, mayAskToGive,
                     PLATFORM_SHARE_PAYS_FOR, NEVER_IN_GIVING, checkGivingCopy };
}
