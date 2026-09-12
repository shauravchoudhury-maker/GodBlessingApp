/* EverVerse — the requirements, as data.
   =====================================
   One list, read by three things: the BRD page, the admin "Health" screen
   in blessing.html, and the daily check. Change a status HERE and all
   three agree. Nothing else should carry a second copy of a requirement.

   status:  met      — true today, on the live site
            partial  — built or begun, not yet true end to end
            open     — not started
   gate:    now      — before any promotion
            50       — by 50 guides / 1,000 requests a month
            500      — by 500 guides
   check:   code     — the repo proves it (tests, rules, files)
            live     — has to be seen working on eververse.org
            human    — a person did it (a call, a policy, a review)
            ops      — a number on the Health screen proves it, every day
   A status of "met" needs evidence. "We think so" is partial. */

var REQ_AREAS = [
  ["people",   "Safety of the person asking"],
  ["guides",   "Trust in the person answering"],
  ["thesis",   "The promise: written by people, never AI"],
  ["abuse",    "Protection against abuse and cost"],
  ["security", "Accounts, secrets and access"],
  ["data",     "Data, privacy and retention"],
  ["scale",    "Scalability"],
  ["legal",    "Legal and governance"],
  ["ops",      "Operations and monitoring"],
  ["product",  "Product and business"],
];

