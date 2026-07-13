// meanings.js
// Plain-language, human meanings for each verse — written so the heart of the
// verse lands in seconds, not lost in theology or translation. Hand-written for
// a growing batch; every other verse falls back to a warm topic-based line so
// nothing is ever blank. Grown in batches, like the verse database.

const MEANINGS = {
  // ---- Bible ----
  "Genesis 1:27": "You carry something of God in you — your life has built-in worth and dignity.",
  "Genesis 28:15": "Wherever you go, you're watched over — you are not walking this road unaccompanied.",
  "Exodus 14:14": "You don't have to fight every battle yourself; sometimes the bravest move is to stay calm and trust.",
  "Deuteronomy 6:5": "Love God with everything you are — let that love steady and center your whole life.",
  "Deuteronomy 31:6": "Whatever you're walking into, you're not walking in alone — choose courage over fear.",
  "Joshua 1:9": "Be brave and keep going; you are accompanied every single step, wherever you go.",
  "1 Samuel 16:7": "You're seen for who you really are inside — not the surface others judge.",
  "1 Chronicles 16:11": "When you feel drained, turn toward God — that's where strength keeps getting refilled.",
  "Psalm 23:1": "You're cared for; you can stop striving for 'enough' — you're already provided for.",
  "Psalm 23:4": "Even in your darkest stretch you're not alone, so fear loses its grip.",
  "Psalm 27:1": "With God as your light, nothing left is big enough to truly fear.",
  "Psalm 34:8": "Try trusting God for yourself — you'll find, first-hand, that he is good.",
  "Psalm 34:18": "When your heart is broken, you are not abandoned — comfort is close.",
  "Psalm 37:4": "Delight in what's good, and your deepest desires get shaped and satisfied.",
  "Psalm 46:1": "When trouble hits, you have a safe place and a present help — right now.",
  "Psalm 46:10": "Pause. Breathe. You don't have to control everything — let peace return.",
  "Psalm 55:22": "Hand the weight over — you were never meant to carry it all alone.",
  "Psalm 118:24": "Today is a gift; choose to find joy in it rather than wait for a better one.",
  "Psalm 119:105": "You don't need the whole road lit — just enough light for the next step.",
  "Psalm 121:1-2": "When you don't know where help will come from, look up — help is on its way.",
  "Psalm 139:14": "You are wonderfully made on purpose — not a mistake, not an accident.",
  "Psalm 147:3": "Your wounds are not ignored; there is healing for the broken places.",
  "Proverbs 3:5-6": "Stop over-analyzing; trust, take the next step, and the path will straighten out.",
  "Proverbs 4:23": "Guard your heart — what you let in quietly shapes the life that flows out.",
  "Proverbs 15:1": "A soft answer cools things down; gentleness is strength, not weakness.",
  "Proverbs 19:21": "Make your plans, but stay open — a bigger purpose is at work.",
  "Isaiah 40:31": "Rest and hope refill your strength — you'll rise again, not run out.",
  "Isaiah 41:10": "Don't be afraid — you are held, strengthened, and helped through this.",
  "Isaiah 43:2": "When you go through deep waters, they won't overwhelm you — you're accompanied.",
  "Jeremiah 29:11": "Your story isn't over; a future and a hope are being written for you.",
  "Lamentations 3:22-23": "However rough yesterday was, mercy is brand new this morning.",
  "Micah 6:8": "Live simply and well: be fair, be kind, and stay humble.",
  "Zephaniah 3:17": "You are so loved that God delights over you — you're a joy, not a burden.",
  "Matthew 5:14": "You carry light — don't hide it; the world needs what you shine.",
  "Matthew 6:33": "Put first things first, and the rest of life falls into better order.",
  "Matthew 6:34": "Don't drown today in tomorrow's worries — handle today and let tomorrow wait.",
  "Matthew 11:28": "If you're exhausted and overloaded, there's a place to lay it down and rest.",
  "Matthew 19:26": "What feels impossible to you is not the final word — grace changes the math.",
  "Matthew 28:20": "You are never actually alone — that presence is with you always.",
  "John 3:16": "You are so loved that heaven gave everything so you'd never be lost.",
  "John 14:27": "Real peace is being offered to you — let your heart stop being troubled.",
  "John 16:33": "Trouble will come, but take heart — it doesn't get the last word.",
  "Romans 8:28": "Even the hard chapters are being woven into something good for you.",
  "Romans 8:31": "If God is on your side, no obstacle is bigger than that backing.",
  "Romans 8:38-39": "Nothing — not failure, fear, or the future — can cut you off from God's love.",
  "Romans 12:12": "Stay hopeful, stay patient, keep praying — that's how you get through.",
  "1 Corinthians 13:4": "Real love is patient and kind — that's the standard worth living by.",
  "1 Corinthians 13:13": "In the end, love is what lasts and what matters most.",
  "2 Corinthians 5:17": "You're not stuck as your old self — a fresh start is genuinely possible.",
  "2 Corinthians 12:9": "Your weak spots aren't disqualifying — grace shows up strongest there.",
  "Galatians 6:9": "Don't quit doing good — the harvest comes if you don't give up.",
  "Ephesians 2:10": "You were made for good things — your life has a designed purpose.",
  "Philippians 4:6": "Trade anxiety for honest prayer — hand over what you can't carry.",
  "Philippians 4:13": "You have access to a strength beyond your own for whatever you face.",
  "Philippians 4:19": "What you truly need will be met — you can loosen your grip on worry.",
  "Colossians 3:23": "Whatever you do, pour your heart into it — your work matters.",
  "Hebrews 11:1": "Faith is being sure of good you can't see yet — hope with backbone.",
  "James 1:5": "If you're unsure what to do, just ask — wisdom is given generously.",
  "1 Peter 5:7": "Whatever's weighing on you, hand it over — you are genuinely cared for.",
  "1 John 4:18": "Love, fully received, quiets fear — you don't have to be afraid to be loved.",
  "1 John 4:19": "You can love others because you were first loved — it starts with being loved.",
  "Revelation 21:4": "A day is coming with no more tears or pain — hold on to that hope.",

  // ---- Bhagavad Gita ----
  "Bhagavad Gita 2:14": "Good days and hard days both pass — ride them out without letting either own you.",
  "Bhagavad Gita 2:20": "The real you never dies; the deepest part of you is untouchable.",
  "Bhagavad Gita 2:47": "Do your best and release the outcome — your job is the effort, not the result.",
  "Bhagavad Gita 2:48": "Stay steady whether you win or lose — that balance is the real success.",
  "Bhagavad Gita 2:56": "Peace is staying calm when life shakes — not craving, not panicking.",
  "Bhagavad Gita 2:70": "Desires keep flowing in like rivers to the sea; peace is staying unshaken by them.",
  "Bhagavad Gita 3:8": "Don't just sit in worry — do your work; right action beats stuck inaction.",
  "Bhagavad Gita 3:21": "People watch how you live — your example quietly sets the standard.",
  "Bhagavad Gita 4:7": "Whenever things go dark, goodness rises again — light always returns.",
  "Bhagavad Gita 5:10": "Do your work, offer the results, and stay unstained — like a leaf on water.",
  "Bhagavad Gita 6:5": "Your mind can lift you or sink you — become its friend, not its victim.",
  "Bhagavad Gita 6:6": "Master your mind and it works for you; leave it unchecked and it works against you.",
  "Bhagavad Gita 6:19": "A steady mind is like a candle flame in still air — calm, bright, unwavering.",
  "Bhagavad Gita 6:35": "The restless mind can be tamed — with steady practice and letting go.",
  "Bhagavad Gita 9:26": "It's not the size of the offering that matters — it's the love behind it.",
  "Bhagavad Gita 12:15": "Be someone who neither rattles others nor is easily rattled — that's peace.",
  "Bhagavad Gita 18:66": "Let go of the weight you carry and surrender — you can stop being afraid.",
  "Bhagavad Gita 18:78": "Where effort and the divine work together, good things follow.",
  "Bhagavad Gita 2:3": "Don't collapse into discouragement — shake it off and stand back up; there's more in you than you think.",
  "Bhagavad Gita 2:11": "Grief is real, but the deepest part of us is never truly lost — the story is bigger than we can see.",
  "Bhagavad Gita 3:9": "Do your work as an offering, not as a grab for gain, and it stops weighing you down.",
  "Bhagavad Gita 3:35": "Be fully yourself, flaws and all, rather than a perfect copy of someone else.",
  "Bhagavad Gita 4:20": "Act freely by letting go of needing a certain result — peace isn't hiding in the outcome.",
  "Bhagavad Gita 4:42": "Cut through your own doubt and stand up — clarity comes when you stop second-guessing.",
  "Bhagavad Gita 5:29": "Knowing you're befriended by the divine in everyone, your heart can finally rest.",
  "Bhagavad Gita 6:17": "Balance in eating, rest and work quietly dissolves a lot of your suffering.",
  "Bhagavad Gita 6:26": "When your mind wanders off, don't scold it — gently, patiently bring it back.",
  "Bhagavad Gita 7:19": "It can take a long road, but the wise eventually come home to what's real.",
  "Bhagavad Gita 8:5": "What fills your heart at the end reflects what you loved all along — so love well now.",
  "Bhagavad Gita 9:31": "Turn your heart toward good and you won't be lost — steady peace follows.",
  "Bhagavad Gita 10:11": "Grace lights up the dark, confused places inside you — you're not left in the fog.",
  "Bhagavad Gita 11:33": "Step up and play your part — you're an instrument of something already in motion.",
  "Bhagavad Gita 12:12": "You don't have to figure it all out; letting go of the outcome brings peace right away.",
  "Bhagavad Gita 16:3": "Courage, forgiveness and freedom from pride — these are the marks of a life worth growing into.",
  "Bhagavad Gita 17:15": "Speak what's true, kind, and helpful — words like that heal instead of harm.",
  "Bhagavad Gita 18:48": "No work is ever perfect, so don't abandon your calling waiting for flawless — just begin.",
  "Bhagavad Gita 18:65": "Keep your heart set on the divine — you are dear, and you will find your way home.",

  // ---- Guru Granth Sahib ----
  "Mool Mantar": "One loving Creator is behind everything — beyond fear and hate, beyond time — and you can know that presence by grace, not by force.",
  "Japji Sahib": "Real riches aren't worn on the outside — carry contentment, humility and a quiet mind, and you're already wealthy.",
  "Guru Granth Sahib, Ang 62": "Knowing truth is good, but living it is higher — let your life, not just your words, be honest.",
  "Guru Granth Sahib, Ang 1245": "Earn honestly and share freely — that simple, generous way of living is the real path.",
  "Guru Granth Sahib (Guru Nanak)": "A humble heart full of love is worth more than all the wealth of kings.",
  "Guru Granth Sahib, Ang 1349": "One Light shines in everyone — so look past 'good' and 'bad' labels and see the sacred in every person.",
  "Guru Granth Sahib (Guru Tegh Bahadur)": "What you're searching for isn't far away — the Divine already lives within you; look inward.",
  "Guru Granth Sahib (Sukhmani Sahib)": "When you rest your mind on God, the worry and fear quietly lift.",
  "Japji Sahib (Pauri 25)": "Every good thing in your life is a gift — the more you notice and give thanks, the more blessing you find.",
  "Guru Granth Sahib, Ang 1427": "True strength is gentle: frighten no one, and don't live in fear of anyone.",

  // ---- Dhammapada ----
  "Dhammapada 1": "Your life follows your thoughts — tend your mind with care, and peace follows you like a shadow.",
  "Dhammapada 5": "You can't put out a fire with fire; only love can end resentment. Choose love — it's the way through.",
  "Dhammapada 183": "The whole path in one line: stop harming, do good, and clean up your own heart.",
  "Dhammapada 223": "Meet anger with kindness, greed with generosity, lies with truth — respond, don't react.",
  "Dhammapada 103": "The hardest, greatest victory isn't over others — it's mastering yourself.",
  "Dhammapada 165": "No one can clean your heart for you, and no one can stain it either — your choices are truly your own.",
  "Dhammapada 252": "It's easy to spot everyone else's flaws — turn that honest gaze gently on yourself.",
  "Dhammapada 276": "Teachers can point the way, but only you can take the steps — begin walking.",
  "Dhammapada 197": "You can stay light and free inside, even surrounded by anger — peace is a choice you keep making.",
  "Dhammapada 100": "One true, kind, peaceful word matters more than a flood of empty ones.",
  "Dhammapada 204": "Notice the real riches you already have: your health, a content heart, people you trust, and inner freedom.",

  // ---- Tripitaka (suttas) ----
  "Dhammacakkappavattana Sutta": "Suffering is real, it has causes, it can end — and there's a practical path out. You are not stuck.",
  "Metta Sutta": "Love others with the fierce, protective tenderness a mother has for her child — and let that love leave no one out.",
  "Karaniya Metta Sutta": "Let your kindness reach in every direction, holding no one outside it — a heart with no walls.",
  "Kalama Sutta": "Don't accept things just because you're told to — test them in your own life, and keep what is kind and true.",
  "Mahaparinibbana Sutta": "Everything changes and passes — so don't cling; live wholeheartedly and keep growing while you can.",
  "Samyutta Nikaya": "When you truly see that nothing stays the same, you stop grasping — and that letting-go is where peace begins.",
  "Sedaka Sutta": "Caring for yourself and caring for others aren't opposites — do one well and you strengthen the other.",
  "Anguttara Nikaya": "Gratitude is rare and precious — being genuinely thankful is a mark of a good and grounded heart.",
};

