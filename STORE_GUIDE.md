# EverVerse — App Store & Google Play submission guide

EverVerse is already a full PWA, so you don't rebuild anything — you *package* the
existing app at **https://eververse.org** into store apps.

## Recommended tool: PWABuilder (free)
Go to **https://www.pwabuilder.com** → enter `https://eververse.org` → it analyses
the app and lets you download store packages.

### ✅ Google Play (you can do this from Windows)
1. PWABuilder → **Android** → **Download** (it generates a signed package / TWA).
2. Create a **Google Play Console** account — **$25 one-time** (play.google.com/console).
3. Create app → upload the package (`.aab`) → fill the listing (below) → submit.
4. Review is usually 1–3 days.

### 🍎 Apple App Store (needs a Mac)
Apple requires **macOS + Xcode** to build/submit — you cannot do it from Windows.
1. PWABuilder → **iOS** → **Download** (an Xcode project).
2. Get an **Apple Developer** account — **$99/year** (developer.apple.com).
3. On a Mac: open the project in **Xcode** → set your Team → **Archive** → upload via
   **App Store Connect** → fill the listing → submit. Review ~1–3 days.
   - No Mac? Use a cloud Mac: **MacinCloud**, **Codemagic**, or a friend's Mac.

## Alternative: Capacitor (more native power)
For background audio, native push, etc., wrap with **Capacitor** (needs Node.js +
Android Studio, and Xcode for iOS). More setup; ask and I'll scaffold the project.

## Listing assets you'll need (I can produce these)
- **App icon** — done (`icons/icon-512.png`).
- **Feature graphic / screenshots** — phone screenshots of the app. *Ask me to generate these.*
- **Short + full description** — draft below.
- **Privacy Policy URL** — REQUIRED by both stores (and because we collect
  comments/reactions via Firebase). *Ask me to generate `privacy.html` on eververse.org.*
- **Content rating** questionnaire — EverVerse is safe/all-ages.
- **Category** — Lifestyle or Health & Fitness (or Books/Reference).

### Draft description
> **EverVerse — Daily Faith & Wellness**
> A calm daily home for faith. Receive a verse each day from the Bible and the
> Bhagavad Gita, with its meaning in plain words — read it, listen to it in your
> own language, and share it. Sermons, a private reflection journal, a daily
> streak, and a growing multi-faith library. Free, offline, for every soul. ✦

## Before you submit — two must-dos
1. **Privacy policy** (required) — ask me to create it.
2. **Screenshots** — ask me to generate a set.

Ask for either and I'll build them next.