var REQUIREMENTS = [
  /* ---- Safety of the person asking ---------------------------------- */
  { id: "P1",  area: "people", gate: "now", status: "met",     check: "code",
    text: "No request is ever answered by software; every reply is written by a named, approved person.",
    evidence: "Rules: responses create requires isGuide(); no server-side write path exists." },
  { id: "P2",  area: "people", gate: "now", status: "met",     check: "code",
    text: "A guide can send exactly one reply and cannot write again unless the asker opens a conversation.",
    evidence: "Response doc id = guide uid (one per guide); thread turn parity in rules." },
  { id: "P3",  area: "people", gate: "now", status: "met",     check: "code",
    text: "Crisis language is detected in every offered language and the person is shown a helpline before sending.",
    evidence: "safety-lang.js, 24 languages, tlang suite; crisis panel on the ask form." },
  { id: "P4",  area: "people", gate: "now", status: "met",     check: "code",
    text: "Under-18 signals route the person to a helpline and an adult; the Circle is adults only.",
    evidence: "hitsMinor in safety-lang.js; 18+ attestation on send." },
  { id: "P5",  area: "people", gate: "now", status: "met",     check: "code",
    text: "A crisis-flagged request is routed only to a guide with standing ≥ companion; a guide on probation never sees it.",
    evidence: "routableFor(); rules require tier ≥ 2 on forGuide for flagged requests; onProbation() list rule." },
  { id: "P6",  area: "people", gate: "now", status: "met",     check: "code",
    text: "A reply containing contact details, money, medical or legal advice, blame or a title the guide has not earned is refused before it is sent.",
    evidence: "BLOCK / WARN / TITLE_RE in blessing.html; tship suite." },
  { id: "P7",  area: "people", gate: "now", status: "partial", check: "human",
    text: "Every helpline number shown is verified by a person in that country within the last 12 months.",
    evidence: "world.js: all 33 entries checked:null. Do not promote in a country until its line is verified." },
  { id: "P8",  area: "people", gate: "now", status: "partial", check: "human",
    text: "Every crisis and under-18 pattern is reviewed by a native speaker of that language.",
    evidence: "safety-lang.js: all checked:null. Do not promote in a language until reviewed." },
  { id: "P9",  area: "people", gate: "now", status: "met",     check: "code",
    text: "Anyone can report a reply or a request in one tap; reports are readable only by admins.",
    evidence: "reports collection; kind reply|request; allow read: isAdmin()." },
  { id: "P10", area: "people", gate: "50",  status: "open",    check: "ops",
    text: "Every report is acted on within 24 hours, and the time is measured.",
    evidence: "Health screen shows open reports and oldest age; SLA not yet published." },
  { id: "P11", area: "people", gate: "now", status: "met",     check: "code",
    text: "No request goes unanswered silently: the asker is told when no guide can write in their language.",
    evidence: "Matcher tells the person before sending when nobody fits." },
  { id: "P12", area: "people", gate: "now", status: "open",    check: "ops",
    text: "No open request is older than 48 hours without a reply, and the count is watched daily.",
    evidence: "Health screen counts them; daily check reports them. Needs guides to be true." },

  /* ---- Trust in the person answering --------------------------------- */
  { id: "G1",  area: "guides", gate: "now", status: "met",     check: "code",
    text: "Nobody can approve themselves; the guide document cannot be created from the app.",
    evidence: "Rules: guides create: if false. Created by console or the identity worker's service account." },
  { id: "G2",  area: "guides", gate: "now", status: "met",     check: "code",
    text: "A new guide answers celebrations only until a person has read their first three replies (probation).",
    evidence: "PR #49: onProbation() in rules on list and create; New guides screen; tship probation checks." },
  { id: "G3",  area: "guides", gate: "now", status: "partial", check: "live",
    text: "Every guide has confirmed their identity (document + live selfie via Stripe) before their first reply.",
    evidence: "identity-worker.js written and tested; NOT deployed. Founder has no idVerifiedAt." },
  { id: "G4",  area: "guides", gate: "now", status: "met",     check: "code",
    text: "Standing (listener / companion / steward) is derived from human-recorded facts, never from ratings, and never self-claimed.",
    evidence: "tierOf() from idVerifiedAt, vouchCount, affiliationsConfirmed, backgroundCheckAt; guide cannot write those keys." },
  { id: "G5",  area: "guides", gate: "now", status: "met",     check: "code",
    text: "What we did NOT check about a guide is shown to the asker as plainly as what we did.",
    evidence: "publicGaps() in identity.js; trust.html." },
  { id: "G6",  area: "guides", gate: "now", status: "met",     check: "code",
    text: "A guide never learns who gave money, and cannot ask for it.",
    evidence: "giving.js NEVER_IN_GIVING; money words blocked in replies; PARTNERS receive gifts, not guides." },
  { id: "G7",  area: "guides", gate: "50",  status: "open",    check: "ops",
    text: "Graduated guides are sampled: at least one reply per guide per month is read by a steward.",
    evidence: "No sampling screen yet; New guides covers first three only." },
  { id: "G8",  area: "guides", gate: "50",  status: "open",    check: "ops",
    text: "A new guide waits no more than 7 days on probation for a reviewer to read their replies.",
    evidence: "Health screen shows oldest probation age." },
  { id: "G9",  area: "guides", gate: "now", status: "met",     check: "code",
    text: "A suspended or banned guide loses access immediately, on every device, without a deploy.",
    evidence: "isGuide() checks suspended and the banned collection on every request." },
  { id: "G10", area: "guides", gate: "50",  status: "open",    check: "code",
    text: "Every admin action — graduate, suspend, verify, vouch — is written to an audit log nobody can delete.",
    evidence: "Not built." },

  /* ---- The promise: written by people, never AI ---------------------- */
  { id: "T1",  area: "thesis", gate: "now", status: "met",     check: "code",
    text: "No AI writes, suggests, completes or edits a blessing anywhere in the product.",
    evidence: "No model call exists in blessing.html or any worker. Campaign copy rules forbid AI-flavoured claims." },
  { id: "T2",  area: "thesis", gate: "now", status: "met",     check: "code",
    text: "Every guide promises in the application that every word they send is their own.",
    evidence: "Three promises on the application; shown on trust.html." },
  { id: "T3",  area: "thesis", gate: "50",  status: "open",    check: "ops",
    text: "Pasted AI text is caught by people reading samples, never by a detector (detectors are unreliable and would refuse real writing).",
    evidence: "Depends on G7 sampling." },
  { id: "T4",  area: "thesis", gate: "now", status: "met",     check: "code",
    text: "The promise is stated on the front door, the trust page and the guide page in the same words.",
    evidence: "index.html human promise band; trust.html; guides.html." },

  /* ---- Protection against abuse and cost ----------------------------- */
  { id: "A1",  area: "abuse", gate: "now", status: "met",     check: "code",
    text: "Requests cannot be listed, searched or enumerated by anyone but an approved guide, and only their own pool.",
    evidence: "allow list: isGuide() && mine(); verified anonymous runQuery → 403 on live." },
  { id: "A2",  area: "abuse", gate: "now", status: "met",     check: "code",
    text: "Contact details, addresses, phone, card and ID numbers are refused in a request before it is stored.",
    evidence: "REQUEST_BLOCK; tquality suite." },
  { id: "A3",  area: "abuse", gate: "now", status: "met",     check: "code",
    text: "Gibberish and test text never reach a guide's queue.",
    evidence: "looksLikeGibberish; 15-minute duplicate courtesy." },
  { id: "A4",  area: "abuse", gate: "now", status: "met",     check: "live",
    text: "A billing budget alert is set on the Firebase project so a runaway bill is noticed the same day.",
    evidence: "2026-09-12: budget 'EverVerse monthly' on eververse2117, emails at 50/90/100%." },
  { id: "A5",  area: "abuse", gate: "now", status: "partial", check: "live",
    text: "Firebase App Check is enforced on Firestore so scripts without a real browser cannot write.",
    evidence: "2026-09-12: reCAPTCHA v3 site key registered; SDK wired in blessing.html and reactions.js. NOT enforced yet: watch App Check metrics for a day, add App Check to Twin Track and Second Chance (same project), then enforce." },
  { id: "A6",  area: "abuse", gate: "50",  status: "open",    check: "code",
    text: "Request creation is rate-limited per IP behind a Worker (Firestore rules cannot rate-limit).",
    evidence: "Not built." },
  { id: "A7",  area: "abuse", gate: "now", status: "met",     check: "code",
    text: "Every write is bounded in size and shape by rules (hasOnly, size limits) so no field can be abused as storage.",
    evidence: "BLESSING_RULES.txt: keys().hasOnly on every create; note ≤ 1200, reflection ≤ 900." },
  { id: "A8",  area: "abuse", gate: "now", status: "met",     check: "code",
    text: "The identity worker only starts a paid session for a known applicant or guide.",
    evidence: "/start returns 403 'apply first' otherwise." },
  { id: "A9",  area: "abuse", gate: "500", status: "open",    check: "live",
    text: "The site sits behind a WAF with DDoS protection.",
    evidence: "Move to Cloudflare Pages when DNS moves." },

  /* ---- Accounts, secrets and access ----------------------------------- */
  { id: "S1",  area: "security", gate: "now", status: "met",     check: "code",
    text: "No secret, key or credential is in the repository; the Firebase config is public by design and protected by rules.",
    evidence: "Workers read secrets from Cloudflare env; firebase-config.js holds only public config." },
  { id: "S2",  area: "security", gate: "now", status: "met",     check: "human",
    text: "Every admin Google account has 2-step verification on.",
    evidence: "2026-09-12: 2-step verification on for the admin account; backup codes generated and kept off the laptop." },
  { id: "S3",  area: "security", gate: "now", status: "met",     check: "human",
    text: "The Firebase project has a second Owner, separate from the daily admin account, with 2-step verification and recovery codes.",
    evidence: "2026-09-12: second Owner granted in IAM on eververse2117. Demote the daily account to Editor once a second admin exists." },
  { id: "S4",  area: "security", gate: "now", status: "met",     check: "code",
    text: "Workers verify a Firebase ID token against Google's keys before acting; Stripe webhooks are signature-checked in constant time.",
    evidence: "identity-worker.js." },
  { id: "S5",  area: "security", gate: "now", status: "partial", check: "code",
    text: "Each worker's service account can write only what it needs.",
    evidence: "One service account, shared by identity-worker.js and retention-worker.js. Split into two custom roles (datastore.entities.* only) when the second is deployed — RETENTION_SETUP.txt." },
  { id: "S6",  area: "security", gate: "now", status: "met",     check: "code",
    text: "No identity document or selfie is ever stored by EverVerse.",
    evidence: "Stripe holds them; we keep a session id and a date. NEVER_DISPLAY in identity.js." },
  { id: "S7",  area: "security", gate: "50",  status: "open",    check: "human",
    text: "Admin access is reviewed quarterly and removed when a person leaves.",
    evidence: "No second admin yet." },

  /* ---- Data, privacy and retention ----------------------------------- */
  { id: "D1",  area: "data", gate: "now", status: "met",     check: "code",
    text: "A person can ask for a blessing without an account, an email address or a name.",
    evidence: "Anonymous create; secret link is the only key." },
  { id: "D2",  area: "data", gate: "now", status: "met",     check: "code",
    text: "The private ritual (Let it go) makes zero network requests; the text never leaves the device.",
    evidence: "letgo.html; spellcheck off; verified in devtools." },
  { id: "D3",  area: "data", gate: "now", status: "met",     check: "live",
    text: "Firestore has point-in-time recovery on and a scheduled backup with retention.",
    evidence: "2026-09-12: PITR enabled (7 days); daily backups, 14-day retention (Firestore → Disaster recovery). Done the day a console delete wiped blessing/circle." },
  { id: "D4",  area: "data", gate: "now", status: "met",     check: "live",
    text: "Request text is deleted after a retention period (30–90 days) so there is less to lose, leak or be compelled to hand over.",
    evidence: "2026-09-12: eververse-retention deployed on Cloudflare, cron 04:20 UTC, 60 days. First run 21:40 UTC: seen 0 (nothing 60 days old yet). Proof line at https://eververse-retention.shauravchoudhury.workers.dev/ and stats/retention." },
  { id: "D5",  area: "data", gate: "now", status: "met",     check: "live",
    text: "The holder of a request link can delete their request and its replies.",
    evidence: "2026-09-12: rules published; tested live — a fresh request erased from its link (2eSYvA4S5ev5K1d2KCNx), the link then reads 'deleted'; an erase with a wrong key via the REST API returned PERMISSION_DENIED." },
  { id: "D6",  area: "data", gate: "now", status: "met",     check: "human",
    text: "A privacy policy says, in plain words, what is stored, for how long, and who can see it.",
    evidence: "2026-09-12: privacy.html rewritten around the Circle — what is stored, who sees it, 60-day erasure, self-delete, a who-sees-what table. Linked from every footer." },
  { id: "D7",  area: "data", gate: "50",  status: "open",    check: "human",
    text: "Data residency is known and stated (Firestore region), and EU promotion waits for GDPR basics: lawful basis, retention, erasure path.",
    evidence: "Region: check console. D4 + D5 + D6 are the GDPR basics." },

  /* ---- Scalability --------------------------------------------------- */
  { id: "C1",  area: "scale", gate: "now", status: "met",     check: "code",
    text: "Static pages are served from a CDN with a versioned service-worker cache, so a deploy reaches every device.",
    evidence: "GitHub Pages; sw.js CACHE bump on every ship." },
  { id: "C2",  area: "scale", gate: "50",  status: "open",    check: "code",
    text: "Matching runs server-side; the public no longer downloads the whole guide directory.",
    evidence: "Matcher is client-side today: reads every guide per request." },
  { id: "C3",  area: "scale", gate: "50",  status: "open",    check: "code",
    text: "Guide queues are sharded by language and tradition instead of every guide listing the whole pool.",
    evidence: "forGuide in [uid, ''] today." },
  { id: "C4",  area: "scale", gate: "50",  status: "open",    check: "code",
    text: "The public guide directory is a projection (name, tradition, standing facts), not the full document.",
    evidence: "guides: allow read: if true on the full doc today." },
  { id: "C5",  area: "scale", gate: "500", status: "open",    check: "live",
    text: "Hosting is off GitHub Pages' soft 100 GB/month cap (Cloudflare Pages).",
    evidence: "Planned with the DNS move." },
  { id: "C6",  area: "scale", gate: "now", status: "met",     check: "code",
    text: "Every queue query is bounded (limit) and indexed; no unbounded reads exist in the client.",
    evidence: "limit(40) on queues; limit(20) on reviews." },
  { id: "C7",  area: "scale", gate: "50",  status: "open",    check: "ops",
    text: "Reviewer capacity scales with guides: one steward reviewer per language with more than 20 guides.",
    evidence: "Rules allow stewards to review; nobody assigned." },

  /* ---- Legal and governance ------------------------------------------ */
  { id: "L1",  area: "legal", gate: "now", status: "met",     check: "human",
    text: "Terms of service exist: what EverVerse is (prayer and reflection), what it is not (medical, legal, therapeutic), and who may use it (adults).",
    evidence: "2026-09-12: terms.html — is / is not, adults only for the Circle, what we ask of askers and guides, gifts, honest limits. Linked from the 18+ tick and every footer." },
  { id: "L2",  area: "legal", gate: "now", status: "met",     check: "human",
    text: "A written safeguarding policy names a safeguarding lead and an incident process.",
    evidence: "2026-09-12: safeguarding.html — lead named, what the system makes impossible, six-step incident process with the 24 h promise, what is not done yet." },
  { id: "L3",  area: "legal", gate: "50",  status: "open",    check: "human",
    text: "UK Online Safety Act: an illegal-content risk assessment is written before UK promotion (EverVerse is a user-to-user service).",
    evidence: "Not done." },
  { id: "L4",  area: "legal", gate: "50",  status: "open",    check: "human",
    text: "One conversation each with an accountant and a charity lawyer about the giving model and 501(c)(3).",
    evidence: "LAUNCH.txt gate; not done." },
  { id: "L5",  area: "legal", gate: "500", status: "open",    check: "human",
    text: "A board or advisory group exists, with at least one member from a faith other than the founder's.",
    evidence: "Not formed." },
  { id: "L6",  area: "legal", gate: "50",  status: "open",    check: "human",
    text: "The name and the obvious social handles are registered before the first press.",
    evidence: "Domain held; trademark and handles unchecked." },
  { id: "L7",  area: "legal", gate: "500", status: "open",    check: "human",
    text: "A yearly transparency report: requests, replies, reports, suspensions, what was not checked.",
    evidence: "Health screen provides the numbers." },

  /* ---- Operations and monitoring ------------------------------------- */
  { id: "O1",  area: "ops", gate: "now", status: "met",     check: "code",
    text: "A single Health screen shows usage against targets and every requirement's status.",
    evidence: "blessing.html → Health (admins)." },
  { id: "O2",  area: "ops", gate: "now", status: "met",     check: "code",
    text: "A daily check reads the latest usage snapshot and the live site and reports drift against targets.",
    evidence: "Scheduled task 'eververse-daily-check'; stats/latest is written by the Health screen." },
  { id: "O3",  area: "ops", gate: "now", status: "met",     check: "code",
    text: "Every shipped change goes through a pull request and bumps the service-worker cache.",
    evidence: "PR workflow since 2026-07; sw.js CACHE." },
  { id: "O4",  area: "ops", gate: "now", status: "met",     check: "code",
    text: "Regression suites exist for guardrails, standing, routing, safety languages, giving copy and request quality, and run before every ship.",
    evidence: "tship, tlang, tworld, tcamp, tid, tthread, tgive, tquality, treq." },
  { id: "O5",  area: "ops", gate: "now", status: "open",    check: "live",
    text: "Uptime and error monitoring alerts a person when eververse.org or Firestore is failing.",
    evidence: "None. The daily check is once a day, not an alarm." },
  { id: "O6",  area: "ops", gate: "50",  status: "open",    check: "human",
    text: "A written incident runbook: suspend a guide, ban an email, take the Circle offline, restore from backup.",
    evidence: "Pieces exist in BLESSING_RULES.txt; not one document." },

  /* ---- Product and business ------------------------------------------ */
  { id: "B1",  area: "product", gate: "now", status: "met",     check: "code",
    text: "EverVerse takes nothing from a gift; the whole amount reaches the partner charity, with an optional tip.",
    evidence: "giving.js PLATFORM_SHARE = 0; disclosure text." },
  { id: "B2",  area: "product", gate: "now", status: "open",    check: "human",
    text: "At least one partner charity is signed and named on the site.",
    evidence: "PARTNERS empty; giving section says 'being confirmed'." },
  { id: "B3",  area: "product", gate: "now", status: "open",    check: "ops",
    text: "At least three approved guides in at least two faiths before the Circle is promoted (LAUNCH gate 2).",
    evidence: "One guide (founder). GUIDE_COUNTS all zero." },
  { id: "B4",  area: "product", gate: "now", status: "met",     check: "code",
    text: "Promotion is gated on guide supply per faith and per language, never on a date.",
    evidence: "campaign.js campaignPhase / GUIDE_COUNTS; LAUNCH.txt." },
  { id: "B5",  area: "product", gate: "now", status: "partial", check: "live",
    text: "Sign-in works in every major browser on the live site.",
    evidence: "Fails in Firefox/Safari (third-party partitioning). Auth proxy prepared, not switched on." },
  { id: "B6",  area: "product", gate: "50",  status: "open",    check: "ops",
    text: "Time-to-first-reply has a public promise and the median is under 24 hours.",
    evidence: "Measured on the Health screen; no promise published." },
];