// Warm fallback by topic so every verse shows a meaning while the batch grows.
const TOPIC_MEANING = {
  hope: "A gentle reminder to hold on — better is coming, and you have not been forgotten.",
  strength: "You carry more strength than you feel right now, and you don't have to summon it alone.",
  peace: "An invitation to set the worry down and let calm return to your heart.",
  love: "You are deeply loved, and love is the quiet gift you get to pass on today.",
  faith: "Trust the next step even before you can see the whole staircase.",
  guidance: "When the way is unclear, you're still being led — just take the next small step.",
  comfort: "Whatever you're carrying, you don't carry it alone; you are seen and held.",
  courage: "Be brave in the face of what scares you — you were made for this moment.",
  gratitude: "Notice one blessing today and let thankfulness change how the day feels.",
  wisdom: "Slow down and choose the gentle, true path over the loud, quick one.",
  protection: "You are watched over and kept; what comes against you doesn't get the last word.",
  joy: "Let something lift your heart today — joy is a quiet act of trust.",
  purpose: "You are here on purpose, for a purpose — your light matters.",
};

function meaningFor(v) {
  return MEANINGS[v.ref] || TOPIC_MEANING[v.topic] ||
    "A reminder that you are seen, loved, and not alone today.";
}

// A ~1-minute spoken narration script (verse + plain meaning + a gentle close).
function narrationFor(v) {
  const src = v.faith === "Gita" ? "the Bhagavad Gita" : "the Bible";
  return `Today's blessing, from ${src}. ${v.ref}. ` +
    `${v.text} ` +
    `In simple words: ${meaningFor(v)} ` +
    `So take a slow breath, and carry this with you today. ` +
    `You are seen. You are loved. May you be blessed.`;
}
