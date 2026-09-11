// thread.js
// Tier 2: a conversation instead of a single blessing.
//
// THE PROBLEM WITH BUILDING THIS AT ALL.
//
// One reply per guide, immutable, was the strongest safety property in the
// system. Every grooming pattern worth the name needs a second message, and
// there was no second message. Tier 2 exists because grief does not resolve
// in one message and refusing to let anyone continue is its own cruelty — but
// it hands back the exact thing that made the first design safe.
//
// So a thread is not "the one-reply rule, relaxed". It is a different
// structure with four properties, and none of them is a policy anyone has to
// remember:
//
//  1. THE ASKER OPENS THE DOOR, ALWAYS. A guide can never start a
//     conversation, never ask to continue, never follow up. The option to
//     continue exists only on the page the person who asked holds the link
//     to. This inverts the whole dynamic: "let me check in on you" is the
//     move, and it is unavailable.
//
//  2. STRICT ALTERNATION, ASKER FIRST. Turn 0 is the asker's. Every even
//     turn is theirs, every odd turn the guide's. A guide's ability to speak
//     is granted, every single time, by the asker's most recent message. A
//     guide who is ignored cannot speak again — not "should not", cannot.
//     The Firestore rules enforce this through the document id, so it holds
//     even against a guide with the developer console open.
//
//  3. SOMEONE ELSE IS IN THE ROOM. A thread requires a named steward as
//     supervisor before it can open, and both sides are told. Not
//     "reviewable if reported" — read from the start. If no steward is
//     available, threads are simply off, the same way a faith is not open
//     until three guides can answer it.
//
//  4. IT ENDS. Twelve turns, six each, then it closes. Either side can end
//     it instantly with no explanation, and the guide is told only that it
//     ended. Unbounded relationships are what escalate.
//
// Everything the single reply refused — contact details, money, meeting,
// medical advice — is refused on every message here too.

const THREAD_CAP = 12;          // six turns each
const THREAD_DAYS = 30;         // and it expires anyway

/* Turn 0 is the asker's, and the guide only ever speaks on odd turns. This
   one line is the whole anti-grooming property. */
function whoseTurn(count) {
  return (count || 0) % 2 === 0 ? "asker" : "guide";
}

function threadState(req, today) {
  const r = req || {};
  if (!r.threadOpen) return r.threadClosedAt ? "closed" : "none";
  const n = r.threadCount || 0;
  if (n >= THREAD_CAP) return "full";
  if (r.threadOpenedAt && today) {
    const age = Math.floor((new Date(today) - new Date(r.threadOpenedAt)) / 86400000);
    if (age > THREAD_DAYS) return "expired";
  }
  return "open";
}

/* May this party write the next message? Returns a reason when not, because
   "no" without a reason is how people end up guessing. */
function canWrite(req, who, uid, today) {
  const st = threadState(req, today);
  if (st === "none")    return { ok: false, why: "No conversation has been opened." };
  if (st === "closed")  return { ok: false, why: "This conversation has ended." };
  if (st === "full")    return { ok: false, why: "This conversation has reached its limit of " + THREAD_CAP + " messages." };
  if (st === "expired") return { ok: false, why: "This conversation has been open for more than " + THREAD_DAYS + " days and has closed." };
  const turn = whoseTurn(req.threadCount || 0);
  if (turn !== who) {
    return { ok: false, why: who === "guide"
      ? "It is not your turn. You may write again once they have written to you."
      : "You have already written. Wait for their reply." };
  }
  if (who === "guide" && uid && req.threadGuide && req.threadGuide !== uid)
    return { ok: false, why: "This conversation belongs to another guide." };
  return { ok: true, why: "" };
}

/* Who is allowed to sit in on a conversation.

   A steward qualifies by standing. So does anyone carrying supervisor:true,
   which is set from the console only and is meant for the people who
   actually run EverVerse — they are accountable for the platform already,
   so requiring them to background-check themselves proves nothing. It is
   NOT a general exemption and must never be handed to an ordinary
   volunteer: the whole point of the steward bar is that somebody
   independent has been checked.

   It exists because a background check is deferred, and without it Tier 2
   would be built and permanently unusable. */
function canSupervise(g, can) {
  if (!g || g.suspended === true || g.active === false) return false;
  if (g.supervisor === true) return true;
  return !!(can && can(g, "supervise"));
}

/* The asker's side of the door. A thread needs a guide who is cleared to
   hold one AND someone willing to watch it. Both, or nothing. */
function canOpenThread(req, guide, supervisorUid, can) {
  const r = req || {};
  if (r.threadOpen) return { ok: false, why: "A conversation is already open." };
  if (r.threadClosedAt) return { ok: false, why: "This conversation has already ended. Ask for a new blessing if you need one." };
  if (!guide) return { ok: false, why: "We could not find the guide who wrote to you." };
  if (can && !can(guide, "converse"))
    return { ok: false, why: "This guide answers with a single blessing. That is all they have signed up for, and it is enough." };
  if (!supervisorUid)
    return { ok: false, why: "Conversations need a steward reading alongside, and none is free at the moment. Please try again in a few days." };
  return { ok: true, why: "" };
}

/* The document id IS the turn number. The rule requires it to equal the
   request's current threadCount, and creates cannot overwrite — so two
   messages can never claim one slot, and a guide who does not advance the
   counter simply cannot write again. Failing to update the count blocks the
   thread rather than opening it, which is the right way round.

   Unpadded, because the rule has to compare it against string(threadCount)
   and Firestore rules cannot zero-pad. Messages carry a numeric "turn"
   field and are sorted on that, never on the id. */
function turnId(count) {
  return String(count || 0);
}

/* What each side is told about the other's presence. Said plainly, on both
   sides, because supervision that nobody knows about is surveillance. */
const SUPERVISION_NOTICE = {
  asker: "A second guide, a steward, can read this conversation. They are there " +
         "for your safety, not to join in. Nothing you write goes anywhere else.",
  guide: "A steward reads this conversation alongside you. They can end it. " +
         "You are not being watched for mistakes — you are being watched so that " +
         "the person you are writing to is safe, and so are you.",
};

/* Ending it. Either side, no explanation, no argument. */
function closeReasonFor(who) {
  return who === "asker"
    ? "The person you were writing to has ended the conversation. That is their right and it is not a judgement. Thank you for the time you gave."
    : "This conversation has been closed.";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { THREAD_CAP, THREAD_DAYS, whoseTurn, threadState, canWrite,
                     canOpenThread, canSupervise, turnId, SUPERVISION_NOTICE, closeReasonFor };
}