/* Usage targets. The Health screen and the daily check compare the latest
   snapshot against these. All are about people being answered, not about
   traffic — traffic is not a target. */
var USAGE_TARGETS = [
  { key: "unanswered48h",   label: "Open requests older than 48 h",         op: "<=", value: 0,  req: "P12" },
  { key: "medianReplyH",    label: "Median hours to first reply (30 d)",      op: "<=", value: 24, req: "B6" },
  { key: "reportsOpen",     label: "Reports open",                            op: "<=", value: 0,  req: "P10" },
  { key: "reportsOldestH",  label: "Oldest open report, hours",               op: "<=", value: 24, req: "P10" },
  { key: "probationOldestD",label: "Oldest guide on probation, days",         op: "<=", value: 7,  req: "G8" },
  { key: "guidesActive",    label: "Guides active",                           op: ">=", value: 3,  req: "B3" },
  { key: "faithsCovered",   label: "Faiths with at least one active guide",   op: ">=", value: 2,  req: "B3" },
  { key: "applicationsWaiting", label: "Applications waiting",                op: "<=", value: 5,  req: "G8" },
];

function cmp(op, a, b){ return op === "<=" ? a <= b : op === ">=" ? a >= b : a === b; }

/* Evaluate a snapshot. A missing number is a failure, not a pass — an
   unknown is not "fine". */
