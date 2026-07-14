// site.js — EverVerse public community reading site (read-only).
// Reuses verses.js, meanings.js, sermons.js, backgrounds.js, render.js.
"use strict";
const $ = (id) => document.getElementById(id);
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c]));
const mkBtn = (label, cls, fn) => { const b = document.createElement("button"); b.className = cls; b.textContent = label; b.onclick = fn; return b; };
function debounce(fn, ms) { let t; return function(){ clearTimeout(t); t = setTimeout(fn, ms); }; }

const BG_CHOICES = ["sunrise","aurora","rays","mesh","clouds","watercolor","ocean","forest","bokeh","geometric","particles","meadow","blessing","petals","canopy","strata","aura"];
function bgForVerse(v) { const h = v.ref.split("").reduce((a,c)=>(a*31+c.charCodeAt(0))|0,5); return BG_CHOICES[Math.abs(h)%BG_CHOICES.length]; }
function renderVerseImage(canvas, v, W, H) {
  renderVerse(canvas, W, H, { text:v.text, ref:v.ref, paletteKey:v.theme, bgKey:bgForVerse(v), watermark:true, showRef:true });
}
function verseForSourceDate(source, date) { const list = VERSE_DB.filter((v)=>v.faith===source); return list[dayOfYear(date)%list.length]; }
function faithsIn(list) { return [...new Set(list.map((x)=>x.faith))]; }
function populateSourceSelect(sel, faiths, allLabel, allValue) {
  sel.innerHTML = "";
  sel.add(new Option(allLabel, allValue));
  faiths.forEach((f) => sel.add(new Option(faithLabel(f), f)));
}

// Top languages shown on the main page for every post.
const TOP4 = [["es","Español"],["pt","Português"],["hi","हिन्दी"]];
function hashStr(s){ return Math.abs(s.split("").reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7)); }
async function translateCached(text, code) {
  if (code === "en") return text;
  const key = "ev_tr_" + code + "_" + hashStr(text);
  try { const c = localStorage.getItem(key); if (c) return c; } catch (e) {}
  const out = await translateText(text, code);
  try { localStorage.setItem(key, out); } catch (e) {}
  return out;
}
function buildLangBlock(v, container) {
  container.innerHTML = '<div class="lb-title">In other languages</div>';
  const list = document.createElement("div"); list.className = "lb-list"; container.appendChild(list);
  TOP4.forEach(([code, label]) => {
    const row = document.createElement("div"); row.className = "lb-row";
    const l = document.createElement("span"); l.className = "lb-lang"; l.textContent = label;
    const t = document.createElement("span"); t.className = "lb-text"; t.textContent = "…";
    if (code === "hi" || code === "ar") t.dir = "auto";
    const b = document.createElement("button"); b.className = "lb-listen"; b.textContent = "🔊";
    b.title = "Listen in " + label; b.disabled = true;
    row.append(l, t, b); list.appendChild(row);
    translateCached(v.text, code)
      .then((tr) => { t.textContent = tr; b.disabled = false; b.onclick = () => speakText(tr, code); })
      .catch(() => { t.textContent = "(translation unavailable — tap Read)"; });
  });
}

/* ---- Translation + speech (self-contained; app.js isn't loaded here) ---- */
async function translateText(text, to, from) {
  from = from || "en";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
  const res = await fetch(url); if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  const out = data && data.responseData && data.responseData.translatedText;
  if (!out) throw new Error("unavailable"); return out;
}
function speakText(text, lang) { EVVoice.speak(text, { lang: lang || "en" }); }
function fillLangSelect(sel) { sel.innerHTML = ""; sel.add(new Option("English","en")); LANGUAGES.forEach((l)=>sel.add(new Option(l.name,l.code))); }

