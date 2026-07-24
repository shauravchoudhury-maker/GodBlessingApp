// explainer.js
// Builds a ~5-minute spoken "explainer" script for any verse — the YouTube /
// Spotify long-form engine. Structure: hook → the words → where they come from
// → what they mean → how to live it today → a short practice → closing blessing.
// When a hand-written sermon matches the verse, its prose is woven in (richest
// result). Otherwise the script is composed from faith/topic-aware sections.

const SOURCE_CONTEXT = {
  Bible: "These words come to us from the Bible — not a single book, but a library written across centuries by shepherds, poets, prisoners and kings. What's remarkable is that this line survived because ordinary people kept finding it true in their own lives, and passed it on.",
  Gita: "This teaching comes from the Bhagavad Gita, and the setting matters. It's spoken on a battlefield, to a man named Arjuna who is paralysed — he can't see a good way forward. So this isn't advice from a calm room. It's wisdom meant for the moment you're overwhelmed.",
  Sikh: "This comes from the Guru Granth Sahib — the living scripture of the Sikh tradition. It isn't written as rules; it's written as songs, meant to be sung. And its heartbeat is simple: one Light lives in every person, without exception.",
  Dhammapada: "This is from the Dhammapada, a collection of the Buddha's shortest and sharpest teachings. Each one is less an instruction than an observation — here's how the mind actually works. You're invited to test it, not just believe it.",
  Tripitaka: "This comes from the Tripitaka, the earliest gathered teachings of the Buddha, carried by memory long before they were ever written down. They were preserved word for word because generation after generation found that they worked.",
  Torah: "This comes from the Torah — the heart of the Hebrew Bible, and one of the oldest living texts on earth. For thousands of years it has been read aloud, argued over and loved, line by line, by people trying to live well. It was never meant to sit on a shelf; it was meant to be wrestled with.",
  Tao: "This is from the Tao Te Ching, written in China some two and a half thousand years ago and attributed to the sage Lao Tzu. It doesn't push or preach. It points — usually to nature, to water, to the quiet power of not forcing — and lets you notice the rest for yourself.",
  Wisdom: "These words have outlived empires. They were written long before anyone imagined our world of screens and notifications — and yet they read like they were written this morning, for exactly what you're carrying.",
};

const HOOKS = {
  hope: "If today feels heavy, and you're not sure anything is going to shift — stay with me for the next few minutes.",
  strength: "There's a kind of tired that sleep doesn't fix. If that's you today, this is for you.",
  peace: "If your mind has been running all day and won't sit down, let's slow it together for five minutes.",
  love: "Most of us are far kinder to other people than we are to ourselves. Let's talk about that.",
  courage: "There's something you already know you need to do. This is about finding the nerve to begin.",
  gratitude: "When everything feels like it's lacking, one small shift changes the whole day. Here it is.",
  purpose: "If you've been wondering whether any of what you're doing actually matters — listen to this.",
  comfort: "If you're carrying something you haven't told anyone about, you're not alone in this. Let's sit with it.",
  guidance: "When you can't see the whole path, there's still a way to take the next step. Here's how.",
  perseverance: "You're not behind. You're just in the part nobody posts about. Let's talk about staying in it.",
  wisdom: "The loudest advice is rarely the wisest. Here's a quieter one that has lasted thousands of years.",
  protection: "If you feel exposed right now — like everything could come apart — hear this.",
  joy: "Joy isn't something you earn at the end. Here's where it actually hides.",
  change: "Everything in your life is moving, including you. Here's how to stop fighting that.",
};

