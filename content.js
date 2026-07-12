// content.js
// Per-platform post copy: captions, hashtags, image sizing, and royalty-free
// music-track suggestions. All copy is generated from the day's verse.

/* ---------------------------------------------------------------- */
/*  Platforms — each with its own image size + copy style            */
/* ---------------------------------------------------------------- */
const PLATFORMS = [
  { key: "instagram", name: "Instagram", w: 1080, h: 1080, format: "square",   maxTags: 15, emoji: "📸" },
  { key: "tiktok",    name: "TikTok",    w: 1080, h: 1920, format: "story",    maxTags: 8,  emoji: "🎵" },
  { key: "facebook",  name: "Facebook",  w: 1080, h: 1080, format: "square",   maxTags: 5,  emoji: "👍" },
  { key: "youtube",   name: "YouTube",   w: 1080, h: 1920, format: "story",    maxTags: 12, emoji: "▶️" },
  { key: "x",         name: "X",         w: 1600, h: 900,  format: "wide",     maxTags: 3,  emoji: "𝕏" },
];

// Image formats referenced by platforms + the studio.
const IMAGE_FORMATS = {
  square:    { name: "Square 1:1",     w: 1080, h: 1080 },
  story:     { name: "Vertical 9:16",  w: 1080, h: 1920 },
  wide:      { name: "Landscape 16:9", w: 1600, h: 900 },
  portrait:  { name: "Portrait 4:5",   w: 1080, h: 1350 },
};

/* ---------------------------------------------------------------- */
/*  Reflections — short devotional lines keyed by topic              */
/* ---------------------------------------------------------------- */
const REFLECTIONS = {
  hope:       ["No matter how today began, hope is still yours to hold.", "Better days are being written for you right now.", "Hold on — what feels like the end is often the beginning."],
  strength:   ["You are stronger than the thing in front of you.", "The strength you're praying for is already being given.", "Rise. You were built to carry this and keep going."],
  peace:      ["Breathe. You are held, and you are safe.", "Let today be lighter. Set the worry down.", "Peace isn't the absence of storms — it's stillness within them."],
  love:       ["You are loved beyond what you can measure.", "Love is the quiet miracle we get to share today.", "Someone needs your kindness today — be that light."],
  faith:      ["Trust the step even when you can't see the staircase.", "Faith is walking forward before the path appears.", "Believe it before you see it."],
  guidance:   ["When the way is unclear, ask — and then walk.", "The next right step is enough for today.", "You are being led, even in the fog."],
  comfort:    ["Whatever you carry today, you don't carry it alone.", "Rest — you are seen, and you are cared for.", "It's okay to not be okay. You are still held."],
  courage:    ["Do it afraid. Courage grows in the doing.", "Fear is loud, but you are led by something greater.", "Be brave today — you were made for this moment."],
  gratitude:  ["Count one blessing and watch it multiply.", "Gratitude turns what we have into enough.", "Today is a gift — that's why it's called the present."],
  wisdom:     ["Slow down. Wisdom whispers to those who listen.", "The wise choose the long road that leads home.", "Let today's choices be gentle and true."],
  protection: ["You are shielded, guarded, and kept.", "Nothing coming against you gets the final word.", "Walk today knowing you are covered."],
  joy:        ["Choose joy — it's a quiet act of faith.", "Let something make you smile today.", "Joy is your birthright; claim a little of it now."],
  purpose:    ["You are here on purpose, for a purpose.", "Your life is a message the world needs.", "Shine — the world is darker without your light."],
};

/* ---------------------------------------------------------------- */
/*  Hashtags                                                         */
/* ---------------------------------------------------------------- */
const HASHTAGS = {
  base:   ["#faith", "#blessed", "#dailyverse", "#godblessing", "#inspiration"],
  Bible:  ["#bible", "#biblequotes", "#jesus", "#scripture", "#christian", "#godisgood", "#prayer", "#gospel"],
  Gita:   ["#bhagavadgita", "#gita", "#krishna", "#spirituality", "#sanatandharma", "#wisdom", "#dharma", "#yoga"],
  topic: {
    hope: ["#hope", "#neverGiveUp"], strength: ["#strength", "#overcomer"], peace: ["#peace", "#calm"],
    love: ["#love", "#kindness"], faith: ["#faithoverfear", "#believe"], guidance: ["#guidance", "#trustthejourney"],
    comfort: ["#comfort", "#youarenotalone"], courage: ["#courage", "#bebrave"], gratitude: ["#gratitude", "#thankful"],
    wisdom: ["#wisdom", "#mindfulness"], protection: ["#protected", "#refuge"], joy: ["#joy", "#choosejoy"],
    purpose: ["#purpose", "#calling"],
  },
  platform: {
    instagram: ["#instadaily", "#quoteoftheday", "#motivation"],
    tiktok: ["#fyp", "#foryou", "#spiritualtiktok"],
    facebook: ["#blessings"],
    youtube: ["#shorts", "#dailydevotional"],
    x: ["#faith"],
  },
};