/* ---- Navigation --------------------------------------------------- */
let inited = { posts:false, trending:false, sermons:false, verses:false };
/* ---- App funnel + content protection ------------------------------ */
let evDeferredPrompt = null;
function showToast(msg) {
  let t = document.getElementById("ev-toast");
  if (!t) { t = document.createElement("div"); t.id = "ev-toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2800);
}
function isAppMode() {
  return (window.matchMedia && (matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches || matchMedia("(display-mode: minimal-ui)").matches)) || navigator.standalone === true;
}
function setupFunnel() {
  document.body.classList.add(isAppMode() ? "app-mode" : "browser-mode");
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); evDeferredPrompt = e; });
  const install = document.getElementById("install-app");
  if (install) install.onclick = async () => {
    if (evDeferredPrompt) { evDeferredPrompt.prompt(); try { await evDeferredPrompt.userChoice; } catch (_) {} evDeferredPrompt = null; }
    else { showToast("On iPhone: tap Share → Add to Home Screen. On Android: browser menu → Install app."); }
  };
}
function setupProtection() {
  document.body.classList.add("protect");
  ["contextmenu", "dragstart"].forEach((ev) => document.addEventListener(ev, (e) => {
    if (e.target && e.target.closest && e.target.closest("input,textarea")) return;
    e.preventDefault();
  }));
  document.addEventListener("copy", (e) => {
    if (e.target && e.target.closest && e.target.closest("input,textarea")) return;
    try {
      e.clipboardData.setData("text/plain", "© EverVerse — content is protected. To license or reuse, email licensing@eververse.org");
      e.preventDefault();
      showToast("This content is protected — to reuse, email licensing@eververse.org");
    } catch (_) {}
  });
}

function go(view) {
  if (document.body.classList.contains("browser-mode") && ["week","posts","trending","sermons","verses","wallpapers"].indexOf(view) !== -1) {
    view = "today";
    const cta = document.querySelector(".appcta"); if (cta) cta.scrollIntoView({ behavior: "smooth" });
  }
  ["today","week","posts","trending","sermons","verses","wallpapers"].forEach((k)=>$("view-"+k).classList.toggle("hidden", k!==view));
  document.querySelectorAll("nav.sections button").forEach((b)=>b.classList.toggle("active", b.dataset.go===view));
  window.scrollTo(0,0);
  if (view==="posts" && !inited.posts) { initPosts(); inited.posts = true; }
  if (view==="trending" && !inited.trending) { EVReact.renderTrending($("trending-list")); inited.trending = true; }
  if (view==="sermons" && !inited.sermons) { initSermons(); inited.sermons = true; }
  if (view==="verses" && !inited.verses) { initVerses(); inited.verses = true; }
  if (view==="week" && !inited.week) { initWeek(); inited.week = true; }
  if (view==="wallpapers" && !inited.wallpapers) { initWallpapers(); inited.wallpapers = true; }
}