const APPLICATIONS = {
  hope: "So what do you do with that today? You don't have to manufacture optimism. Hope isn't pretending the hard thing isn't hard. It's refusing to believe that the hard thing gets the final word. Practically: pick one small thing you can still do today, and do it. Hope is built out of small kept promises to yourself, not big feelings.",
  strength: "Here's how you carry that into today. Stop trying to feel strong — that's not the assignment. Strength isn't the absence of shaking. It's doing the next honest thing while you shake. So name the one task you've been avoiding because you don't feel up to it, and do just the first two minutes of it. That's all.",
  peace: "So how do you actually live this? Peace rarely arrives because your circumstances got tidy. It arrives when you stop rehearsing a future that hasn't happened. Try this today: when you catch your mind sprinting ahead, say to yourself, gently — not now. Come back to what's in front of you. That's the whole practice, done a hundred times.",
  love: "So let's make it real. Today, catch the voice in your head speaking to you the way you'd never speak to someone you love. And then answer it. Say the kinder, truer thing out loud if you can. Being loved isn't something you have to qualify for — and neither is being loved by yourself.",
  courage: "Here's what that looks like today. Courage isn't a feeling you wait for — it's a decision you make while afraid. So choose one small brave thing. Send the message. Ask the question. Start the thing badly. You don't need to be fearless; you just need to be willing.",
  gratitude: "So try this today. Don't hunt for big things to be thankful for — that's exhausting and it rarely works. Find one small, ordinary, easily-missed thing. The warmth of the cup in your hands. Someone who answered when you called. Name it. Gratitude isn't denial of what's hard; it's refusing to let the hard thing blind you to everything else.",
  purpose: "So what does that mean for your Tuesday? Purpose almost never announces itself. It shows up as the next small, useful, faithful thing in front of you. You don't have to find your whole life's meaning today. Do the next right thing well. That's how a meaningful life is actually assembled — quietly, in pieces.",
  comfort: "So carry this today. You don't have to be okay to be held. You don't have to explain it well, or have a plan, or be further along than you are. Let one person in this week — even a little. What you're carrying was never meant to be carried in silence.",
  guidance: "Here's how you use that today. You almost never get the whole map. You get the next step, lit just enough. So stop demanding certainty before you move. Ask instead: what is the one next step I can actually see? Take that. The path tends to reveal itself to people who are walking.",
  perseverance: "So here's your move today. Don't measure yourself against where you thought you'd be. Measure whether you're still going. Slow is not the same as stopped, and rest is not the same as quitting. Do one small thing that keeps you in the game — and then let that be enough.",
  wisdom: "So how do you live that? Wisdom usually sounds boring in the moment. It's the slower choice, the quieter one, the one that doesn't get applause. Today, when you feel the pull to react fast, wait sixty seconds. Almost every regret I've heard of lives inside those sixty seconds.",
  protection: "So hold onto this today. Feeling exposed is not the same as being abandoned. You are more held than you feel. Name what's frightening you honestly — out loud or on paper. Fear shrinks in the light, and things named lose most of their grip.",
  joy: "So look for it today. Joy isn't waiting at the finish line of your to-do list. It hides in small, unimpressive moments you're moving too fast to notice. Slow down for one of them today, on purpose. That's not indulgence. That's how people last.",
  change: "So let this land today. You are allowed to be different from who you were. You don't have to defend an older version of yourself. Ask: what am I still doing only because I've always done it? Let one of those go this week.",
};

