// identity.js
// The verification engine behind `idVerifiedAt`, `vouchCount`,
// `affiliationsConfirmed` and `backgroundCheckAt` in the standing model.
//
// WHAT THIS IS FOR, SAID PLAINLY.
//
// Verifying identity does not make anyone safe. Most people who harm others
// have no criminal record and pass every check there is. What verification
// actually buys is accountability — a real person to name if something
// happens — and deterrence, because very few predators will hand over a
// government ID to do this.
//
// The things that PREVENT harm are structural and already built: one reply
// per guide, no contact details, no browsing the queue. Verification is a
// complement to those and never a substitute. The real danger of a "verified"
// badge is that everyone relaxes behind it.
//
// So: every piece of evidence below records what it ACTUALLY proves, which is
// usually much less than people assume.

/* ---------------------------------------------------------------- */
/*  Evidence — and the honest limit of each                         */
/* ---------------------------------------------------------------- */
const EVIDENCE = {
  google: {
    label: "Signed in with Google",
    proves: "control of an email account, and nothing else",
    automatic: true, cost: 0,
  },
  phone: {
    label: "Phone number confirmed",
    proves: "control of a phone number — mainly useful because it makes a " +
            "second account cost something, so a barred guide cannot simply come back",
    automatic: true, cost: 0.02,
  },
  document: {
    label: "Government ID checked",
    proves: "a government document passed authenticity and liveness checks and " +
            "the face matched — it does NOT mean anyone judged this person",
    automatic: true, cost: 1.5,
  },
  video: {
    label: "Spoke with us",
    proves: "a person on our side formed a judgement, which is the part no " +
            "vendor can do",
    automatic: false, cost: 0,
  },
  vouch: {
    label: "Vouched for",
    proves: "two stewards put their own standing behind this person",
    automatic: false, cost: 0,
  },
  affiliation: {
    label: "Affiliation confirmed",
    proves: "we rang the organisation and they confirmed the role — the " +
            "strongest signal here, and the cheapest",
    automatic: false, cost: 0,
  },
  background: {
    label: "Background check",
    proves: "no relevant record in ONE jurisdiction on ONE date; it says " +
            "nothing about anywhere else, or about tomorrow",
    automatic: false, cost: 45,
  },
};

/* ---------------------------------------------------------------- */
/*  What each rung requires                                         */
/* ---------------------------------------------------------------- */
// Mechanical checks are automated. Judgement is not, and never should be —
// a machine cannot tell you whether someone should be trusted with a
// stranger's grief. Automating the paperwork is what frees a person up to
// do the part that matters.
const REQUIRED = {
  listener:  ["google"],
  companion: ["google", "phone", "document", "video", "vouch"],
  steward:   ["google", "phone", "document", "video", "vouch", "affiliation", "background"],
};

// A check is a photograph, not a state. These decay.
const EXPIRES_DAYS = { background: 365, video: 0, document: 0, phone: 0,
                       vouch: 0, affiliation: 730, google: 0 };

function daysBetween(a, b) {
  return Math.floor((new Date(b) - new Date(a)) / 86400000);
}

function isExpired(kind, at, today) {
  const life = EXPIRES_DAYS[kind] || 0;
  if (!life || !at) return false;
  return daysBetween(at, today || new Date().toISOString()) > life;
}

/* The evidence a guide document actually carries. Reads the same fields the
   standing model derives from, so the two can never disagree. */
function evidenceOf(g) {
  const e = {};
  if (!g) return e;
  if (g.approvedAt)             e.google      = g.approvedAt;
  if (g.phoneVerifiedAt)        e.phone       = g.phoneVerifiedAt;
  if (g.idVerifiedAt)           e.document    = g.idVerifiedAt;
  if (g.videoAt)                e.video       = g.videoAt;
  if ((g.vouchCount || 0) >= 2) e.vouch       = g.vouchedAt || g.approvedAt || null;
  if ((g.affiliationsConfirmed || 0) >= 1) e.affiliation = g.affiliationConfirmedAt || null;
  if (g.backgroundCheckAt)      e.background  = g.backgroundCheckAt;
  return e;
}

/* What is done, what is missing, what has gone stale. */
function verificationState(g, tier, today) {
  const need = REQUIRED[tier] || [];
  const have = evidenceOf(g);
  const now = today || new Date().toISOString();
  const done = [], missing = [], expired = [];
  need.forEach((k) => {
    if (!(k in have)) { missing.push(k); return; }
    if (isExpired(k, have[k], now)) expired.push(k);
    else done.push(k);
  });
  return {
    tier, done, missing, expired,
    complete: missing.length === 0 && expired.length === 0,
    // what it would cost us to finish this person off
    outstandingCost: missing.concat(expired)
      .reduce((s, k) => s + (EVIDENCE[k] ? EVIDENCE[k].cost : 0), 0),
  };
}

