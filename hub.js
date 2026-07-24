// hub.js — EverVerse interactive "Read" hub (fully on-device, no backend).
// Sermon reader + voice-over + translation, favorites/saved, daily streak,
// prayer journal, and best-effort daily reminders. All state in localStorage.

const $$ = (id) => document.getElementById(id);
const evSleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- localStorage store ------------------------------------------ */
const EV = {
  get(k, d) { try { const v = localStorage.getItem("ev_" + k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem("ev_" + k, JSON.stringify(v)); } catch (_) {} },
};
function dayKey(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ---- Daily streak ------------------------------------------------- */
function updateStreak() {
  const s = EV.get("streak", { count: 0, last: null, total: 0 });
  const today = dayKey();
  if (s.last !== today) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    s.count = s.last === dayKey(y) ? (s.count || 0) + 1 : 1;
    s.total = (s.total || 0) + 1;
    s.last = today;
    EV.set("streak", s);
  }
  renderStreak(s);
  return s;
}
function renderStreak(s) {
  const el = $$("hub-streak");
  if (!el) return;
  el.innerHTML =
    `<div class="streak-num">🔥 ${s.count}</div>` +
    `<div class="streak-txt"><b>day streak</b><span>${s.total || s.count} days walking with EverVerse</span></div>`;
}

/* ---- Favorites / Saved ------------------------------------------- */
function getFavs() { return EV.get("favorites", []); }
function isFav(type, id) { return getFavs().some((f) => f.type === type && f.id === id); }
function toggleFav(type, id, label) {
  const favs = getFavs();
  const i = favs.findIndex((f) => f.type === type && f.id === id);
  if (i >= 0) favs.splice(i, 1); else favs.push({ type, id, label, at: dayKey() });
  EV.set("favorites", favs);
  renderSaved();
  return i < 0;
}
function renderSaved() {
  const el = $$("saved-list");
  if (!el) return;
  const favs = getFavs();
  el.innerHTML = "";
  if (!favs.length) { el.innerHTML = '<p class="hint">Tap ♡ on a verse or sermon to save it here for later.</p>'; return; }
  favs.slice().reverse().forEach((f) => {
    const div = document.createElement("div");
    div.className = "saved-item";
    div.innerHTML = `<span class="badge alt">${f.type}</span> <span class="si-label"></span>`;
    div.querySelector(".si-label").textContent = f.label;
    if (f.type === "sermon") { div.style.cursor = "pointer"; div.onclick = () => openSermon(f.id); }
    const rm = document.createElement("button");
    rm.className = "t-copy"; rm.textContent = "remove";
    rm.onclick = (e) => { e.stopPropagation(); toggleFav(f.type, f.id, f.label); if (typeof updateFavVerse === "function") updateFavVerse(); };
    div.appendChild(rm);
    el.appendChild(div);
  });
}

/* ---- Sermon library + reader ------------------------------------- */
function estReadMin(s) {
  const words = (s.body.join(" ") + " " + s.takeaway).split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
function renderSermonList() {
  const src = $$("sermon-source").value, th = $$("sermon-theme").value;
  const list = $$("sermon-list");
  list.innerHTML = "";
  const items = SERMONS.filter((s) => (src === "all" || s.faith === src) && (th === "all" || s.theme === th));
  if (!items.length) { list.innerHTML = '<p class="hint">No sermons match that filter yet — more are added in batches.</p>'; return; }
  items.forEach((s) => {
    const card = document.createElement("div");
    card.className = "sermon-card";
    card.innerHTML =
      `<div class="sc-badges"><span class="badge">${s.faith}</span><span class="badge alt">${s.theme}</span><span class="sc-min">${estReadMin(s)} min</span></div>` +
      `<h3 class="sc-title"></h3><div class="sc-verse"></div><div class="sc-preview"></div>`;
    card.querySelector(".sc-title").textContent = s.title;
    card.querySelector(".sc-verse").textContent = s.verseRef;
    card.querySelector(".sc-preview").textContent = s.body[0].slice(0, 120) + "…";
    card.onclick = () => openSermon(s.id);
    list.appendChild(card);
  });
}

let currentSermon = null, sermonLang = "en", sermonTrans = null;
function openSermon(id) {
  const s = sermonById(id);
  if (!s) return;
  currentSermon = s; sermonLang = "en"; sermonTrans = null;
  $$("reader-title").textContent = s.title;
  $$("reader-meta").textContent = `${faithLabel(s.faith)} · ${s.theme} · ${estReadMin(s)} min read`;
  $$("reader-verse").textContent = `“${s.verseText}” — ${s.verseRef}`;
  $$("reader-lang").value = "en";
  $$("reader-trans-status").textContent = "";
  renderSermonBody();
  updateReaderFav();
  stopSermonSpeak();
  $$("read-sections").classList.add("hidden");
  $$("sermon-reader").classList.remove("hidden");
  $$("sermon-reader").scrollIntoView({ behavior: "smooth", block: "start" });
}
function closeSermon() {
  stopSermonSpeak();
  $$("sermon-reader").classList.add("hidden");
  $$("read-sections").classList.remove("hidden");
}
function readerBody() {
  const useT = sermonTrans && sermonLang !== "en";
  return {
    body: useT ? sermonTrans.body : currentSermon.body,
    takeaway: useT ? sermonTrans.takeaway : currentSermon.takeaway,
    rtl: useT ? sermonTrans.rtl : false,
  };
}
function renderSermonBody() {
  const { body, takeaway, rtl } = readerBody();
  const el = $$("reader-body"); el.innerHTML = "";
  body.forEach((p) => { const par = document.createElement("p"); par.textContent = p; if (rtl) par.dir = "rtl"; el.appendChild(par); });
  const tk = $$("reader-takeaway"); tk.textContent = takeaway; tk.dir = rtl ? "rtl" : "ltr";
}
function updateReaderFav() {
  const on = isFav("sermon", currentSermon.id);
  $$("reader-fav").textContent = on ? "♥ Saved" : "♡ Save";
  $$("reader-fav").classList.toggle("faved", on);
}
async function translateSermon(code) {
  if (code === "en") { sermonLang = "en"; renderSermonBody(); $$("reader-trans-status").textContent = ""; return; }
  const meta = LANGUAGES.find((l) => l.code === code);
  $$("reader-trans-status").textContent = `Translating to ${meta.name}… (this reads sentence by sentence)`;
  try {
    const body = [];
    for (const p of currentSermon.body) { body.push(await (typeof translateLong === "function" ? translateLong(p, code) : translateText(p, code))); await evSleep(300); }
    const takeaway = await (typeof translateLong === "function" ? translateLong(currentSermon.takeaway, code) : translateText(currentSermon.takeaway, code));
    sermonTrans = { body, takeaway, rtl: !!meta.rtl };
    sermonLang = code;
    renderSermonBody();
    $$("reader-trans-status").textContent = `Showing in ${meta.name}. (Machine translation — use the meaning as your guide.)`;
  } catch (e) {
    $$("reader-trans-status").textContent = `⚠ ${e.message}. Free API may be rate-limited — try again shortly.`;
  }
}
function sermonNarration() {
  const { body, takeaway } = readerBody();
  const s = currentSermon;
  return `${s.title}. ${s.verseText} From ${s.verseRef}. ${body.join(" ")} ${takeaway}`;
}
function speakSermon() {
  if (!window.speechSynthesis) { $$("reader-trans-status").textContent = "Voice isn't supported in this browser."; return; }
  EVVoice.speak(sermonNarration(), { lang: sermonLang, onend: stopSermonSpeak, onerror: stopSermonSpeak });
  $$("reader-stop").style.display = "inline-block";
  $$("reader-listen").textContent = "🔊 Speaking…";
}
function stopSermonSpeak() {
  EVVoice.stop();
  const s = $$("reader-stop"), l = $$("reader-listen");
  if (s) s.style.display = "none";
  if (l) l.textContent = "🎙 Listen";
}
function sermonPlainText() {
  const s = currentSermon;
  return `${s.title}\n\n"${s.verseText}"\n— ${s.verseRef}\n\n${s.body.join("\n\n")}\n\n💡 ${s.takeaway}\n\n— EverVerse`;
}
function downloadSermon() {
  downloadBlob(new Blob([sermonPlainText()], { type: "text/plain" }), `eververse_sermon_${currentSermon.id}.txt`);
}
async function shareSermon() {
  const text = sermonPlainText();
  if (navigator.share) {
    try { await navigator.share({ title: currentSermon.title, text }); return; }
    catch (e) { if (e && e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(text); $$("reader-trans-status").textContent = "Copied to clipboard."; } catch (_) {}
}

/* ---- Prayer / reflection journal --------------------------------- */
function renderJournal() {
  const list = EV.get("journal", []);
  const el = $$("journal-list"); el.innerHTML = "";
  if (!list.length) { el.innerHTML = '<p class="hint">Your reflections stay private on this device.</p>'; return; }
  list.slice().reverse().forEach((e, i) => {
    const realIndex = list.length - 1 - i;
    const div = document.createElement("div");
    div.className = "journal-entry";
    div.innerHTML = `<div class="je-date"></div><div class="je-text"></div>`;
    div.querySelector(".je-date").textContent = e.date;
    div.querySelector(".je-text").textContent = e.text;
    const del = document.createElement("button");
    del.className = "t-copy"; del.textContent = "delete";
    del.onclick = () => { const l = EV.get("journal", []); l.splice(realIndex, 1); EV.set("journal", l); renderJournal(); };
    div.appendChild(del);
    el.appendChild(div);
  });
}
function addJournal() {
  const t = $$("journal-input").value.trim();
  if (!t) return;
  const l = EV.get("journal", []);
  l.push({ date: new Date().toLocaleString(), text: t });
  EV.set("journal", l);
  $$("journal-input").value = "";
  renderJournal();
}
function exportJournal() {
  const l = EV.get("journal", []);
  const txt = l.map((e) => `[${e.date}]\n${e.text}\n`).join("\n") || "No entries yet.";
  downloadBlob(new Blob([txt], { type: "text/plain" }), "eververse_journal.txt");
}

/* ---- Daily reminder (best-effort, on-device) --------------------- */
function showEvNotification(title, body) {
  const opts = { body, icon: "icons/icon-192.png", badge: "icons/icon-192.png" };
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, opts)).catch(() => { try { new Notification(title, opts); } catch (_) {} });
  } else { try { new Notification(title, opts); } catch (_) {} }
}
function updateReminderUI(r) {
  const supported = "Notification" in window;
  $$("reminder-status").textContent = !supported
    ? "Notifications aren't supported in this browser."
    : r.enabled
      ? `On — you'll be reminded around ${r.time} when you next open EverVerse that day.`
      : "Off.";
}
function saveReminder() {
  const r = { enabled: $$("reminder-toggle").checked, time: $$("reminder-time").value || "08:00" };
  if (r.enabled && "Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((p) => {
      if (p !== "granted") { r.enabled = false; $$("reminder-toggle").checked = false; }
      EV.set("reminder", r); updateReminderUI(r);
    });
  } else { EV.set("reminder", r); updateReminderUI(r); }
}
function testReminder() {
  if (!("Notification" in window)) { $$("reminder-status").textContent = "Notifications not supported here."; return; }
  Notification.requestPermission().then((p) => {
    if (p === "granted") { const v = daily.verse; showEvNotification(`EverVerse · ${v.ref}`, meaningFor(v)); }
    else $$("reminder-status").textContent = "Permission was denied.";
  });
}
function maybeRemind() {
  const r = EV.get("reminder", { enabled: false, time: "08:00" });
  if (!r.enabled || !("Notification" in window) || Notification.permission !== "granted") return;
  if (EV.get("lastRemind", null) === dayKey()) return;
  const now = new Date();
  const [hh, mm] = (r.time || "08:00").split(":").map(Number);
  if (now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm)) {
    const v = daily.verse;
    showEvNotification("EverVerse · today's blessing", `${v.ref}: ${meaningFor(v)}`);
    EV.set("lastRemind", dayKey());
  }
}