// "What people get this wrong about" — the beat that makes an explainer feel earned.
const MISREADINGS = {
  hope: "Now, here's where people misread this. They hear it as a promise that things will work out the way they want, on their timeline. It isn't. Read honestly, it never says the pain is temporary or small. It says you are not abandoned inside it. That's a very different claim — and a far sturdier one, because it doesn't collapse the moment life fails to cooperate.",
  strength: "Here's the part people get wrong. They read this as a demand — be stronger, try harder, stop struggling. It says the opposite. It assumes you're depleted. It's spoken to people who are already at the end of themselves. The strength being described isn't manufactured by effort; it's what shows up when you finally stop pretending you have it.",
  peace: "But notice what it doesn't say. It doesn't say the storm stops. It doesn't promise a quiet life, or that the thing you're dreading won't come. The peace here isn't the absence of trouble — it's a steadiness underneath it. People miss that, and then feel like failures when life stays loud. Life stays loud. That was never the measure.",
  love: "Here's the common misreading. We treat love as a reward for becoming good enough — as if there's a threshold, and one day we'll cross it. But every honest reading of this says the love came first, before the improving, before the proving. You're not working toward being loved. You're working from it. That reorders everything.",
  courage: "And here's what people get wrong. They wait to feel ready. But nothing here suggests the fear disappears first. Courage isn't the moment fear leaves; it's the moment you move while it's still sitting in your chest. If you're waiting to stop being afraid before you begin, you'll wait forever — and that waiting is the actual risk.",
  gratitude: "Now the misreading. Gratitude gets used as a way to shut people up — be thankful, others have it worse. That's not this. Real gratitude never requires you to pretend the hard thing isn't hard. It simply refuses to let the hard thing be the only thing you can see. You can grieve and be grateful in the same hour. Most of us do.",
  purpose: "Here's where we go wrong. We hear 'purpose' and think it means something enormous and singular — one calling, waiting to be found, and we're failing until we find it. But read it plainly: nothing here says your life needs to be impressive. It says it matters. Those aren't the same, and confusing them has exhausted a lot of good people.",
  comfort: "But people misread this as sentiment — a nice thing to say at funerals. It's tougher than that. It doesn't deny the darkness or hurry you through it. It just refuses to let you be alone in it. That's not a soft claim; it's the hardest one to keep. And it's the only one that helps at 3am.",
  guidance: "Here's the misreading. People want this to mean they'll get clarity — the whole plan, in advance, so they can stop feeling uncertain. It never promises that. It promises company and enough light for the next step. If you're waiting for certainty before you move, you've misunderstood what's on offer — and you'll stay exactly where you are.",
  perseverance: "And here's what gets lost. This isn't a command to grind yourself down. Nothing here glorifies exhaustion. It's not saying never rest; it's saying never quit — and those get confused constantly. You can stop for a while and still be going. The only failure described here is deciding you're done.",
  wisdom: "Now, the misreading. Wisdom gets mistaken for cleverness — the fastest, sharpest answer. But almost every tradition says the opposite: the wise voice is usually the quiet one, the slow one, the one willing to say 'I don't know yet.' If you're optimising for sounding right, you've already left the path this describes.",
  protection: "Here's where people stumble. They read this as a guarantee nothing bad will happen — and then when something does, they conclude it was never true. But it doesn't promise a life without harm. It promises that harm doesn't get the last word, and that you're not facing it unaccompanied. That survives contact with real life. The other reading doesn't.",
  joy: "But here's the misreading. We treat joy as a reward — something waiting after the work, the fixing, the arriving. Nothing here says that. Joy shows up in the middle, unearned and inconvenient and small. If you've scheduled it for later, you'll find later keeps moving.",
  change: "Here's what people miss. We hear this as loss — everything slipping away. But read it again: if everything changes, so does the thing crushing you right now. So do you. Impermanence isn't only what takes things from you; it's the reason nothing can hold you forever.",
};

const DEEPER_FRAMES = [
  "Sit with why this line survived. It wasn't preserved because it was beautiful — plenty of beautiful things are forgotten. It lasted because generation after generation of ordinary, exhausted, frightened people tested it against their actual lives and found it held. It has been read in famines and hospitals and prisons, by people with far less than you and far more to fear. It kept working. That's not proof it's true. But it's the closest thing to evidence that a piece of wisdom can offer.",
  "Notice how little it asks of you. There's no qualification here, no entry requirement, no small print about deserving it. That's easy to skim past, but it's the whole point. Most of the voices you'll hear today — the feed, the inbox, the one inside your own head — will tell you that you have to earn your place. This one doesn't. It simply starts from the assumption that you already have one. Read it again with that in mind and it changes shape.",
  "It's worth asking who this was first said to. Not to people with their lives in order. These words were carried by people in the middle of it — in exile, in doubt, in grief, on the worst day of their lives. That's who this language was built for. So if you're coming to it tired, or unsure, or barely holding it together, you're not reading someone else's mail. You're exactly the intended audience.",
  "Here's what strikes me most. This doesn't try to fix you. It doesn't hand you a five-step plan or tell you what to optimise. It just tells you the truth and lets you sit with it. We're so used to advice that demands something that we barely recognise wisdom when it simply offers. You don't have to do anything with this line today. You just have to let it be true.",
];

