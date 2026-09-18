# EverVerse — connect YouTube uploads (one-time, ~10 minutes)

The Studio's **Devotion → Upload to YouTube** panel pushes a rendered batch to your
channel with the title, description, tags and scheduled publish time already filled
in. It signs you in with Google in the browser — **no secrets are stored anywhere**;
only a public "client id" goes in `youtube-config.js`.

## 1. Create the Google Cloud project
1. Go to **https://console.cloud.google.com** (sign in with the Google account that owns
   the YouTube channel) → top bar project menu → **New project** → name it `EverVerse` → Create.
2. **APIs & Services → Library** → search **YouTube Data API v3** → **Enable**.

## 2. Consent screen
1. **APIs & Services → OAuth consent screen** → **External** → Create.
2. App name `EverVerse Studio`, your email as support + developer contact → Save.
3. **Scopes** → Add → tick `.../auth/youtube.upload` → Update → Save.
4. **Test users** → Add → your own Google account → Save.
   *(Leave the app in **Testing**. That's enough for your own channel; publishing the
   app to "Production" would trigger a Google verification you don't need.)*

## 3. Client id
1. **APIs & Services → Credentials** → **Create credentials → OAuth client ID**.
2. Application type **Web application**, name `EverVerse Studio`.
3. **Authorised JavaScript origins** → add both:
   - `https://eververse.org`
   - `http://localhost:8817` (local preview)
4. Create → copy the **Client ID** (ends in `.apps.googleusercontent.com`).
5. Open **`youtube-config.js`**, paste it into `YT_CLIENT_ID`, commit & push
   *(or send it to me and I'll do it — a client id is public, not a secret)*.

## 4. Use it
Studio → **Devotion → Upload to YouTube**:
1. **Sign in** (Google popup; once per session).
2. **Open batch folder** — the folder the batch was saved to (it must contain `metadata.csv`).
3. **Upload next 6** → each video goes up with its metadata; the CSV is updated with the
   YouTube id as it goes. Come back tomorrow for the next six.

## Two YouTube rules to know (they are not ours)

### Quota: 6 uploads a day
A new API project gets **10,000 quota units/day** and each upload costs **1,600**, so
**6 uploads a day** is the ceiling. The panel respects that. To upload a whole month in
one go, request more: **APIs & Services → YouTube Data API v3 → Quotas** → "Request
quota increase", or the form at
https://support.google.com/youtube/contact/yt_api_form . Ask for **50,000 units/day**
(≈ 30 uploads), say it's for uploading your own channel's daily devotional videos.

### Audit: uploads are Private until it clears
Since 2020, videos uploaded through an **unaudited** API project are locked to
**Private**. Everything else (title, description, tags, schedule) still lands. Until the
audit clears, after each batch open **YouTube Studio → Content**, select the new
videos → **Visibility** → Public (or keep the schedule). File the audit on day one —
same form as above ("API compliance audit"), it usually takes one to two weeks:
- what the app does: *"Uploads my own channel's daily devotional videos (scripture with
  meaning), rendered in my own web studio. Single user, my own channel only."*
- the app is not distributed to others, does not read anyone else's data.

## Form answers, ready to paste

One form covers both the audit and the quota increase:
https://support.google.com/youtube/contact/yt_api_form . Fill it the same day the
client id is created — the audit is what takes one to two weeks, and nothing else is
blocked while it runs. Have to hand: the **project number** (Cloud console → project
menu → the 12-digit number, not the name) and a screenshot of the Studio's
*Devotion → Upload to YouTube* panel.

**Reason for filling the form** → *Both — compliance audit and quota extension.*

**Describe your API client and how it uses YouTube API Services**
> EverVerse Studio is a private, single-user web tool I built to publish my own
> channel's daily devotional videos (a scripture verse or prayer, read line by line
> with its meaning). It renders the videos locally in my browser and uses the
> YouTube Data API v3 (videos.insert only, youtube.upload scope) to upload each one
> to my own channel with its title, description, tags and a scheduled publish time.
> It is not distributed to anyone else, has one user (me), is used only on my own
> channel, and does not read, store or display any YouTube data about other users
> or other channels. No YouTube data is stored anywhere: the only thing kept is the
> video id YouTube returns, written to a local spreadsheet so the same video is not
> uploaded twice.

**Which API scopes / methods** → `videos.insert` · scope `https://www.googleapis.com/auth/youtube.upload`

**Does your client display YouTube data to users?** → No — it only uploads to the
signed-in owner's channel.

**Where can we see the client?** → The tool is a page in my own site,
https://eververse.org/app.html (Devotion → Upload to YouTube); screenshot attached.
It is behind a private access code because it is an admin tool for my channel, not a
public product.

**Quota requested** → **50,000 units/day.** Reason:
> Each upload costs 1,600 units. I publish one Short and one long-form version per
> day across a small set of faith traditions and schedule them in advance, so a
> working session uploads a month of videos in one sitting: roughly 30 uploads a
> day on an upload day (≈48,000 units). The default 10,000 units allows six.

**How do you handle user data / privacy policy** → https://eververse.org/privacy.html —
no user data is collected by the tool; the Google access token lives in the browser
tab for the session and is never stored.

What to expect: an email from the YouTube API team within a few days asking for a
screen recording of the panel in use — record the three steps (Sign in → Open batch
folder → Upload next), 60 seconds is enough. Until the audit clears, uploads still
work but sit as **Private** (see below).

## Troubleshooting
- **"Sign-in cancelled (popup_closed)"** — allow pop-ups for eververse.org, or click Sign in again.
- **"Access blocked: app not verified"** — your account isn't listed under *Test users* (step 2.4).
- **"origin_mismatch"** — the site's origin isn't in *Authorised JavaScript origins* (step 3.3).
- **"quota used up"** — wait until midnight Pacific time, or the quota increase above.
- TikTok has no upload here on purpose: its posting API requires an app audit before
  anything can go public. Use TikTok's own scheduler (up to 10 days ahead) or a bulk
  tool like Metricool, with the `tiktok_caption` column from `metadata.csv`.
