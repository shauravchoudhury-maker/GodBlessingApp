// site.js — EverVerse public community reading site (read-only).
// Reuses verses.js, meanings.js, sermons.js, backgrounds.js, render.js.
"use strict";
const $ = (id) => document.getElementById(id);
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c]));
const mkBtn = (label, cls, fn) => { const b = document.createElement("button"); b.className = cls; b.textContent = label; b.onclick = fn; return b; };
function debounce(fn, ms) { let t; return function(){ clearTimeout(t); t = setTimeout(fn, ms); }; }

const BG_CHOICES = ["sunrise","aurora","rays","mesh","clouds","watercolor","ocean","forest","bokeh","geometric","particles"];
function bgForVerse(v) { const h = v.ref.split("").reduce((a,c)=>(a*31+c.charCodeAt(0))|0,5); return BG_CHOICES[Math.abs(h)%BG_CHOICES.length]; }
function renderVerseImage(canvas, v, W, H) {
  renderVerse(canvas, W, H, { text:v.text, ref:v.ref, paletteKey:v.theme, bgKey:bgForVerse(v), watermark:true, showRef:true });
}
function verseForSourceDate(source, date) { const list = VERSE_DB.filter((v)=>v.faith===source); return list[dayOfYear(date)%list.length]; }

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
    row.append(l, t); list.appendChild(row);
    translateCached(v.text, code)
      .then((tr) => { t.textContent = tr; })
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
function speakText(text, lang) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.rate = 0.92;
  const voices = speechSynthesis.getVoices();
  const m = (lang && lang !== "en" ? voices.find((v)=>v.lang && v.lang.toLowerCase().startsWith(lang)) : null)
    || voices.find((v)=>/^en/i.test(v.lang)) || voices[0];
  if (m) u.voice = m;
  speechSynthesis.speak(u);
}
function fillLangSelect(sel) { sel.innerHTML = ""; sel.add(new Option("English","en")); LANGUAGES.forEach((l)=>sel.add(new Option(l.name,l.code))); }

/* ---- Navigation --------------------------------------------------- */
let inited = { posts:false, sermons:false, verses:false };
function go(view) {
  ["today","posts","sermons","verses"].forEach((k)=>$("view-"+k).classList.toggle("hidden", k!==view));
  document.querySelectorAll("nav.sections button").forEach((b)=>b.classList.toggle("active", b.dataset.go===view));
  window.scrollTo(0,0);
  if (view==="posts" && !inited.posts) { initPosts(); inited.posts = true; }
  if (view==="sermons" && !inited.sermons) { initSermons(); inited.sermons = true; }
  if (view==="verses" && !inited.verses) { initVerses(); inited.verses = true; }
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
  el.append(iw, body);
  buildLangBlock(v, langs);
  return el;
}
function buildFeedCell(v, date) {
  const cell = document.createElement("div"); cell.className = "cell";
  const c = document.createElement("canvas"); renderVerseImage(c, v, 320, 320); cell.appendChild(c);
  const cap = document.createElement("div"); cap.className = "cap";
  const d = document.createElement("div"); d.className = "d"; d.textContent = date.toLocaleDateString(undefined,{month:"short",day:"numeric"}) + " · " + (v.faith==="Gita"?"Gita":"Bible");
  const r = document.createElement("div"); r.className = "r"; r.textContent = v.ref;
  cap.append(d, r); cell.append(cap);
  cell.onclick = ()=>openVerseDetail(v);
  return cell;
}