/* ---------------------------------------------------------------- */
/*  What we are allowed to say we checked                           */
/* ---------------------------------------------------------------- */
// A requester in distress reads "verified" as "safe". It does not mean that
// and we must not let it. These are the only phrasings that go in front of
// somebody asking for help.
function publicClaim(g) {
  const have = evidenceOf(g);
  const out = [];
  if (have.document) out.push({ text: "Government ID checked",
    tip: "A document passed authenticity and liveness checks. It does not mean we know this person." });
  if (have.video) out.push({ text: "Spoke with us",
    tip: "Someone at EverVerse had a conversation with them before approving." });
  if (have.affiliation) out.push({ text: "Affiliation confirmed",
    tip: "We contacted the organisation directly and they confirmed the role." });
  if (have.background) out.push({ text: "Background checked",
    tip: "No relevant record in their jurisdiction on the date we checked." });
  return out;
}

// Never displayed as a score, a percentage or a tick out of five — that is a
// ranking with extra steps, and ranking guides is the one thing we do not do.
const NEVER_DISPLAY = ["score", "percent", "stars", "rank", "level", "tier"];

/* The half nobody shows -------------------------------------------------
   Every platform lists its ticks. Almost none lists what it did not look at,
   which is why "Verified ✓" has stopped meaning anything to anybody.
   A person deciding whether to hand a stranger their grief is better served
   by an honest gap than by a badge — and a platform willing to print its own
   gaps is, in the end, the more believable one.

   These are shown with the same weight as the ticks, never folded away
   behind a "more info" link. */
function publicGaps(g, tier) {
  const have = evidenceOf(g);
  const out = [];
  if (!have.document) out.push({ text: "No government ID on file",
    why: "We have not confirmed this person's legal identity." });
  if (!have.video) out.push({ text: "We have not spoken with them",
    why: "Nobody at EverVerse has had a conversation with this person." });
  if (!have.background) out.push({ text: "No background check",
    why: tier === "steward"
      ? "This is required for stewards and is outstanding."
      : "We run these only for stewards, who carry someone over time." });
  if (!have.affiliation) out.push({ text: "No confirmed affiliation",
    why: "They have not named an organisation we could ring, or we have not rung it yet." });
  // True of every guide, always, and worth saying every time.
  out.push({ text: "No qualification of any kind is verified",
    why: "Guides are volunteers, not clinicians or counsellors. We do not check " +
         "training, and they are not allowed to claim any." });
  return out;
}

/* ---------------------------------------------------------------- */
/*  Failing a check is usually not fraud                            */
/* ---------------------------------------------------------------- */
// Document checks fail far more often for a glare on a laminate, a worn
// passport, a name written differently across two documents, or a document
// type the vendor never trained on. Rejecting automatically would quietly
// exclude immigrants, older people and the poor — which is exactly the set of
// people whose lived experience the Circle needs most.
//
// So a failure NEVER auto-rejects. It routes to a person.
const FAILURE_ROUTES = {
  document_unreadable: { auto: false, next: "retry", say: "The photo could not be read. Try again in daylight, with the document flat." },
  document_expired:    { auto: false, next: "human", say: "The document looks out of date. Send another, or talk to us." },
  name_mismatch:       { auto: false, next: "human", say: "The name did not match what you told us. That is usually marriage, transliteration or a middle name — tell us which." },
  unsupported_country: { auto: false, next: "human", say: "We cannot check documents from your country automatically. We will do it on a call instead." },
  liveness_failed:     { auto: false, next: "retry", say: "The selfie step did not complete. Try again somewhere brighter." },
  fraud_suspected:     { auto: false, next: "human", say: "We need to talk this one through before going further." },
};
function routeFailure(code) {
  return FAILURE_ROUTES[code] ||
    { auto: false, next: "human", say: "Something did not complete. A person will pick this up." };
}

/* ---------------------------------------------------------------- */
/*  What it costs to reach a given size                             */
/* ---------------------------------------------------------------- */
// Guides are volunteers, so EverVerse pays for every check. Charging someone
// to volunteer selects for the wrong people and would be faintly grotesque.
function budgetFor(counts) {
  const c = counts || {};
  const per = (tier) => (REQUIRED[tier] || []).reduce((s, k) => s + EVIDENCE[k].cost, 0);
  const listeners  = (c.listeners  || 0) * per("listener");
  const companions = (c.companions || 0) * per("companion");
  const stewards   = (c.stewards   || 0) * per("steward");
  return {
    listeners, companions, stewards,
    total: Math.round((listeners + companions + stewards) * 100) / 100,
    recurring: Math.round((c.stewards || 0) * EVIDENCE.background.cost * 100) / 100,
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { EVIDENCE, REQUIRED, EXPIRES_DAYS, isExpired, evidenceOf,
                     verificationState, publicClaim, publicGaps, NEVER_DISPLAY,
                     FAILURE_ROUTES, routeFailure, budgetFor };
}