// The honest objection — the beat that keeps sceptical listeners watching.
const OBJECTION_FRAMES = [
  "Now, let's be honest about something. You might be listening to this and thinking: that's a nice sentence, but it doesn't feel true for me today. And I want to say clearly — that's allowed. Nothing here asks you to feel it. Words like these were never meant to be believed on demand, in one sitting, on your worst day. They're meant to be lived with. You keep them nearby, and some ordinary Tuesday months from now, they land. The not-feeling-it isn't failure. It's just the part before.",
  "Here's the honest problem though. Wisdom is easy to agree with and almost impossible to do. You'll nod at this, close the app, and be back inside the same anxious loop within ten minutes. That's not weakness — that's just how minds work. Which is exactly why this needs to be small. Not a transformation. One line, remembered once, in the moment it's needed. That's the whole mechanism. Anything grander tends to be forgotten by lunch.",
  "And if you're sitting there thinking you've heard this before — you probably have. That's not a flaw in it. We don't actually have a shortage of wisdom in the world; we have a shortage of remembering it at the right moment. You already know most of what would help you. The point of five minutes like this isn't new information. It's putting an old truth close enough to the surface that it's there when you reach for it.",
  "Let me name the obvious objection. If a line this old were really enough, wouldn't everything be fixed by now? But that's asking wisdom to do a job it never claimed. It doesn't remove the hard thing. It changes who you are while you're inside it — and that turns out to matter more than we expect. It won't make today easy. It might make today survivable, and then bearable, and eventually different.",
];

const QUESTIONS = [
  "So here's a question to carry with you: if you actually believed this line — not agreed with it, believed it — what would you do differently in the next hour?",
  "Sit with this question today: what would change if you stopped trying to earn the thing this line says you already have?",
  "Here's the question worth sitting with: who taught you the opposite of this — and are they still worth listening to?",
  "One question before we close: what's the smallest thing you could do today that would only make sense if this were true?",
];

const PRACTICES = [
  "Before we finish, take one slow breath with me. In — and let it out slowly. Now say the line to yourself once more, in your own voice, as if it were written for you. Because it was.",
  "Let's close with something small. Put your hand flat somewhere solid — a table, your chest. Breathe in for four, out for six. And carry just one word from this with you. One is enough.",
  "Before you go, do this. Close your eyes for five seconds and picture the one person you'd want to hear this today. If you can, send it to them. Wisdom grows when it's passed on.",
  "One last thing. Take a slow breath, and set down — just for this moment — the thing you've been gripping all day. It'll still be there. But you don't have to hold it every second.",
];

const CLOSINGS = [
  "However today has treated you, may you find a little more room to breathe. You are seen, you are loved, and you are not carrying it alone.",
  "May today be gentler than you expect, and may you be gentler with yourself than you've been. You are not behind. You are exactly where you are.",
  "Go easy today. Do the next small thing. Let that be enough — because it is.",
];

function pickBy(arr, seedStr) {
  const h = (seedStr || "x").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  return arr[Math.abs(h) % arr.length];
}

// Build the ~5-minute spoken script.
function explainerScript(v) {
  const faith = faithLabel(v.faith);
  const meaning = meaningFor(v);
  const sermon = (typeof SERMONS !== "undefined") ? SERMONS.find((s) => s.verseRef === v.ref) : null;
  const hook = HOOKS[v.topic] || "Take five minutes with me. This one is worth slowing down for.";
  const context = SOURCE_CONTEXT[v.faith] || SOURCE_CONTEXT.Wisdom;
  const application = APPLICATIONS[v.topic] || APPLICATIONS.purpose;
  const practice = pickBy(PRACTICES, v.ref);
  const closing = pickBy(CLOSINGS, v.ref + "c");

  const parts = [];
  parts.push(`${hook}`);
  parts.push(`Welcome to EverVerse. I'm going to read you one line, and then we'll spend a few minutes on what it actually means — in plain words, for an ordinary day.`);
  parts.push(`Here it is. From ${faith}. ${v.ref}.`);
  parts.push(`${v.text}`);
  parts.push(`Let me read that once more, slower. ${v.text}`);
  parts.push(`Now — where does this come from? ${context}`);
  parts.push(`So what does it actually mean? In plain words: ${meaning}`);
  parts.push(`${MISREADINGS[v.topic] || MISREADINGS.purpose}`);
  if (sermon) {
    parts.push(`Let's go deeper. ${(sermon.body || []).join(" ")}`);
    if (sermon.takeaway) parts.push(`If you take one thing from this, take that: ${sermon.takeaway}`);
  } else {
    parts.push(`${pickBy(DEEPER_FRAMES, v.ref + "d")}`);
    parts.push(`It's worth noticing what this line does not say. It doesn't ask you to be impressive, or finished, or certain. It meets you exactly where you are — which is usually tired, usually mid-way through something, and usually doing better than you give yourself credit for.`);
  }
  parts.push(`${pickBy(OBJECTION_FRAMES, v.ref + "o")}`);
  parts.push(`${application}`);
  parts.push(`${pickBy(QUESTIONS, v.ref + "q")}`);
  parts.push(`${practice}`);
  parts.push(`${closing}`);
  parts.push(`This has been EverVerse — a daily blessing for every soul, from the world's wisdom traditions. If this helped, subscribe, and find a new one every day at eververse dot org.`);

  const script = parts.join("\n\n");
  const words = (script.trim().match(/\S+/g) || []).length;
  return { script, words, minutes: words / 150, hasSermon: !!sermon };
}

