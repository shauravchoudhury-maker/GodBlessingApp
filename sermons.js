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
  {
    id: "sikh-earn-share",
    title: "Earn Honestly, Give Freely",
    faith: "Sikh", theme: "gold", verseRef: "Guru Granth Sahib, Ang 1245",
    verseText: "One who works for what they eat, and gives away some of what they have — O Nanak, they know the true path.",
    body: [
      "It's tempting to think holiness lives somewhere far off — in mountaintops or grand rituals. Guru Nanak points somewhere much closer: your daily work and your open hand.",
      "Earn your bread honestly, he says, and then share it. Not because you have extra, but because giving is how the heart stays soft and connected. A life of honest labour and quiet generosity is itself the spiritual path — no ladder to climb, just this, done with love.",
      "Today, you can walk that path in the smallest way: do your work with integrity, and give something away — your time, your help, a portion of what you have. That is where the sacred and the ordinary meet.",
    ],
    takeaway: "Honest work and an open hand — that ordinary, generous life is the true path.",
  },
  {
    id: "sikh-one-light",
    title: "The One Light in Everyone",
    faith: "Sikh", theme: "royal", verseRef: "Guru Granth Sahib, Ang 1349",
    verseText: "First, God created the Light; from that One Light came the whole creation. So who is good, and who is bad?",
    body: [
      "We spend so much energy sorting people — us and them, worthy and unworthy, insider and outsider. This verse gently dismantles all of it.",
      "If one Light gave rise to everyone, then that same Light is shining, however dimly, in the person who annoys you, the stranger, even the one you'd call an enemy. The labels we hang on each other are small; the shared source is vast.",
      "You don't have to agree with everyone to honour the Light in them. Today, try seeing one person you'd normally dismiss as a carrier of that same sacred flame. It changes how you speak, how you soften, how you love.",
    ],
    takeaway: "One Light shines in every person — so look past the labels and honour the sacred in all.",
  },
  {
    id: "dhp-guard-mind",
    title: "Tend the Garden of Your Mind",
    faith: "Dhammapada", theme: "night", verseRef: "Dhammapada 1",
    verseText: "Mind precedes all things; mind is their chief, they are mind-made. Speak or act with a pure mind, and happiness follows like a shadow that never leaves.",
    body: [
      "The Buddha begins the Dhammapada with a quietly radical idea: your life takes the shape of your thoughts. What you repeatedly dwell on becomes the mood you live in, the words you speak, the acts you do.",
      "This isn't about forcing positivity. It's about tending — noticing the seeds of bitterness or fear before they take over, and gently watering thoughts of kindness, patience and truth instead.",
      "You can't control every thought that arises, but you can choose which ones you feed. Feed the good ones today, and watch how peace begins to follow you around like a shadow that won't leave.",
    ],
    takeaway: "Your life follows your thoughts — tend your mind with care, and peace will follow you.",
  },
  {
    id: "dhp-conquer-self",
    title: "The Victory That Matters",
    faith: "Dhammapada", theme: "bold", verseRef: "Dhammapada 103",
    verseText: "Though one may conquer a thousand men in battle a thousand times, the one who conquers themselves is the greatest victor.",
    body: [
      "The world celebrates victories over others — the argument won, the rival beaten, the competitor left behind. The Buddha points to a harder, quieter conquest.",
      "The truly great victory is over yourself: over the flash of anger, the pull of craving, the habit you keep returning to. No one applauds these wins, and no one else even sees them — but they change everything.",
      "You don't have to win them all at once. Just the next one: the pause before the harsh reply, the choice to let go instead of grasp. Each small self-conquest is a greater triumph than any battle.",
    ],
    takeaway: "The greatest victory isn't over others — it's mastering yourself, one quiet choice at a time.",
  },
  {
    id: "trip-love-no-walls",
    title: "A Love Without Walls",
    faith: "Tripitaka", theme: "warm", verseRef: "Metta Sutta",
    verseText: "As a mother would protect her only child with her life, so let one cultivate boundless love toward all living beings.",
    body: [
      "We know how to love a few people fiercely — a child, a partner, a close friend. The Metta Sutta invites us to take that same protective tenderness and let it grow until it has no edges.",
      "Boundless love doesn't mean feeling warm about everyone all the time. It means genuinely wishing every being well — even those you'll never meet, even those who trouble you. It's a practice: quietly wishing safety, ease and happiness outward, ring by widening ring.",
      "Start small today. Wish yourself well, then someone you love, then someone neutral, then someone difficult, then all beings everywhere. A heart practised this way slowly loses its walls.",
    ],
    takeaway: "Take the fierce love you feel for a few, and let it grow until it leaves no one out.",
  },
  {
    id: "trip-path-out",
    title: "There Is a Way Through",
    faith: "Tripitaka", theme: "night", verseRef: "Dhammacakkappavattana Sutta",
    verseText: "There is suffering; there is a cause of suffering; there is an end of suffering; and there is a path that leads to its end.",
    body: [
      "The Buddha's very first teaching is startlingly honest: yes, there is suffering. He doesn't pretend life is painless. But he refuses to stop there.",
      "Suffering has causes — much of it in our grasping and resisting — and because it has causes, it can end. And there is a real, walkable path out. This is not despair; it is the most hopeful thing imaginable: you are not trapped.",
      "Whatever weighs on you today, hold both truths together — the pain is real, and it is not the end of the story. There is a way through, one honest step at a time.",
    ],
    takeaway: "Your pain is real — and it is not the whole story. There is a way through, step by step.",
  },
];

function sermonById(id) { return SERMONS.find((s) => s.id === id); }
