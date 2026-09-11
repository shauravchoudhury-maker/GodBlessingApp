// campaign.js
// Marketing for the Blessing Circle, attached to the daily post pipeline.
//
// THE SEQUENCING PROBLEM, WHICH GOVERNS EVERYTHING HERE.
//
// A two-sided marketplace normally launches supply-first for efficiency. Here
// it is not efficiency, it is harm. If we advertise the Circle to people in
// pain before there are guides to answer, somebody writes down the worst thing
// in their life, presses send, and nothing comes back. That is worse than never
// having offered — and it is the single fastest way to destroy the one asset
// this platform has, which is being trusted.
//
// So this module has PHASES, and it will not emit "come and ask" copy until
// there are actually guides to answer. That is enforced in code, not in a plan
// document, because plans drift and code does not.
//
// Depends on: RELIGIONS + LIVED (blessing.html), VERSE_DB (verses.js).

/* ---------------------------------------------------------------- */
/*  What we will never say                                          */
/* ---------------------------------------------------------------- */
// The reply moderation refuses a guide's worst instincts. This refuses ours.
// A campaign that promises outcomes, manufactures urgency, or goes hunting for
// people in crisis would undo every guard rail behind it — and marketing copy
// is written in a hurry, by whoever is free, which is exactly when a list like
// this earns its keep.
const NEVER = [
  { re: /\b(cure|cures|cured|heal your|heals your|fix your|fixes your)\b/i,
    why: "Promises a health outcome. We offer prayer and reflection, and we say so." },
  { re: /\b(instead of|rather than|no need for)\s+(therapy|a therapist|medication|meds|your doctor|treatment)\b/i,
    why: "Positions us against medical care. Never, in any channel, in any wording." },
  { re: /\b(therapy|counselling|counseling|treatment|diagnosis)\b(?!\s*(?:is|are)\s+not)/i,
    why: "Implies a clinical service. Guides are volunteers, not clinicians." },
  { re: /\b(#1|number one|the best|world'?s (?:best|leading)|most trusted|biggest)\b/i,
    why: "An unprovable superlative. We can say what we do; we cannot rank ourselves." },
  { re: /\b(guarantee[ds]?|will change your life|life[- ]changing)\b/i,
    why: "Guarantees an outcome nobody can promise." },
  { re: /\b(limited spots?|act now|don'?t miss|only \d+ left|last chance|hurry)\b/i,
    why: "Manufactured urgency. There is no scarcity here and pretending otherwise is a con." },
  { re: /\b(join \d{3,}|\d{3,}\+? (?:people|members|users|believers) (?:have|already))\b/i,
    why: "Social proof we have not earned. When it is true, it will still not be the reason to come." },
  { re: /\b(suicidal|suicide|kill yourself|want to die|self[- ]harm|overdose)\b/i,
    why: "Never a keyword, hashtag or targeting term. Advertising at people in crisis is ambulance-chasing." },
  { re: /\b(depressed|depression|anxiety disorder|ptsd|bipolar|addict)\b/i,
    why: "Clinical targeting. Speak to feelings in plain words, never to diagnoses." },
  { re: /\b(she said|he said|one user|a member told us|testimonial)\b/i,
    why: "A recipient's words are theirs. We never quote what someone wrote to us, in any form." },
  { re: /\b(free trial|premium|upgrade|subscription|per month|pricing)\b/i,
    why: "There is no paid tier and there must never appear to be one." },
  { re: /\b(ai[- ]powered|powered by ai|ai[- ]generated|smart replies|instant (?:reply|blessing|answer)|automated blessing|chatbot)\b/i,
    why: "Every blessing is written by a person, and that is the entire point. Never imply otherwise, even as a feature." },
];

// Denials are the whole point of half this campaign — "no premium, no
// subscription, never a fee" is copy we WANT. Strip the negated forms before
// the rules run, exactly as the reply moderation strips "not your fault".
const NEGATED_MKT = /\b(?:no|not|never|without|nor)\s+(?:a |an |any |the )?(?:paid tier|premium|subscription|free trial|upgrade|pricing|per month|charge|fee|cure|cures|guarantee|guarantees|testimonials?)\b/gi;

function checkCampaignCopy(text) {
  const t = String(text || "").replace(NEGATED_MKT, " ");
  const hit = NEVER.find((r) => r.re.test(t));
  return hit ? { ok: false, why: hit.why } : { ok: true, why: "" };
}

// IMPORTANT: this checks OUR copy, never the scripture we are quoting.
// Run over a whole caption it produces nonsense — Bhagavad Gita 9:34 says
// "Fix your mind on me", Matthew 28:6 says "just as he said", and Gandhi says
// "the best way to find yourself". Those trip the health-claim, testimonial
// and superlative rules respectively, and the correct response to that is
// obviously not to edit scripture. So strip the quoted verse first.
function checkCaption(caption, verse) {
  let t = String(caption || "");
  if (verse) {
    if (verse.text) t = t.split(verse.text).join(" ");
    if (verse.ref)  t = t.split(verse.ref).join(" ");
  }
  return checkCampaignCopy(t);
}

/* ---------------------------------------------------------------- */
/*  Phases — which campaign we are allowed to run today             */
/* ---------------------------------------------------------------- */
// A faith is "open" only when enough guides can answer in it. Below that
// threshold we recruit and say nothing else, because an unanswered request in
// a tradition is indistinguishable from being ignored by it.
const OPEN_THRESHOLD = 3;

function phaseFor(guideCounts, religionKey) {
  const n = (guideCounts || {})[religionKey] || 0;
  if (n >= OPEN_THRESHOLD) return "open";
  if (n >= 1) return "quiet";     // answering, but too thin to advertise
  return "recruit";
}

// The campaign as a whole is only "open" once at least one faith is, and the
// site-wide copy always names which faiths can actually answer today.
function openFaiths(guideCounts, religions) {
  return (religions || []).filter((r) => phaseFor(guideCounts, r.key) === "open");
}

// Update this by hand as guides are approved. It is deliberately NOT read
// from the database: switching the campaign from "we need guides" to "come
// and ask us" is a decision somebody should make on purpose, after looking
// at who those guides actually are — not something that happens because a
// query came back with a three in it.
const GUIDE_COUNTS = {
  christian: 0, islam: 0, hindu: 0, buddhist: 0,
  jewish: 0, sikh: 0, taoist: 0, none: 0,
};
function campaignPhase(){
  const anyOpen = Object.keys(GUIDE_COUNTS).some((k) => phaseFor(GUIDE_COUNTS, k) === "open");
  return anyOpen ? "open" : "recruit";
}

/* ---------------------------------------------------------------- */
/*  Phase 1 — recruiting guides                                     */
/* ---------------------------------------------------------------- */
// The best place to find guides is not an ad. It is the people who already
// open a daily verse — they are religious, they are here, and nobody has asked
// them. These are written to be asked of that audience.
//
// Every one leads with the person who would be helped, not with the platform.
// "We are looking for volunteers" recruits nobody; "somebody wrote about their
// mother tonight" recruits the person who has stood there.
const RECRUIT_ANGLES = [
  { key: "lived",
    hook: (r) => "Somebody wrote to us tonight about losing their mother. What they need is not a professional. It is someone who has stood where they are standing.",
    ask:  (r) => "If you have buried a parent, and you read " + r.book + ", the Blessing Circle needs you." },
  { key: "language",
    hook: () => "There are people who can only pray properly in the language they learned it in.",
    ask:  (r) => "If you can write in Urdu, Punjabi, Gujarati, Tamil, Spanish or Arabic, you can answer someone nobody else can reach." },
  { key: "small",
    hook: () => "It is one message. Not a rota, not a commitment, not a call — one verse and a few words of your own, when you have the time.",
    ask:  () => "That is the whole ask. You can answer one and never come back." },
  { key: "quiet",
    hook: () => "You do not have to be ordained, trained, or certain of anything.",
    ask:  (r) => "You have to have been through something, and be willing to sit with someone who is going through it now." },
  { key: "hard",
    hook: () => "We turn down more applications than we accept, and we check the ones we keep.",
    ask:  () => "If that sounds like the kind of place you would want answering your own mother — apply." },
  // Not every request is a hard one, and the campaign should not read as
  // though it were. Half the door is for good news — a birth, a wedding,
  // a scan that came back clear — and a celebration is the gentlest first
  // request a new guide could answer.
  { key: "joy",
    hook: () => "Somebody wrote to us this morning because their daughter was born on Tuesday, and they wanted a verse for her.",
    ask:  (r) => "Not every request is a heavy one. If you read " + r.book + " and would like to bless a birth, a wedding, a new start — the Circle needs you for those too." },
  { key: "first",
    hook: () => "Your first request as a guide does not have to be someone's darkest night.",
    ask:  () => "It can be a couple getting married in June. You get to choose what you carry, and celebrations are always in the queue." },
];

function recruitPost(religion, angleKey, url) {
  const a = RECRUIT_ANGLES.find((x) => x.key === angleKey) || RECRUIT_ANGLES[0];
  return {
    religion: religion.key,
    angle: a.key,
    body: a.hook(religion) + "\n\n" + a.ask(religion) +
          "\n\nNo charge, ever, to anyone — for the person asking or for you.\n" + url,
    tags: ["#" + religion.label.toLowerCase().replace(/\s+/g, ""), "#faith", "#volunteer",
           "#prayer", "#eververse"],
  };
}

/* ---------------------------------------------------------------- */
/*  Trust content — the guard rails ARE the campaign                */
/* ---------------------------------------------------------------- */
// Every competitor in "spiritual wellness" advertises what it can do for you.
// Almost nobody advertises what it structurally cannot do to you. That is the
// gap, it is defensible, and it is the only claim we can keep under scrutiny.
const TRUST_POSTS = [
  { key: "once",
    body: "A guide can write to you exactly once.\n\nNot as a policy. The system refuses a second message — a guide cannot edit, delete, or follow up on what they sent you.\n\nEvery grooming pattern worth the name needs a second message. There is no second message." },
  { key: "contact",
    body: "A guide cannot give you their email, their phone number, a link, or a way to reach them anywhere else.\n\nThe check runs before the message sends, and it catches the spelled-out versions too.\n\nMoving someone to a private channel is how this kind of platform goes wrong. So it cannot happen." },
  { key: "money",
    body: "Nobody can ask you for money.\n\nNot the guide — the words are refused before the message sends. Not us — there is no paid tier, no premium, no subscription.\n\nIf we ever take donations, the guide will never know whether you gave. That is the point." },
  { key: "queue",
    body: "A guide cannot read anyone's request but yours.\n\nThere is no queue to browse, no directory to search, no way to go looking for someone who sounds vulnerable. The database itself refuses the question.\n\nWe used to allow it. We closed it." },
  { key: "credentials",
    body: "A guide cannot sign as \"Dr.\" or \"Therapist\", even if they are one.\n\nTo somebody frightened, a title reads as a credential we have checked. We check affiliations by ringing the organisation — and only what we have confirmed is ever shown." },
  { key: "young",
    body: "If a request reads as coming from someone under 18, we do not pass it on.\n\nThey get Teen Line and 988 instead. There is no \"I'm really an adult\" override, because an override is a checkbox, and we already know checkboxes do not work.\n\nIt costs us users. It is not negotiable." },
  { key: "joy",
    body: "The Circle is not only for hard days.\n\nHalf the door is for good news — a baby, a wedding, a scan that came back clear, a brother spoken to for the first time in years. You can ask for a blessing on those too, and a guide from your own tradition will write one.\n\nJoy is worth a verse as much as grief is." },
  { key: "crisis",
    body: "If what you write suggests you are in real danger, your request does not go to whoever is free.\n\nIt goes to a guide we have identity-checked, vouched and background-checked — or, if none is available, we tell you so and point you at 988.\n\nA volunteer is not what that moment needs, and we would rather say it than pretend." },
];

function trustPost(key, url) {
  const p = TRUST_POSTS.find((x) => x.key === key) || TRUST_POSTS[0];
  return { key: p.key, body: p.body + "\n\n" + url,
           tags: ["#eververse", "#faith", "#onlinesafety", "#prayer"] };
}

/* ---------------------------------------------------------------- */
/*  The line appended to the daily verse post                       */
/* ---------------------------------------------------------------- */
// The daily verse is the traffic. These are deliberately quiet: a verse post
// that turns into an advert stops being shared, and sharing is the whole
// engine. One short line, rotating, never on a post about grief or illness.
const CTA_RECRUIT = [
  "The Blessing Circle is looking for guides — one message, in your own tradition, when you have time.",
  "We are opening a circle where people can ask for a verse of their own. We need guides first.",
  "If you have been through something hard and come out the other side, we could use you.",
];
const CTA_OPEN = [
  "Carrying something today? You can ask for a verse of your own — free, anonymous, answered by a person.",
  "Something to celebrate? A birth, a wedding, good news — you can ask for a blessing on that too.",
  "Anyone can ask the Blessing Circle for a verse. No account, no charge, no email needed.",
  "If today is heavy, someone will read what you write and send you something back.",
];

// Subjects where a call to action would be crass. A post about somebody's
// grief is not an acquisition channel.
const NO_CTA_TOPICS = ["comfort", "peace"];

function dailyCTA(verse, phase, dayIndex, url) {
  if (!verse || NO_CTA_TOPICS.indexOf(verse.topic) !== -1) return "";
  const pool = phase === "open" ? CTA_OPEN : CTA_RECRUIT;
  const line = pool[Math.abs(dayIndex || 0) % pool.length];
  return line + " " + url;
}

/* ---------------------------------------------------------------- */
/*  A month of posts, so nobody has to invent one at 8am            */
/* ---------------------------------------------------------------- */
// Ratio is deliberate: mostly the daily verse (that is what gets shared),
// a weekly trust post (that is what gets believed), and recruitment rotated
// across faiths so no single tradition looks like an afterthought.
function monthPlan(religions, guideCounts, url, startDay) {
  const out = [];
  const open = openFaiths(guideCounts, religions);
  const phase = open.length ? "open" : "recruit";
  for (let d = 0; d < 28; d++) {
    const day = (startDay || 0) + d;
    if (d % 7 === 3) {
      out.push(Object.assign({ day, kind: "trust" },
        trustPost(TRUST_POSTS[Math.floor(d / 7) % TRUST_POSTS.length].key, url)));
    } else if (d % 7 === 6) {
      const r = religions[Math.floor(d / 7) % religions.length];
      out.push(Object.assign({ day, kind: "recruit" },
        recruitPost(r, RECRUIT_ANGLES[Math.floor(d / 7) % RECRUIT_ANGLES.length].key, url)));
    } else {
      out.push({ day, kind: "verse", phase,
                 note: "daily verse post, with the campaign line appended" });
    }
  }
  return out;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { NEVER, checkCampaignCopy, checkCaption, phaseFor, openFaiths, OPEN_THRESHOLD,
                     GUIDE_COUNTS, campaignPhase,
                     RECRUIT_ANGLES, recruitPost, TRUST_POSTS, trustPost,
                     CTA_RECRUIT, CTA_OPEN, dailyCTA, monthPlan };
}