// A 1280x720 YouTube thumbnail for the verse (bold, on-brand).
function explainerThumbnail(v) {
  const c = document.createElement("canvas");
  const bg = (typeof bgForVerseApp === "function") ? bgForVerseApp(v) : "aura";
  renderVerse(c, 1280, 720, { text: v.text, ref: v.ref, paletteKey: v.theme, bgKey: bg, watermark: true, showRef: true, layout: "poster" });
  return c;
}

// YouTube listing metadata (title / description / tags).
function explainerYouTube(v) {
  const { script, words, minutes } = explainerScript(v);
  const faith = faithLabel(v.faith);
  const meaning = meaningFor(v);
  const title = `${v.ref} — What It Really Means | ${Math.max(3, Math.round(minutes))}-Minute ${faith} Explainer`;
  const description =
    `"${v.text}" — ${v.ref}\n\n` +
    `In simple words: ${meaning}\n\n` +
    `A five-minute explainer: where this line comes from, what it actually means in plain language, and how to live it today. From EverVerse — a daily blessing for every soul, drawn from the world's wisdom traditions.\n\n` +
    `⏱ Chapters\n0:00 The hook\n0:20 The verse\n0:50 Where it comes from\n1:40 What it means\n2:50 How to live it today\n4:10 A short practice\n4:40 Closing blessing\n\n` +
    `🔔 Subscribe for a new blessing every day.\n✦ eververse.org\n📱 Get the EverVerse app — daily verses, meanings, wallpapers & audiobooks.\n\n` +
    `#${v.faith.toLowerCase()} #dailyverse #${(v.topic || "wisdom")} #spirituality #meditation #eververse`;
  const tags = [
    v.ref, faith, v.topic, "daily verse", "verse of the day", "meaning explained",
    "5 minute devotional", "spirituality", "meditation", "wisdom", "eververse",
  ].filter(Boolean).join(", ");
  return { title, description, tags, script, words, minutes };
}

/* ================================================================== */
/*  60-second short — YouTube Shorts / TikTok / Reels                  */
/* ================================================================== */
// ~150 words ≈ 60s at a calm 150 wpm. Structure that holds a scroller:
// hook → the words → what they mean → one thing to do → blessing + follow.
// Kept deliberately short: the caption engine puts these lines on screen,
// so every sentence has to earn its place.

