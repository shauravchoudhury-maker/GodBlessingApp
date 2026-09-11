// giving.js
// How money moves, and the three places it must never touch.
//
// THE MODEL. Donations go to partner charities of the giver's own faith.
// EverVerse keeps a fixed share to run and improve the platform, and says so
// in plain words on the page where the gift is made. Nobody who asks pays,
// nobody who answers pays, and nobody is asked in the moment they are hurting.
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
//  2. THE SHARE IS DISCLOSED, EVERY TIME, BEFORE THE GIFT. Taking a cut of
//     charitable donations makes us a fundraising platform in law — a
//     "commercial co-venturer" in most US states, a "commercial participator"
//     in the UK. That requires a written agreement with each charity and a
//     clear statement of the share to the donor. Hiding the share is not just
//     poor form; in most places it is illegal.
//
//  3. NEVER ASKED ON THE WOUNDED SIDE. Not on the blessing page, not in a
//     reply, not in the days after. The giving page is reached from the
//     calm side of the site — the daily verse, the front door — never from a
//     request or a conversation.

const PLATFORM_SHARE = 0.01;      // one cent on the dollar

// The card processor is a third party to every gift and it is not free.
// 2.9% + 30¢ is the standard published rate for Stripe and PayPal in the
// US; nonprofit rates are a little lower. SET THIS TO THE REAL RATE of
// whichever processor is signed, because the disclosure sentence below
// prints it, and printing a wrong number is worse than printing none.
//
// At a 1% platform share the processor takes roughly three times what
// EverVerse does. That is the honest shape of a 1% model, and it is why
// DONOR_COVERS_FEES exists: the giver is offered the chance to add the
// card fee on top, the way most charity platforms now do, so that the
// charity really does receive 99%.
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
function splitGift(amount, coversFees) {
  const a = Math.max(0, Math.round(Number(amount || 0) * 100));
  if (!a) return { total: 0, charged: 0, toCharity: 0, toPlatform: 0, toProcessor: 0,
                   sharePct: Math.round(PLATFORM_SHARE * 100), coversFees: !!coversFees };
  const platform = Math.round(a * PLATFORM_SHARE);
  const fee = (base) => Math.round(base * PROCESSING.pct + PROCESSING.fixed * 100);
  if (coversFees) {
    // gross up so that, after the processor's cut, the intended gift arrives
    const charged = Math.round((a + PROCESSING.fixed * 100) / (1 - PROCESSING.pct));
    const processor = charged - a;
    return { total: a / 100, charged: charged / 100, toCharity: (a - platform) / 100,
             toPlatform: platform / 100, toProcessor: processor / 100,
             sharePct: Math.round(PLATFORM_SHARE * 100), coversFees: true };
  }
  const processor = fee(a);
  return { total: a / 100, charged: a / 100, toCharity: (a - platform - processor) / 100,
           toPlatform: platform / 100, toProcessor: processor / 100,
           sharePct: Math.round(PLATFORM_SHARE * 100), coversFees: false };
}

/* The sentence a giver reads before giving. Fixed wording, so nobody
   rephrases it into something softer on a busy day. Names all three
   destinations, every time. */
function disclosure(faith, amount, coversFees) {
  const s = splitGift(amount, coversFees);
  const who = anyPartnerAt(faith)
    ? partnersFor(faith).map((p) => p.name).join(" and ")
    : "a partner charity of your faith";
  const tail = " The guide who wrote to you, if anyone did, will never know.";
  if (s.total <= 0)
    return "EverVerse keeps " + s.sharePct + "% of every gift to run and improve the platform. " +
      "The card processor takes about " + Math.round(PROCESSING.pct * 1000) / 10 + "% plus " +
      money(PROCESSING.fixed) + ", which you can choose to add on top so the charity receives the rest in full. " +
      "Everything else goes to " + who + "." + tail;
  if (s.coversFees)
    return "You will be charged " + money(s.charged) + ". " + money(s.toCharity) + " goes to " + who +
      ", " + money(s.toPlatform) + " (" + s.sharePct + "%) goes to EverVerse to run and improve the platform, and " +
      money(s.toProcessor) + " goes to the card processor." + tail;
  return "Of your " + money(s.total) + ", " + money(s.toCharity) + " goes to " + who +
    ", " + money(s.toPlatform) + " (" + s.sharePct + "%) goes to EverVerse to run and improve the platform, and " +
    money(s.toProcessor) + " goes to the card processor." + tail;
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

/* What the money is for, said concretely. "Running the platform" is a
   phrase that hides a lot; this is the list a giver is entitled to. */
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
  { re: /\b(?:thank|support|help|repay|reward|tip)\s+(?:your|the|this|that|a)\s+guide\b|\btip\b/i,
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
  module.exports = { PLATFORM_SHARE, PROCESSING, DONOR_COVERS_FEES, MIN_GIFT, PARTNERS, partnersFor, anyPartnerAt, givingOpen,
                     splitGift, disclosure, money, CALM_SURFACES, WOUNDED_SURFACES, mayAskToGive,
                     PLATFORM_SHARE_PAYS_FOR, NEVER_IN_GIVING, checkGivingCopy };
}