/* ---- Init -------------------------------------------------------- */
function initHub() {
  $$("sermon-source").innerHTML = "";
  $$("sermon-source").add(new Option("All sources", "all"));
  [...new Set(SERMONS.map((s) => s.faith))].forEach((f) => $$("sermon-source").add(new Option(faithLabel(f), f)));
  const themes = [...new Set(SERMONS.map((s) => s.theme))].sort();
  themes.forEach((t) => $$("sermon-theme").add(new Option(t, t)));
  $$("sermon-source").onchange = renderSermonList;
  $$("sermon-theme").onchange = renderSermonList;
  renderSermonList();

  $$("reader-lang").add(new Option("English (original)", "en"));
  LANGUAGES.forEach((l) => $$("reader-lang").add(new Option(l.name, l.code)));
  $$("reader-back").onclick = closeSermon;
  $$("reader-fav").onclick = () => { toggleFav("sermon", currentSermon.id, currentSermon.title); updateReaderFav(); };
  $$("reader-listen").onclick = speakSermon;
  $$("reader-stop").onclick = stopSermonSpeak;
  $$("reader-lang").onchange = () => translateSermon($$("reader-lang").value);
  $$("reader-download").onclick = downloadSermon;
  $$("reader-share").onclick = shareSermon;

  $$("journal-add").onclick = addJournal;
  $$("journal-export").onclick = exportJournal;
  renderJournal();

  renderSaved();
  updateStreak();

  const r = EV.get("reminder", { enabled: false, time: "08:00" });
  $$("reminder-toggle").checked = r.enabled;
  $$("reminder-time").value = r.time;
  $$("reminder-toggle").onchange = saveReminder;
  $$("reminder-time").onchange = saveReminder;
  $$("reminder-test").onclick = testReminder;
  updateReminderUI(r);
  maybeRemind();
}