// Scroll-stopping openers. The first line — spoken AND on screen — decides
// whether someone stays, so these lead with a pattern-interrupt or a direct
// "this is for you" and promise value fast. Kept short (they eat into the 60s).
const SHORT_HOOKS = [
  "Stop scrolling. This is the sixty seconds that resets your day.",
  "If this showed up on your feed today, it isn't an accident.",
  "You weren't meant to scroll past this one.",
  "If nobody has told you this today — let this be it.",
  "Save this. There is a day coming when you'll need it.",
  "Give me one minute. I'll give you something to hold onto.",
  "One verse. Sixty seconds. It might be the thing you remember today.",
  "Before the day swallows you — thirty seconds, right here.",
  "This is your sign to slow down for exactly one minute.",
  "Read the first line. If it doesn't land, keep scrolling — but it will.",
  "Everyone needs to hear this today. Maybe especially you.",
  "The words are ancient. What they do to you is immediate.",
  "You've seen a hundred quotes today. Stay for the one that's different.",
  "If your chest feels tight today, start right here.",
  "Do not scroll past this. Future-you is asking you to stay.",
];
// Opener tuned to what the verse is actually about — pulled in alongside the
// general pool so the hook feels written for this moment, not bolted on.
const SHORT_HOOKS_BY_TOPIC = {
  hope: [
    "If you're running low on reasons to keep going — one minute.",
    "For anyone who needs proof that this doesn't last forever.",
  ],
  strength: [
    "There's a kind of tired sleep doesn't fix. If that's you, stay.",
    "You don't have to be strong for the next sixty seconds. Just listen.",
  ],
  peace: [
    "If your mind won't sit down today, let's quiet it together.",
    "For the overthinkers at 2am — this one's for you.",
  ],
  love: [
    "Someone needs to remind you that you are loved. Let it be this.",
    "If you've felt like too much, or not enough — stay a minute.",
  ],
  courage: [
    "For the thing you've been too scared to start.",
    "If you're waiting to feel ready — watch this first.",
  ],
  perseverance: [
    "If you're this close to quitting — give me sixty seconds first.",
    "For anyone who fell down again today. Especially you.",
  ],
  purpose: [
    "If you've been wondering whether any of it matters — stay.",
    "For the day your life feels small. It isn't.",
  ],
  comfort: [
    "If today broke your heart a little, come here.",
    "For the 3am version of you. Save this one.",
  ],
  gratitude: [
    "Sixty seconds to remember what's still good.",
    "Before you list what's wrong — one thing that's right.",
  ],
  faith: [
    "For the moment you can't see the next step — stay.",
    "When you have to move before it makes sense — watch this.",
  ],
  guidance: [
    "If you don't know which way to go — sixty seconds.",
    "For the crossroads you've been standing at too long.",
  ],
  change: [
    "If everything's shifting under you right now — stay.",
    "For the season that's ending whether you're ready or not.",
  ],
  wisdom: [
    "One old line that could change how you handle today.",
    "The smartest thing you'll hear today is also the oldest.",
  ],
  joy: [
    "Permission to feel good for sixty seconds. Take it.",
    "This is your reminder that joy doesn't wait for later.",
  ],
  protection: [
    "For the day you feel exposed and unsafe — stay a minute.",
    "If fear has been loud lately, start here.",
  ],
};
// Blend topic-specific openers with the general pool, then pick deterministically
// so a given verse always leads with the same (best-fit) hook.
function shortHook(seed, topic) {
  const pool = (SHORT_HOOKS_BY_TOPIC[topic] || []).concat(SHORT_HOOKS);
  return pickBy(pool, seed);
}