/* ---------------------------------------------------------------- */
/*  Royalty-free music suggestions (by mood).                        */
/*  These are SUGGESTIONS + where to find free-to-use tracks — no    */
/*  copyrighted audio is bundled.                                    */
/* ---------------------------------------------------------------- */
const TRACK_SUGGESTIONS = {
  calm:   { mood: "Peaceful / ambient", ideas: ["Soft piano worship instrumental", "Ambient pad with gentle strings", "Lo-fi prayer beats"] },
  warm:   { mood: "Uplifting / warm",   ideas: ["Acoustic guitar hopeful", "Cinematic sunrise swell", "Gentle worship build"] },
  bold:   { mood: "Cinematic / epic",   ideas: ["Inspirational orchestral rise", "Epic cinematic drums", "Motivational trailer bed"] },
  hope:   { mood: "Bright / hopeful",   ideas: ["Uplifting piano and strings", "Morning acoustic optimism", "Hopeful indie folk"] },
  royal:  { mood: "Reverent / majestic",ideas: ["Choral pad reverent", "Majestic strings", "Meditative tanpura drone"] },
  night:  { mood: "Reflective / calm",  ideas: ["Night ambient reflection", "Slow cello meditation", "Calm rain and piano"] },
  gold:   { mood: "Grateful / warm",    ideas: ["Warm gospel organ", "Grateful acoustic morning", "Soft handpan"] },
  forest: { mood: "Grounded / nature",  ideas: ["Nature ambience with flute", "Earthy acoustic calm", "Forest meditation drone"] },
};

const TRACK_SOURCES = [
  "TikTok Commercial Music Library (in-app, cleared for business use)",
  "YouTube Audio Library (studio.youtube.com → Audio Library)",
  "Pixabay Music (pixabay.com/music — free, no attribution)",
  "Facebook/Instagram Sound Collection (in Meta Business Suite)",
];

/* ---------------------------------------------------------------- */
/*  Copy builders                                                    */
/* ---------------------------------------------------------------- */
// Deterministic pick so the same verse+platform gives stable copy.
function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}
function seedFrom(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function reflectionFor(verse) {
  const lines = REFLECTIONS[verse.topic] || REFLECTIONS.faith;
  return pick(lines, seedFrom(verse.ref));
}

function hashtagsFor(verse, platform) {
  const topicTags = HASHTAGS.topic[verse.topic] || [];
  const faithTags = HASHTAGS[verse.faith] || [];
  const platTags = HASHTAGS.platform[platform.key] || [];
  const all = [...HASHTAGS.base, ...topicTags, ...faithTags, ...platTags];
  // de-dupe, respect platform tag budget
  const seen = new Set();
  const out = [];
  for (const t of all) {
    const k = t.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(t); }
    if (out.length >= platform.maxTags) break;
  }
  return out;
}

function trackFor(verse) {
  const t = TRACK_SUGGESTIONS[verse.theme] || TRACK_SUGGESTIONS.calm;
  const idea = pick(t.ideas, seedFrom(verse.ref + "track"));
  return { mood: t.mood, idea, sources: TRACK_SOURCES };
}

// Build the full caption for one platform.
function captionFor(verse, platform) {
  const reflection = reflectionFor(verse);
  const tags = hashtagsFor(verse, platform).join(" ");
  const track = trackFor(verse);
  const v = `"${verse.text}"`;
  const ref = `— ${verse.ref}`;

  switch (platform.key) {
    case "instagram":
      return `${v}\n${ref}\n\n${reflection}\n\n✨ Save this and share it with someone who needs it today.\n🎵 Suggested sound: ${track.idea}\n\n${tags}`;
    case "tiktok":
      return `${reflection} 🙏\n${v} ${ref}\n\n🎵 Add: ${track.idea}\n${tags}`;
    case "facebook":
      return `${v}\n${ref}\n\n${reflection}\n\nMay this bless your day. 🙏 If it spoke to you, share it forward.\n\n${tags}`;
    case "youtube":
      return `${verse.ref} | Daily Blessing #shorts\n\n${v}\n${ref}\n\n${reflection}\n\n🎵 Suggested track: ${track.idea}\n\n${tags}`;
    case "x":
      // Keep it tight for the character limit.
      return `${v} ${ref}\n\n${reflection}\n${tags}`;
    default:
      return `${v} ${ref}\n\n${tags}`;
  }
}

// Build copy + track for every platform for a given verse.
function buildPostKit(verse) {
  return {
    verse,
    reflection: reflectionFor(verse),
    track: trackFor(verse),
    platforms: PLATFORMS.map((p) => ({
      key: p.key,
      name: p.name,
      emoji: p.emoji,
      w: p.w,
      h: p.h,
      format: p.format,
      caption: captionFor(verse, p),
      hashtags: hashtagsFor(verse, p),
    })),
  };
}