/* ---- Today -------------------------------------------------------- */
function initToday() {
  $("today-date").textContent = new Date().toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const today = new Date();
  const wrap = $("today-posts"); wrap.innerHTML = "";
  wrap.appendChild(buildPostCard(verseForSourceDate("Bible", today), "Bible"));
  wrap.appendChild(buildPostCard(verseForSourceDate("Gita", today), "Bhagavad Gita"));
  const feed = $("today-recent"); feed.innerHTML = "";
  for (let d = 1; d <= 5; d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()-d);
    feed.appendChild(buildFeedCell(verseForSourceDate("Bible", date), date));
    feed.appendChild(buildFeedCell(verseForSourceDate("Gita", date), date));
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
    (src==="Both" ? ["Bible","Gita"] : [src]).forEach((s)=>feed.appendChild(buildFeedCell(verseForSourceDate(s,date), date)));
  }
}
function initPosts() {
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
    t.innerHTML = `<div class="badges"><span class="badge">${s.faith==="Gita"?"Gita":"Bible"}</span><span class="badge alt">${s.theme}</span></div><h3></h3><div class="v"></div><p></p>`;
    t.querySelector("h3").textContent = s.title;
    t.querySelector(".v").textContent = s.verseRef;
    t.querySelector("p").textContent = s.body[0].slice(0,120) + "…";
    t.onclick = ()=>openSermonDetail(s);
    list.appendChild(t);
  });
}
function initSermons() {
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
       <div class="meta">${v.faith==="Gita"?"Bhagavad Gita":"Bible"}</div>
       <blockquote class="verse serif" id="dt-verse"></blockquote>
       <div class="ref">— ${escapeHtml(v.ref)}</div>
       <div class="mean" id="dt-mean"></div>
       <div class="langrow"><span style="font-size:14px;color:var(--muted);">🌐 Read in</span><select class="pill" id="dt-lang"></select></div>
       <div class="status" id="dt-status"></div>
       <div class="acts">
         <button class="btn ghost sm" id="dt-listen">🎙 Listen</button>
         <button class="btn primary sm" id="dt-share">📤 Share</button>
       </div>
     </div>`;
  renderVerseImage($("dt-canvas"), v, 720, 720);
  $("dt-verse").textContent = `“${v.text}”`;
  $("dt-mean").innerHTML = `<b>In simple words:</b> ${escapeHtml(meaningFor(v))}`;
  fillLangSelect($("dt-lang"));
  $("dt-close").onclick = closeDetail;
  $("dt-lang").onchange = ()=>translateDetailVerse($("dt-lang").value);
  $("dt-listen").onclick = ()=>speakText(detailState.lang==="en" ? narrationFor(v) : (detailState.trans ? detailState.trans.text : v.text), detailState.lang);
  $("dt-share").onclick = ()=>sharePost(v);
  openOverlay();
}
function translateDetailVerse(code) {
  const v = detailState.v;
  if (code === "en") {
    detailState.lang = "en"; detailState.trans = null;
    $("dt-verse").textContent = `“${v.text}”`; $("dt-verse").dir = "ltr";
    $("dt-mean").innerHTML = `<b>In simple words:</b> ${escapeHtml(meaningFor(v))}`; $("dt-mean").dir = "ltr";
    $("dt-status").textContent = ""; return;
  }
  const meta = LANGUAGES.find((l)=>l.code===code);
  $("dt-status").textContent = `Translating to ${meta.name}…`;
  Promise.all([translateText(v.text, code), translateText(meaningFor(v), code)]).then(([tv, tm])=>{
    detailState.lang = code; detailState.trans = { text:tv, rtl:!!meta.rtl };
    $("dt-verse").textContent = `“${tv}”`; $("dt-verse").dir = meta.rtl ? "rtl" : "ltr";
    $("dt-mean").innerHTML = `<b>In simple words:</b> ${escapeHtml(tm)}`; $("dt-mean").dir = meta.rtl ? "rtl" : "ltr";
    $("dt-status").textContent = `Showing in ${meta.name}. (Machine translation.)`;
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
       <div class="badges"><span class="badge">${s.faith==="Gita"?"Gita":"Bible"}</span><span class="badge alt">${s.theme}</span></div>
       <h2>${escapeHtml(s.title)}</h2>
       <div class="meta">${s.faith==="Gita"?"Bhagavad Gita":"Bible"} · ${escapeHtml(s.verseRef)}</div>
       <blockquote class="verse serif" id="dt-verse">“${escapeHtml(s.verseText)}”</blockquote>
       <div class="ref">— ${escapeHtml(s.verseRef)}</div>
       <div class="langrow"><span style="font-size:14px;color:var(--muted);">🌐 Read in</span><select class="pill" id="dt-lang"></select></div>
       <div class="status" id="dt-status"></div>
       <div class="body" id="dt-body" style="margin-top:14px;"></div>
       <div class="mean" id="dt-take"></div>
       <div class="acts">
         <button class="btn ghost sm" id="dt-listen">🎙 Listen</button>
         <button class="btn primary sm" id="dt-share">📤 Share</button>
       </div>
     </div>`;
  renderSermonBodyInto();
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
function sharePost(v) {
  const c = document.createElement("canvas"); renderVerseImage(c, v, 1080, 1080);
  const text = `“${v.text}” — ${v.ref}\n\n${meaningFor(v)}\n\n✦ eververse.org`;
  c.toBlob(async (blob)=>{
    const file = new File([blob], "eververse_" + v.ref.replace(/[^\w]+/g,"_").toLowerCase() + ".png", { type:"image/png" });
    if (navigator.canShare && navigator.canShare({ files:[file] })) {
      try { await navigator.share({ files:[file], text, title:"EverVerse" }); return; } catch (e) { if (e && e.name==="AbortError") return; }
    }
    const a = document.createElement("a"); a.download = file.name; a.href = c.toDataURL("image/png"); a.click();
    try { await navigator.clipboard.writeText(text); } catch (_) {}
  }, "image/png");
}
async function shareSermon() {
  const s = detailState.s;
  const text = `${s.title}\n\n“${s.verseText}” — ${s.verseRef}\n\n${s.body.join("\n\n")}\n\n${s.takeaway}\n\n✦ eververse.org`;
  if (navigator.share) { try { await navigator.share({ title:s.title, text }); return; } catch (e) { if (e && e.name==="AbortError") return; } }
  try { await navigator.clipboard.writeText(text); $("dt-status").textContent = "Copied to clipboard."; } catch (_) {}
}

/* ---- Boot --------------------------------------------------------- */
function init() {
  document.querySelectorAll("[data-go]").forEach((el)=>el.addEventListener("click", ()=>go(el.dataset.go)));
  $("detail").addEventListener("click", (e)=>{ if (e.target === $("detail")) closeDetail(); });
  initToday();
  if ("serviceWorker" in navigator) window.addEventListener("load", ()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
document.addEventListener("DOMContentLoaded", init);
