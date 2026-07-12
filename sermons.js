// sermons.js
// Original written devotionals / short sermons for EverVerse — each tied to a
// verse, ~2-3 minutes to read or listen. Reflections (interpretation), grown in
// batches. Body is an array of paragraphs; takeaway is the one line to carry.

const SERMONS = [
  {
    id: "worth-enough",
    title: "When You Feel You're Not Enough",
    faith: "Bible", theme: "comfort", verseRef: "Psalm 139:14",
    verseText: "I praise you because I am fearfully and wonderfully made; your works are wonderful.",
    body: [
      "There is a quiet lie that follows many of us through the day: that we are somehow not enough. Not talented enough, not far enough along, not good enough to be loved as we are. It whispers loudest when we compare our insides to everyone else's outsides.",
      "But listen to what this verse dares to say. You are not an accident or a rough draft. You were made — carefully, intentionally, wonderfully. The same creativity behind sunrises and oceans was at work when you were formed. Your worth was decided before you ever performed, achieved, or proved anything.",
      "That means you can stop auditioning for a love you already have. You can breathe. The pressure to be impressive can fall off your shoulders, because your value was never up for a vote.",
    ],
    takeaway: "You are not too much and not too little. You are wonderfully made — worth was never yours to earn.",
  },
  {
    id: "peace-in-storm",
    title: "Peace in the Middle of the Storm",
    faith: "Bible", theme: "peace", verseRef: "Philippians 4:6",
    verseText: "Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.",
    body: [
      "Anxiety loves to live in the future. It runs ahead of us into every 'what if,' rehearsing disasters that may never come. And the more we try to think our way out of worry, the tighter it grips.",
      "This verse offers a different door. It doesn't say 'have it all figured out.' It says: take the thing you're carrying and hand it over. Name it honestly in prayer. Peace doesn't come from controlling the outcome — it comes from trusting that you're not carrying it alone.",
      "You don't have to be calm to begin. You just have to be honest. Tell God the truth about your fear, and let a peace that doesn't quite make sense begin to guard your heart.",
    ],
    takeaway: "Trade the weight of worry for honest prayer — peace guards the heart that lets go.",
  },
  {
    id: "strength-weary",
    title: "Strength for the Weary",
    faith: "Bible", theme: "strength", verseRef: "Isaiah 40:31",
    verseText: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary.",
    body: [
      "Tiredness isn't only physical. There's a deeper weariness that comes from carrying life for a long time — from being strong for everyone, from hoping and not yet seeing.",
      "Notice the promise here isn't that you'll never get tired. It's that your strength can be renewed — refilled from a source outside yourself. Eagles don't flap harder against the storm; they spread their wings and let the rising wind carry them.",
      "Maybe today the bravest, strongest thing you can do is stop striving and lean into that lift. Hope is not passive. It is how the weary rise again.",
    ],
    takeaway: "You don't have to manufacture strength — hope renews it. Spread your wings and rise.",
  },
  {
    id: "begin-again",
    title: "The Courage to Begin Again",
    faith: "Bible", theme: "hope", verseRef: "Lamentations 3:22-23",
    verseText: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
    body: [
      "Some of us are haunted by yesterday — a failure, a harsh word, a habit we swore we'd break and didn't. Shame tells us the story is over, that we've used up our chances.",
      "But mercy keeps its own calendar. This verse says compassion is new every morning — not stale, not rationed, not running low. Whatever yesterday held, morning brings a clean page.",
      "You are allowed to begin again. Not because you've earned it, but because love hasn't given up on you. Get up. Today is new, and so is the grace waiting in it.",
    ],
    takeaway: "Yesterday doesn't get the final word. Mercy is new this morning — begin again.",
  },
  {
    id: "love-casts-fear",
    title: "Love That Casts Out Fear",
    faith: "Bible", theme: "love", verseRef: "1 John 4:18",
    verseText: "There is no fear in love. But perfect love drives out fear.",
    body: [
      "So much of our fear is really a fear of not being loved — of being found out, left out, not measuring up. We build walls to stay safe, and the walls keep out the very love we ache for.",
      "This verse makes a bold claim: love and fear can't share the same seat. When you truly know you are loved — not for your performance but for your presence — fear loses its footing.",
      "Let yourself be loved today, fully and without earning it. And then pass it on. In a fearful world, choosing to love someone is a quiet act of courage that sets them free too.",
    ],
    takeaway: "You don't have to be afraid to be loved. Perfect love drives fear out — receive it, then give it.",
  },
  {
    id: "gita-do-your-part",
    title: "Do Your Part, Release the Rest",
    faith: "Gita", theme: "purpose", verseRef: "Bhagavad Gita 2:47",
    verseText: "You have a right to your actions, but never to the fruits of your actions. Let not the results be your motive.",
    body: [
      "We exhaust ourselves not by the work itself, but by clinging to how it must turn out. We tie our peace to results we cannot fully control — the outcome, the applause, the reward.",
      "The Gita offers a lighter way to live: give yourself fully to the action that is yours to do, and loosen your grip on the fruit. Plant the seed with love; you are not the one who makes it rain.",
      "This is not laziness — it is freedom. When your effort is sincere and your attachment to outcomes is released, you can act with your whole heart and still sleep in peace.",
    ],
    takeaway: "Pour your heart into the doing, and let go of the outcome. That is where peace lives.",
  },
  {
    id: "gita-befriend-mind",
    title: "Befriending Your Own Mind",
    faith: "Gita", theme: "strength", verseRef: "Bhagavad Gita 6:6",
    verseText: "For those who have conquered the mind, it is their friend. For those who have not, the mind works like an enemy.",
    body: [
      "The hardest person you'll deal with today may be yourself. The mind can be a cruel narrator — replaying mistakes, predicting failure, talking you out of your own peace.",
      "The Gita says this same mind can become your closest friend. Not by force, but by patient practice: noticing the runaway thought, and gently, again and again, guiding it back toward what is true and good.",
      "You are not your loudest thought. You are the quiet witness who can choose which thoughts to feed. Befriend your mind today, and it will begin to carry you instead of dragging you.",
    ],
    takeaway: "Your mind can be friend or enemy — train it gently, and it will start to lift you.",
  },
  {
    id: "gita-steady",
    title: "Steady in Pleasure and Pain",
    faith: "Gita", theme: "peace", verseRef: "Bhagavad Gita 2:48",
    verseText: "Perform your duty with an even mind, abandoning attachment to success and failure. Such evenness of mind is called yoga.",
    body: [
      "Life swings — a good day lifts us high, a hard day drops us low, and we ride the wave up and down, exhausted by our own reactions.",
      "The Gita points to a steadier center: an even mind that meets success without arrogance and failure without despair. This evenness isn't coldness; it's a deep, unshaken calm beneath the changing weather.",
      "You can't stop the waves. But you can learn to stand. Do the next right thing with a steady heart, and let neither the praise nor the setback move you off your center.",
    ],
    takeaway: "Meet the highs and lows with an even mind — steadiness is its own kind of strength.",
  },
  {
    id: "gita-light-returns",
    title: "The Light That Always Returns",
    faith: "Gita", theme: "hope", verseRef: "Bhagavad Gita 4:7",
    verseText: "Whenever righteousness declines and unrighteousness rises, I manifest myself.",
    body: [
      "When we look at the world — or at our own struggles — it can feel like the darkness is winning. Goodness looks fragile, and we wonder if it's worth it to keep doing right.",
      "The Gita answers with a promise older than time: whenever the dark grows heavy, the light rises to meet it. Goodness is never finally defeated; it returns, again and again, often through ordinary people who refuse to give up.",
      "Today, you can be one of those small returns of light. A kind word, an honest choice, a refusal to let bitterness win — this is how the darkness loses ground.",
    ],
    takeaway: "The light always returns — and today, you can be one of the ways it does.",
  },
  {
    id: "gita-surrender",
    title: "Surrender and Be Free",
    faith: "Gita", theme: "faith", verseRef: "Bhagavad Gita 18:66",
    verseText: "Abandon all varieties of duty and simply surrender unto me. I shall deliver you from all sin; do not fear.",
    body: [
      "We carry so much: the need to control, to fix, to hold everything together by sheer will. It feels responsible, but it slowly wears us thin.",
      "The Gita's final invitation is startlingly gentle: let go. Set down the impossible weight of managing it all, and surrender into something larger and kinder than your own effort.",
      "Surrender is not defeat — it is trust. It is opening your clenched hands and discovering they were never meant to hold the whole world. Do not fear. You can lay it down.",
    ],
    takeaway: "You were never meant to carry it all. Surrender the weight — and find you are free.",
  },
];

function sermonById(id) { return SERMONS.find((s) => s.id === id); }