// Native hooks per language — written, not machine-translated, so a Hindi or
// Spanish short opens just as sharply as the English one.
const SHORT_HOOKS_L10N = {
  hi: {
    general: [
      "रुको मत — ये एक मिनट तुम्हारा दिन बदल सकता है।",
      "अगर आज किसी ने ये नहीं कहा, तो यहीं से सुन लो।",
      "इसे सेव कर लो — एक दिन इसकी ज़रूरत ज़रूर पड़ेगी।",
      "बस एक मिनट दो, कुछ ऐसा मिलेगा जिसे थामे रह सको।",
      "आज सौ बातें सुनी होंगी — ये वाली अलग है, रुको।",
      "स्क्रॉल मत करो। अगला एक मिनट सब कुछ शांत कर देगा।",
      "ये तुम्हारे लिए है। बस एक मिनट।",
      "अगर आज मन भारी है, तो साठ सेकंड मेरे साथ रहो।",
    ],
    topic: {
      hope: ["अगर हिम्मत टूट रही है — बस एक मिनट रुको।"],
      strength: ["एक थकान ऐसी होती है जो नींद से नहीं जाती। अगर वो तुम हो, तो रुको।"],
      peace: ["अगर मन आज कहीं टिक नहीं रहा, तो इसे साथ में शांत करें।"],
      love: ["किसी को याद दिलाना है कि तुम अनमोल हो — ये वही पल है।"],
      courage: ["उस काम के लिए जिसे शुरू करने से तुम डरते रहे।"],
      comfort: ["अगर आज दिल थोड़ा टूटा है, तो यहाँ आ जाओ।"],
      perseverance: ["अगर तुम हार मानने ही वाले हो — पहले साठ सेकंड दो।"],
    },
  },
  es: {
    general: [
      "No sigas deslizando. Este es el minuto que cambia tu día.",
      "Si nadie te lo ha dicho hoy — que sea esto.",
      "Guárdalo. Llegará un día en que lo necesitarás.",
      "Dame un minuto y te daré algo a lo que aferrarte.",
      "Has visto cien frases hoy. Quédate por la que es distinta.",
      "Esto es para ti. Un minuto, nada más.",
      "Deja de deslizar. Los próximos sesenta segundos lo calman todo.",
      "Si hoy sientes el pecho apretado, empieza aquí.",
    ],
    topic: {
      hope: ["Si te estás quedando sin razones para seguir — un minuto."],
      strength: ["Hay un cansancio que el sueño no cura. Si ese eres tú, quédate."],
      peace: ["Si tu mente no para hoy, calmémosla juntos."],
      love: ["Alguien necesita recordarte que eres amado. Que sea esto."],
      courage: ["Para eso que has tenido demasiado miedo de empezar."],
      comfort: ["Si hoy se te rompió un poco el corazón, ven aquí."],
      perseverance: ["Si estás a punto de rendirte — dame sesenta segundos primero."],
    },
  },
};
// Language-aware hook: native pool for hi/es, else the English blend.
function shortHookLocalized(seed, topic, lang) {
  const L = SHORT_HOOKS_L10N[lang];
  if (!L) return shortHook(seed, topic);
  const pool = ((L.topic && L.topic[topic]) || []).concat(L.general);
  return pickBy(pool, seed);
}
const SHORT_BRIDGES = [
  "Here is what that actually means.",
  "In plain words:",
  "Read it again, slowly. Here is the heart of it.",
  "What is it really saying?",
];
const SHORT_ACTIONS = {
  hope: "So today, do one small thing that assumes it gets better. That is what hope looks like in practice.",
  strength: "So today, do the next hard thing badly rather than perfectly. Starting is the strength.",
  peace: "So today, put one worry down for ten minutes. Just ten. You can pick it back up if you must.",
  love: "So today, send the message you keep meaning to send. Love that stays in your head helps nobody.",
  courage: "So today, do the one brave thing you have been circling. Small counts.",
  perseverance: "So today, take one more step than yesterday. That is the whole secret.",
  purpose: "So today, spend twenty minutes on the thing that actually matters to you.",
  wisdom: "So today, pause before you answer once. One pause changes the whole exchange.",
  gratitude: "So today, name one good thing out loud before you sleep.",
  comfort: "So today, be as kind to yourself as you would be to a friend having your day.",
  guidance: "So today, take the next step you can actually see. The rest will show up.",
  faith: "So today, trust the step in front of you before you can see the staircase.",
  change: "So today, let one old thing go. You are allowed to begin again.",
};
const SHORT_CLOSES = [
  "You are not carrying this alone. See you tomorrow.",
  "Come back tomorrow — there is another one waiting for you.",
  "Take that with you today. Follow for one every morning.",
  "Save this for the day you need it. Follow for a daily blessing.",
];

// First n sentences of a longer block — lets the short borrow the strongest
// beat of a full-length section without dragging the whole thing in.
function firstSentences(text, n) {
  if (!text) return "";
  const s = text.match(/[^.!?]+[.!?]+/g) || [text];
  return s.slice(0, n).join(" ").trim();
}
const SHORT_MIN_WORDS = 138;   // ~55s at 150 wpm
const SHORT_MAX_WORDS = 168;   // ~67s