function healthOf(stats){
  var s = stats || {};
  return USAGE_TARGETS.map(function(t){
    var v = s[t.key];
    var known = typeof v === "number" && !isNaN(v);
    return { key: t.key, label: t.label, value: known ? v : null, target: t.op + " " + t.value,
             ok: known && cmp(t.op, v, t.value), req: t.req };
  });
}

/* Roll-up for the BRD and the daily check. */
function requirementSummary(list){
  var out = { met: 0, partial: 0, open: 0, total: 0, byGate: {}, byArea: {} };
  (list || REQUIREMENTS).forEach(function(r){
    out[r.status]++; out.total++;
    out.byGate[r.gate] = out.byGate[r.gate] || { met: 0, partial: 0, open: 0 };
    out.byGate[r.gate][r.status]++;
    out.byArea[r.area] = out.byArea[r.area] || { met: 0, partial: 0, open: 0 };
    out.byArea[r.area][r.status]++;
  });
  return out;
}

/* The "now" gate is the launch gate: what must be true before promotion.
   These are the boxes that are not ticked. */
function blockingNow(){
  return REQUIREMENTS.filter(function(r){ return r.gate === "now" && r.status !== "met"; });
}

/* How stale a snapshot may be before the daily check says so. */
var SNAPSHOT_MAX_AGE_H = 48;

if (typeof module !== "undefined") module.exports = {
  REQ_AREAS: REQ_AREAS, REQUIREMENTS: REQUIREMENTS, USAGE_TARGETS: USAGE_TARGETS,
  healthOf: healthOf, requirementSummary: requirementSummary, blockingNow: blockingNow,
  SNAPSHOT_MAX_AGE_H: SNAPSHOT_MAX_AGE_H,
};
