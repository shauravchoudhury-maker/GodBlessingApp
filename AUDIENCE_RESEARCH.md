# EverVerse — audience research behind `audiences.js`

What each audience actually searches, watches and wakes up to, from public sources,
and how the pipeline uses it. Re-check each section yearly; festival dates every year.
Last reviewed: 2026-09-16.

## How it is applied
| Signal | Where it lands |
|---|---|
| Search phrases people type ("with meaning", "for anxiety", "before sleep") | `audienceTitle()` — title per segment; `perId.search` for the biggest queries |
| Segment (homeland / diaspora / seeker) | title formula, tag set, native voice; batch **Audience** control |
| Audience's morning in their own time zone | `audiencePublishIso()` → `publish_at` + `publish_tz` in `metadata.csv` |
| Festival windows (verified dates only) | `devotionForDay()` swaps in that tradition's preferred entries; festival name in title + description |
| Native-script tags (#हनुमानचालीसा, #آية_الكرسي, #ਗੁਰਬਾਣੀ) | `perId.nativeTags` → first tags in title and description |

## Hindu
- **Format words drive search.** People look for Hanuman Chalisa as *fast*, *Sanskrit*, *with lyrics*, *instrumental*, *with meaning* — the format is the query. T-Series' Hanuman Chalisa is the most-viewed Indian video on YouTube (5B+), and T-Series Bhakti Sagar sits in YouTube's global top 30 by subscribers. Devotional streaming is a daily-prayer and commute habit.
  [Swarajya](https://swarajyamag.com/culture/three-billion-views-for-hanuman-chalisa-on-t-series-youtube-channel-how-hindu-devotional-songs-conquered-the-internet) · [Hindutone guide](https://hindutone.com/hinduism/hanuman-chalisa-video-on-youtube-complete-guide-with-benefits-best-versions/)
- **When India watches Shorts:** 7–9 am and 7–9 pm IST; Wednesday and Friday strongest. → `morning: 07:30`, `evening: 19:30`, `Asia/Kolkata`.
  [FluxNote India 2026](https://fluxnote.io/guides/best-time-to-post-youtube-shorts-india-2026) · [Backstage](https://www.backstage.com/magazine/article/best-times-to-post-youtube-shorts-78595/)
- **Diaspora** (US/UK/CA/AU, second generation): reads transliteration, wants meaning in English → default segment `diaspora`; homeland gets Devanagari title + Hindi voice.
- **Festivals 2026–27 (verified):** Navratri 11–19 Oct 2026; Diwali 8 Nov 2026 (five days 6–10 Nov); Maha Shivaratri 6 Mar 2027.
  [calendardate Navratri](https://www.calendardate.com/navratri_2026.htm) · [diwali.info](https://diwali.info/diwali-dates) · [calendarlabs Shivaratri](https://www.calendarlabs.com/holidays/india/maha-shivaratri.php)
- **Gap to fill next:** Durga/Ambe aarti and Lakshmi aarti before Navratri/Diwali; Shiv aarti before Shivaratri; full Hanuman Chalisa in parts.

## Christian
- **What people read most (2025):** YouVersion's verse of the year Isaiah 41:10 (top in four of six years), then Jeremiah 29:11 and Romans 12:2; Philippians 4:6 was 2024's. On Bible Gateway, **Psalms 23 and 91 take almost the entire top 23**, led by Psalm 23:4. Top searched words: *love, anxiety, peace*.
  [Religion Unplugged](https://religionunplugged.com/news/2025/12/9/here-are-the-most-read-bible-verses-of-2025) · [Christian Daily](https://www.christiandaily.com/news/isaiah-41-10-named-youversions-most-popular-bible-verse-as-app-logs-record-engagement-in-2025) · [Crosswalk](https://www.crosswalk.com/headlines/contributors/michael-foust/youversion-reveals-2025s-most-popular-verse-as-bible-reading-hits-record-levels.html)
- → Psalm 23 and 91 lead the Christian set; seeker titles use *anxiety / peace / protection* framing; default segment `seeker` because the discovery audience is largest.
- **Festivals:** Advent 29 Nov–24 Dec 2026; Christmas; Lent 10 Feb–27 Mar 2027; Easter 28 Mar 2027.
  [Farmers' Almanac Easter](https://www.farmersalmanac.com/when-is-easter) · [timeanddate](https://www.timeanddate.com/holidays/us/easter-sunday)
- **Gap:** Isaiah 41:10, Jeremiah 29:11, Philippians 4:6 exist as verses in `verses.js` — worth "prayer" treatments (a spoken prayer built on the verse) in the next batch.

## Islamic
- **Anxiety and sleep framing wins.** The Prophetic dua for worry ("Allahumma inni a'udhu bika minal-hammi wal-hazan") and Ayatul Kursi *before sleep* are the recurring searches; top-performing videos title themselves with *sleep*, *transliteration*, *100x*. Alafasy and Al-Muaiqly recitations are what people listen to before bed — a reason our voice never recites the Arabic.
  [DeenUp — Ayatul Kursi](https://www.deenup.app/blog/ayatul-kursi-meaning-and-benefits) · [DeenUp — dua for anxiety](https://www.deenup.app/blog/dua-for-anxiety) · [Soulful Muslim](https://www.soulfulmuslim.blog/2025/12/15-duas-for-anxiety-and-stress-relief.html)
- **Where the audience is:** Indonesia is the largest and YouTube-first; Ramadan searches grew ~25% over two years and Islamic-lifestyle YouTube searches 2.3× in a year. → `Asia/Jakarta`, morning 05:30 (after Fajr).
  [Think with Google — Indonesia Ramadan](https://business.google.com/en-all/think/consumer-insights/ramadan-2024-indonesia-consumer-insights/) · [Google Ramadan trends](https://rilis.id/Lifestyle/Berita/Google-Ini-Tren-Pencarian-yang-Populer-pada-Ramadan-2025-kyhLl6L)
- **Ramadan 2027:** ~8 Feb – 8 Mar (moon-dependent — confirm the week before).
  [IslamicFinder](https://www.islamicfinder.org/special-islamic-days/ramadan-2027/) · [HRF](https://www.hrf.org.uk/media-centre/blog/when-is-ramadan-2027/)
- **Gap:** sleep duas + the Three Quls as one "before sleep" devotion; Indonesian-language meaning line.

## Sikh
- **Diaspora wants meaning in English.** Community and educational sources say plainly that many diaspora Sikhs do not engage with Punjabi content; Gurdwaras run Punjabi classes so children can read Gurbani; projects exist specifically to provide Gurbani meaning in English. Largest diaspora: Canada (Surrey, Brampton), UK (Southall), US, Australia, Italy.
  [Sikhism.net diaspora](https://www.sikhism.net.in/sikh-world/diaspora.php) · [Guru Granth Sahib Project](https://project.gurugranthsahib.io/) · [SikhRI](https://sikhri.org/courses/grammar-of-gurbani)
- → default `diaspora`, `America/Vancouver` morning; city tags for Surrey/Brampton/Southall.
- **Festivals:** Guru Nanak Jayanti 24 Nov 2026; Vaisakhi 14 Apr 2027.
  [timeanddate](https://www.timeanddate.com/holidays/india/guru-nanak-jayanti) · [drikpanchang Vaisakhi](https://www.drikpanchang.com/festivals/vaisakhi/vaisakhi-date-time.html)

## Jewish
- Diaspora-majority audience (US, then Israel, UK, France, Canada); transliteration + meaning is the standard ask. Hanukkah 4–12 Dec 2026 (sundown to sundown); Yom Kippur 20–21 Sep 2026.
  [Hebcal Chanukah 2026](https://www.hebcal.com/holidays/chanukah-2026) · [Chabad](https://www.chabad.org/holidays/chanukah/article_cdo/aid/671899/jewish/When-Is-Hanukkah-Chanukah-Celebrated-in-2025-2026-2027-2028-2029-and-2030.htm)

## Seekers and Gen Z (all traditions)
- Two-thirds of religious and **78% of non-religious** respondents discovered spiritual ideas in online content; Gallup: men under 30 calling religion "very important" rose from 28% (2023) to 42% (2025). Gen Z is on YouTube (74%) and TikTok (72%).
  [Word on Fire](https://www.wordonfire.org/articles/its-true-young-people-are-seeking-the-faith/) · [Hootsuite Gen Z 2026](https://blog.hootsuite.com/gen-z-statistics/) · [Trill](https://www.trillmag.com/life/social-media/god-is-trending-and-gen-z-is-serious-about-it/)
- → the `seeker` segment: no insider words in the title, framed by the problem (anxiety, grief, courage), meaning first. Buddhist, Taoist, Universal and Christian default to it.

## Not applied (yet)
- Vesak 2027, Hanuman Jayanti 2027, Eid dates: not added until a reliable published date exists.
- Per-country language variants (Indonesian, Urdu, Portuguese, Spanish) — the voice supports them; the meaning lines need a reviewed translation first.