// Build the spoken script + matching caption text for a verse.
// The "misreading" beat is what keeps a scroller watching, so it is part of
// the core rather than padding; a reflective question is added only if the
// script would otherwise land short of a minute.
function shortScript(v) {
  const faith = (typeof faithLabel === "function") ? faithLabel(v.faith) : v.faith;
  const meaning = (typeof meaningFor === "function") ? meaningFor(v) : "";
  const parts = [
    shortHook(v.ref, v.topic),
    // The verse stands alone so a curated translation can match it exactly;
    // the attribution is a separate part and is never machine-translated.
    v.text,
    `— ${v.ref}, ${faith}.`,
    pickBy(SHORT_BRIDGES, v.ref + "b"),
    meaning,
    firstSentences(MISREADINGS[v.topic], 2),
    SHORT_ACTIONS[v.topic] || SHORT_ACTIONS.hope,
  ].filter(Boolean);
  return finishShort(parts, pickBy(SHORT_CLOSES, v.ref + "c"), [
    firstSentences(pickBy(QUESTIONS, v.ref), 1),
    firstSentences(pickBy(DEEPER_FRAMES, v.ref + "d"), 2),
  ], { hookSeed: v.ref, hookTopic: v.topic });
}

// Sermon version — leans on the hand-written takeaway.
function shortScriptForSermon(s) {
  const v = (typeof VERSE_DB !== "undefined") ? VERSE_DB.find((x) => x.ref === s.verseRef) : null;
  const faith = (typeof faithLabel === "function" && s.faith) ? faithLabel(s.faith) : "";
  const seed = s.id || s.verseRef;
  const parts = [
    shortHook(seed, v ? v.topic : (s.topic || "hope")),
    v ? v.text : "",
    `— ${s.verseRef}${faith ? ", " + faith : ""}.`,
    pickBy(SHORT_BRIDGES, seed + "b"),
    s.takeaway,
    v ? firstSentences(MISREADINGS[v.topic], 2) : "",
    v ? (SHORT_ACTIONS[v.topic] || SHORT_ACTIONS.hope) : "",
  ].filter(Boolean);
  return finishShort(parts, pickBy(SHORT_CLOSES, seed + "c"), [
    firstSentences(pickBy(QUESTIONS, seed), 1),
    v ? firstSentences(s.body && s.body[0] ? s.body[0] : "", 2) : "",
  ], { hookSeed: seed, hookTopic: v ? v.topic : "hope" });
}

// Assemble to a ~60s target: pad with extras while short, drop middle
// sentences while long, then always end on the closing line.
function finishShort(parts, close, extras, meta) {
  const count = (a) => a.join(" ").split(/\s+/).filter(Boolean).length;
  const body = parts.slice();
  const pool = (extras || []).filter(Boolean);
  while (count(body) + count([close]) < SHORT_MIN_WORDS && pool.length) {
    body.splice(body.length - 1, 0, pool.shift());   // insert before the action
  }
  let all = body.concat([close]);
  if (count(all) > SHORT_MAX_WORDS) {
    const sents = all.join(" ").match(/[^.!?]+[.!?]+/g) || all;
    while (sents.length > 4 && count(sents) > SHORT_MAX_WORDS) {
      sents.splice(Math.max(1, Math.floor(sents.length / 2)), 1);
    }
    all = sents;
  }
  const script = all.join(" ").replace(/\s+/g, " ").trim();
  const words = script.split(/\s+/).filter(Boolean).length;
  // `parts` is what callers translate piece by piece — each stays under the
  // machine-translation length cap, and the verse part can hit a curated entry.
  // hookSeed/hookTopic let a caller swap in a native-language hook for parts[0].
  return Object.assign({ script, words, seconds: Math.round((words / 150) * 60), parts: all }, meta || {});
}
// Attribution lines ("— Psalm 46:10, Bible.") are left in the original script.
function isShortAttribution(part) { return /^\s*—/.test(part || ""); }

// Ready-to-paste listing copy for a short.
function shortListing(v, secs) {
  const faith = (typeof faithLabel === "function") ? faithLabel(v.faith) : v.faith;
  const title = `${v.ref} — ${String(v.text).split(/[,.;]/)[0].trim()} #shorts`;
  const tags = [v.ref, faith, v.topic, "shorts", "dailyverse", "verseoftheday",
    "faith", "motivation", "devotional", "eververse"].filter(Boolean);
  const description = `${v.text}\n— ${v.ref} (${faith})\n\n${(typeof meaningFor === "function") ? meaningFor(v) : ""}\n\nA one-minute blessing every day from EverVerse — eververse.org\n\n${tags.map((t) => "#" + String(t).replace(/[^\w]+/g, "")).join(" ")}`;
  return { title: title.slice(0, 100), description, tags: tags.join(", "), seconds: secs };
}