/* ---- 3D tilt-on-hover (adds depth; skipped on touch / reduced-motion) --- */
function attachTilt(el) {
  if (window.matchMedia && (matchMedia("(pointer: coarse)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  el.classList.add("tilt");
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) scale(1.02)`;
  });
  el.addEventListener("pointerleave", () => { el.style.transform = ""; });
}

/* ---- Cards -------------------------------------------------------- */
function buildPostCard(v, label) {
  const el = document.createElement("div"); el.className = "post";
  const iw = document.createElement("div"); iw.className = "imgwrap";
  const c = document.createElement("canvas"); renderVerseImage(c, v, 620, 620); iw.appendChild(c);
  const body = document.createElement("div"); body.className = "body";
  const src = document.createElement("div"); src.className = "src"; src.textContent = label;
  const mean = document.createElement("p"); mean.className = "mean"; mean.innerHTML = `<b>In simple words:</b> ${escapeHtml(meaningFor(v))}`;
  const langs = document.createElement("div"); langs.className = "langblock";
  const acts = document.createElement("div"); acts.className = "acts";
  acts.append(
    mkBtn("Read", "btn ghost sm", ()=>openVerseDetail(v)),
    mkBtn("🎙 Listen", "btn ghost sm", ()=>speakText(narrationFor(v),"en")),
    mkBtn("📤 Share", "btn primary sm", ()=>sharePost(v))
  );
  body.append(src, mean, langs, acts);
  const bar = EVReact.reactionBar(v);
  if (bar.children.length) body.appendChild(bar);
  el.append(iw, body);
  buildLangBlock(v, langs);
  attachTilt(el);
  return el;
}
function buildFeedCell(v, date) {
  const cell = document.createElement("div"); cell.className = "cell";
  const c = document.createElement("canvas"); renderVerseImage(c, v, 320, 320); cell.appendChild(c);
  const cap = document.createElement("div"); cap.className = "cap";
  const d = document.createElement("div"); d.className = "d"; d.textContent = date.toLocaleDateString(undefined,{month:"short",day:"numeric"}) + " · " + v.faith;
  const r = document.createElement("div"); r.className = "r"; r.textContent = v.ref;
  cap.append(d, r); cell.append(cap);
  cell.onclick = ()=>openVerseDetail(v);
  attachTilt(cell);
  return cell;
}

/* ---- Today -------------------------------------------------------- */
function initToday() {
  $("today-date").textContent = new Date().toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const today = new Date();
  const faiths = faithsIn(VERSE_DB);
  // Spotlight rotates daily so every tradition gets its turn in the hero.
  const off = dayOfYear(today) % faiths.length;
  const featured = [faiths[off], faiths[(off + 1) % faiths.length]];
  const wrap = $("today-posts"); wrap.innerHTML = "";
  featured.forEach((f) => wrap.appendChild(buildPostCard(verseForSourceDate(f, today), faithLabel(f))));
  // Recent feed showcases every tradition (today + yesterday across all faiths).
  const feed = $("today-recent"); feed.innerHTML = "";
  for (let d = 0; d <= 1; d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()-d);
    faiths.forEach((f) => feed.appendChild(buildFeedCell(verseForSourceDate(f, date), date)));
  }
}

/* ---- Posts archive (last 5 days only) ----------------------------- */
const POSTS_DAYS = 5;
function renderPosts() {
  const src = $("posts-source").value;
  const feed = $("posts-feed"); feed.innerHTML = "";
  const today = new Date();
  for (let d = 0; d < POSTS_DAYS; d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()-d);
    (src==="all" ? faithsIn(VERSE_DB) : [src]).forEach((s)=>feed.appendChild(buildFeedCell(verseForSourceDate(s,date), date)));
  }
}
function initPosts() {
  populateSourceSelect($("posts-source"), faithsIn(VERSE_DB), "All traditions", "all");
  $("posts-more").style.display = "none"; // fixed 5-day window
  $("posts-source").onchange = renderPosts;
  renderPosts();
}

/* ---- Sermons ------------------------------------------------------ */
function renderSermonList() {
  const src = $("sermon-source").value, th = $("sermon-theme").value;
  const list = $("sermon-list"); list.innerHTML = "";
  SERMONS.filter((s)=>(src==="all"||s.faith===src)&&(th==="all"||s.theme===th)).forEach((s)=>{
    const t = document.createElement("div"); t.className = "tile";
    t.innerHTML = `<div class="badges"><span class="badge">${s.faith}</span><span class="badge alt">${s.theme}</span></div><h3></h3><div class="v"></div><p></p>`;
    t.querySelector("h3").textContent = s.title;
    t.querySelector(".v").textContent = s.verseRef;
    t.querySelector("p").textContent = s.body[0].slice(0,120) + "…";
    t.onclick = ()=>openSermonDetail(s);
    list.appendChild(t);
  });
}
function initSermons() {
  populateSourceSelect($("sermon-source"), faithsIn(SERMONS), "All sources", "all");
  [...new Set(SERMONS.map((s)=>s.theme))].sort().forEach((t)=>$("sermon-theme").add(new Option(t,t)));
  $("sermon-source").onchange = renderSermonList;
  $("sermon-theme").onchange = renderSermonList;
  renderSermonList();
}

/* ---- Verses ------------------------------------------------------- */
let versesShown = 0, versesFiltered = [];
function renderVerseRows() {
  const list = $("verses-list"), batch = 25;
  versesFiltered.slice(versesShown, versesShown+batch).forEach((v)=>{
    const row = document.createElement("div"); row.className = "vrow";
    const ref = document.createElement("div"); ref.className = "vr-ref"; ref.textContent = v.ref;
    const text = document.createElement("div"); text.className = "vr-text"; text.textContent = v.text;
    row.append(ref, text); row.onclick = ()=>openVerseDetail(v);
    list.appendChild(row);
  });
  versesShown += Math.min(batch, versesFiltered.length - versesShown);
  $("verses-more").style.display = versesShown < versesFiltered.length ? "inline-flex" : "none";
}
function applyVerseFilter() {
  const src = $("verses-source").value, q = $("verses-search").value.trim().toLowerCase();
  versesFiltered = VERSE_DB.filter((v)=>(src==="all"||v.faith===src)&&(!q||v.text.toLowerCase().includes(q)||v.ref.toLowerCase().includes(q)));
  versesShown = 0; $("verses-list").innerHTML = ""; renderVerseRows();
}
function initVerses() {
  populateSourceSelect($("verses-source"), faithsIn(VERSE_DB), "All sources", "all");
  $("verses-source").onchange = applyVerseFilter;
  $("verses-search").oninput = debounce(applyVerseFilter, 220);
  $("verses-more").onclick = renderVerseRows;
  applyVerseFilter();
}

/* ---- Detail overlay ----------------------------------------------- */
let detailState = null;
function openOverlay() { $("detail").classList.add("open"); document.body.style.overflow = "hidden"; }
function closeDetail() { $("detail").classList.remove("open"); document.body.style.overflow = ""; if (window.speechSynthesis) speechSynthesis.cancel(); }

function openVerseDetail(v) {
  detailState = { type:"verse", v, lang:"en", trans:null };
  $("detail-sheet").innerHTML =
    `<div class="imgwrap"><canvas id="dt-canvas"></canvas></div>
     <div class="content">
       <button class="close" id="dt-close">✕</button>
       <div class="meta">${faithLabel(v.faith)}</div>
       <blockquote class="verse serif" id="dt-verse"></blockquote>
       <div class="ref">— ${escapeHtml(v.ref)}</div>
       <div class="mean" id="dt-mean"></div>
       <div class="langrow"><span style="font-size:14px;color:var(--muted);">🌐 Read in</span><select class="pill" id="dt-lang"></select></div>
       <div class="status" id="dt-status"></div>
       <div class="acts">
         <button class="btn ghost sm" id="dt-listen">🎙 Listen</button>
         <select class="pill" id="dt-voice" style="padding:7px 9px;font-size:13px;"><option value="female">Female voice</option><option value="male">Male voice</option></select>
         <button class="btn ghost sm" id="dt-wallpaper">📱 Wallpaper</button>
         <button class="btn primary sm" id="dt-share">📤 Share</button>
       </div>
     </div>`;
  renderVerseImage($("dt-canvas"), v, 720, 720);
  $("dt-voice").value = EVVoice.pref(); $("dt-voice").onchange = ()=>EVVoice.setPref($("dt-voice").value);
  $("dt-verse").textContent = `“${v.text}”`;
  $("dt-mean").innerHTML = `<b>In simple words:</b> ${escapeHtml(meaningFor(v))}`;
  fillLangSelect($("dt-lang"));
  $("dt-close").onclick = closeDetail;
  $("dt-lang").onchange = ()=>translateDetailVerse($("dt-lang").value);
  $("dt-listen").onclick = ()=>speakText(detailState.lang==="en" ? narrationFor(v) : (detailState.trans ? detailState.trans.text : v.text), detailState.lang);
  $("dt-share").onclick = shareDetailPost;
  $("dt-wallpaper").onclick = saveWallpaper;
  const content = $("detail-sheet").querySelector(".content");
  const bar = EVReact.reactionBar(v);
  if (bar.children.length) content.appendChild(bar);
  const cmts = EVReact.commentsSection(v);
  if (cmts.children.length) content.appendChild(cmts);
  openOverlay();
}
function translateDetailVerse(code) {
  const v = detailState.v;
  if (code === "en") {
    detailState.lang = "en"; detailState.trans = null;
    $("dt-verse").textContent = `“${v.text}”`; $("dt-verse").dir = "ltr";
    $("dt-mean").innerHTML = `<b>In simple words:</b> ${escapeHtml(meaningFor(v))}`; $("dt-mean").dir = "ltr";
    renderVerseImage($("dt-canvas"), v, 720, 720); // image back to English
    $("dt-status").textContent = ""; return;
  }
  const meta = LANGUAGES.find((l)=>l.code===code);
  $("dt-status").textContent = `Translating to ${meta.name}…`;
  Promise.all([translateText(v.text, code), translateText(meaningFor(v), code)]).then(([tv, tm])=>{
    detailState.lang = code; detailState.trans = { text:tv, rtl:!!meta.rtl, meaning:tm };
    $("dt-verse").textContent = `“${tv}”`; $("dt-verse").dir = meta.rtl ? "rtl" : "ltr";
    $("dt-mean").innerHTML = `<b>In simple words:</b> ${escapeHtml(tm)}`; $("dt-mean").dir = meta.rtl ? "rtl" : "ltr";
    // re-render the on-image text in the chosen language
    renderVerse($("dt-canvas"), 720, 720, { text: tv, ref: v.ref, rtl: !!meta.rtl, paletteKey: v.theme, bgKey: bgForVerse(v), watermark: true, showRef: true });
    $("dt-status").textContent = `Image, text & voice now in ${meta.name}. (Machine translation.)`;
  }).catch((e)=>{ $("dt-status").textContent = `⚠ ${e.message}. Try again shortly.`; });
}

function sermonBodyNow() {
  const s = detailState.s;
  return detailState.trans ? detailState.trans : { body:s.body, takeaway:s.takeaway, rtl:false };
}
function renderSermonBodyInto() {
  const { body, takeaway, rtl } = sermonBodyNow();
  const el = $("dt-body"); el.innerHTML = "";
  body.forEach((p)=>{ const par = document.createElement("p"); par.textContent = p; if (rtl) par.dir = "rtl"; el.appendChild(par); });
  const tk = $("dt-take"); tk.innerHTML = `<b>💡</b> ${escapeHtml(takeaway)}`; tk.dir = rtl ? "rtl" : "ltr";
}
function sermonNarration() {
  const s = detailState.s; const { body, takeaway } = sermonBodyNow();
  return `${s.title}. ${s.verseText} From ${s.verseRef}. ${body.join(" ")} ${takeaway}`;
}
function openSermonDetail(s) {
  detailState = { type:"sermon", s, lang:"en", trans:null };
  $("detail-sheet").innerHTML =
    `<div class="content">
       <button class="close" id="dt-close">✕</button>
       <div class="badges"><span class="badge">${s.faith}</span><span class="badge alt">${s.theme}</span></div>
       <h2>${escapeHtml(s.title)}</h2>
       <div class="meta">${faithLabel(s.faith)} · ${escapeHtml(s.verseRef)}</div>
       <blockquote class="verse serif" id="dt-verse">“${escapeHtml(s.verseText)}”</blockquote>
       <div class="ref">— ${escapeHtml(s.verseRef)}</div>
       <div class="langrow"><span style="font-size:14px;color:var(--muted);">🌐 Read in</span><select class="pill" id="dt-lang"></select></div>
       <div class="status" id="dt-status"></div>
       <div class="body" id="dt-body" style="margin-top:14px;"></div>
       <div class="mean" id="dt-take"></div>
       <div class="acts">
         <button class="btn ghost sm" id="dt-listen">🎙 Listen</button>
         <select class="pill" id="dt-voice" style="padding:7px 9px;font-size:13px;"><option value="female">Female voice</option><option value="male">Male voice</option></select>
         <button class="btn primary sm" id="dt-share">📤 Share</button>
       </div>
     </div>`;
  renderSermonBodyInto();
  $("dt-voice").value = EVVoice.pref(); $("dt-voice").onchange = ()=>EVVoice.setPref($("dt-voice").value);
  fillLangSelect($("dt-lang"));
  $("dt-close").onclick = closeDetail;
  $("dt-lang").onchange = ()=>translateDetailSermon($("dt-lang").value);
  $("dt-listen").onclick = ()=>speakText(sermonNarration(), detailState.lang);
  $("dt-share").onclick = shareSermon;
  openOverlay();
}
async function translateDetailSermon(code) {
  const s = detailState.s;
  if (code === "en") { detailState.lang = "en"; detailState.trans = null; renderSermonBodyInto(); $("dt-status").textContent = ""; return; }
  const meta = LANGUAGES.find((l)=>l.code===code);
  $("dt-status").textContent = `Translating to ${meta.name}… (sentence by sentence)`;
  try {
    const body = [];
    for (const p of s.body) { body.push(await translateText(p, code)); await new Promise((r)=>setTimeout(r,300)); }
    const takeaway = await translateText(s.takeaway, code);
    detailState.lang = code; detailState.trans = { body, takeaway, rtl:!!meta.rtl };
    renderSermonBodyInto();
    $("dt-status").textContent = `Showing in ${meta.name}. (Machine translation.)`;
  } catch (e) { $("dt-status").textContent = `⚠ ${e.message}. Try again shortly.`; }
}

/* ---- Share -------------------------------------------------------- */
// Share an image whose ON-IMAGE text and caption are in the given language.
function sharePostImage(v, text, rtl, meaning) {
  const c = document.createElement("canvas");
  renderVerse(c, 1080, 1080, { text, ref: v.ref, rtl: !!rtl, paletteKey: v.theme, bgKey: bgForVerse(v), watermark: true, showRef: true });
  const caption = `“${text}” — ${v.ref}\n\n${meaning}\n\n✦ eververse.org`;
  c.toBlob(async (blob)=>{
    const file = new File([blob], "eververse_" + v.ref.replace(/[^\w]+/g,"_").toLowerCase() + ".png", { type:"image/png" });
    if (navigator.canShare && navigator.canShare({ files:[file] })) {
      try { await navigator.share({ files:[file], text: caption, title:"EverVerse" }); return; } catch (e) { if (e && e.name==="AbortError") return; }
    }
    const a = document.createElement("a"); a.download = file.name; a.href = c.toDataURL("image/png"); a.click();
    try { await navigator.clipboard.writeText(caption); } catch (_) {}
  }, "image/png");
}
function sharePost(v) { sharePostImage(v, v.text, false, meaningFor(v)); }
function shareDetailPost() {
  const v = detailState.v, t = detailState.trans, useT = t && detailState.lang !== "en";
  sharePostImage(v, useT ? t.text : v.text, useT ? t.rtl : false, useT ? (t.meaning || meaningFor(v)) : meaningFor(v));
}
// Save a phone wallpaper / lock screen (9:19.5) to Photos.
function shareCanvasAsWallpaper(c) {
  c.toBlob(async (blob) => {
    const file = new File([blob], "eververse-wallpaper.jpg", { type: "image/jpeg" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "EverVerse wallpaper" }); showToast("Saved — now set it as your wallpaper from Photos ✦"); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    const a = document.createElement("a"); a.download = file.name; a.href = c.toDataURL("image/jpeg", 0.95); a.click();
    showToast("Wallpaper downloaded — set it from your Photos ✦");
  }, "image/jpeg", 0.95);
}
function wallpaperCanvas(v, text, rtl) {
  const c = document.createElement("canvas");
  renderVerse(c, 1080, 2340, { text: text || v.text, ref: v.ref, rtl: !!rtl, paletteKey: v.theme, bgKey: bgForVerse(v), watermark: true, showRef: true });
  return c;
}
function saveWallpaper() {
  const v = detailState.v, t = detailState.trans, useT = t && detailState.lang !== "en";
  shareCanvasAsWallpaper(wallpaperCanvas(v, useT ? t.text : v.text, useT ? t.rtl : false));
}

/* ---- This Week: one blessing per day ------------------------------ */
function initWeek() {
  const wrap = $("week-list"); if (!wrap) return; wrap.innerHTML = "";
  const faiths = faithsIn(VERSE_DB);
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const f = faiths[dayOfYear(d) % faiths.length];
    const v = verseForSourceDate(f, d);
    const card = document.createElement("div"); card.className = "week-card" + (i === 0 ? " today" : "");
    const c = document.createElement("canvas"); renderVerseImage(c, v, 300, 300);
    const info = document.createElement("div"); info.className = "week-info";
    const day = i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "long" });
    info.innerHTML = `<div class="wd">${day}</div><div class="wdt">${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${faithLabel(f)}</div><div class="wr">${escapeHtml(v.ref)}</div>`;
    card.append(c, info);
    card.onclick = () => openVerseDetail(v);
    wrap.appendChild(card);
  }
}

/* ---- Wallpaper gallery -------------------------------------------- */
function initWallpapers() {
  const wrap = $("wallpaper-grid"); if (!wrap) return; wrap.innerHTML = "";
  const byFaith = {};
  VERSE_DB.filter((v) => v.text.length <= 95).forEach((v) => { (byFaith[v.faith] = byFaith[v.faith] || []).push(v); });
  const picks = [];
  Object.values(byFaith).forEach((list) => { list.sort((a, b) => a.text.length - b.text.length); picks.push(...list.slice(0, 3)); });
  picks.slice(0, 18).forEach((v) => {
    const card = document.createElement("div"); card.className = "wp-card";
    const c = document.createElement("canvas");
    renderVerse(c, 360, 780, { text: v.text, ref: v.ref, paletteKey: v.theme, bgKey: bgForVerse(v), watermark: true, showRef: true });
    const save = document.createElement("button"); save.className = "btn primary sm"; save.textContent = "📱 Save";
    save.onclick = () => shareCanvasAsWallpaper(wallpaperCanvas(v));
    card.append(c, save);
    wrap.appendChild(card);
  });
}
async function shareSermon() {
  const s = detailState.s;
  const text = `${s.title}\n\n“${s.verseText}” — ${s.verseRef}\n\n${s.body.join("\n\n")}\n\n${s.takeaway}\n\n✦ eververse.org`;
  if (navigator.share) { try { await navigator.share({ title:s.title, text }); return; } catch (e) { if (e && e.name==="AbortError") return; } }
  try { await navigator.clipboard.writeText(text); $("dt-status").textContent = "Copied to clipboard."; } catch (_) {}
}

/* ---- Boot --------------------------------------------------------- */
function init() {
  setupFunnel();
  setupProtection();
  try { EVReact.init(); } catch (e) {}
  document.querySelectorAll("[data-go]").forEach((el)=>el.addEventListener("click", ()=>go(el.dataset.go)));
  $("detail").addEventListener("click", (e)=>{ if (e.target === $("detail")) closeDetail(); });
  initToday();
  // deep-link support (app shortcuts / shared links): index.html#sermons etc.
  const routeHash = () => { const h = (location.hash || "").replace("#", ""); if (["posts","trending","sermons","verses"].indexOf(h) !== -1) go(h); };
  routeHash();
  window.addEventListener("hashchange", routeHash);
  if ("serviceWorker" in navigator) window.addEventListener("load", ()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
document.addEventListener("DOMContentLoaded", init);
