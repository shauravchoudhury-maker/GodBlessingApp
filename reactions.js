// reactions.js — EVReact: likes, loves, comments and "most loved" trending,
// backed by Firebase Firestore. Shared across all visitors. Degrades gracefully
// (features hidden) until firebase-config.js has real values.
// Depends on: firebase (compat SDK), FIREBASE_CONFIG/FIREBASE_READY, VERSE_DB,
// openVerseDetail (site.js), escapeHtml (site.js).

const EVReact = (function () {
  let db = null, ready = false;

  function init() {
    if (typeof FIREBASE_READY === "undefined" || !FIREBASE_READY) return false;
    if (typeof firebase === "undefined" || !firebase.firestore) return false;
    try {
      if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore();
      ready = true;
    } catch (e) { ready = false; }
    return ready;
  }
  const isReady = () => ready;

  const refId = (v) => v.ref.replace(/[^\w]+/g, "_").toLowerCase();

  /* per-device dedup (soft — no accounts) */
  const rKey = (id, type) => "ev_react_" + type + "_" + id;
  const hasReacted = (id, type) => { try { return localStorage.getItem(rKey(id, type)) === "1"; } catch (e) { return false; } };
  const setReacted = (id, type, on) => { try { on ? localStorage.setItem(rKey(id, type), "1") : localStorage.removeItem(rKey(id, type)); } catch (e) {} };

  async function toggle(v, type) {
    if (!ready) return;
    const id = refId(v);
    const on = hasReacted(id, type);
    const delta = on ? -1 : 1;
    setReacted(id, type, !on);
    const inc = firebase.firestore.FieldValue.increment(delta);
    const update = { ref: v.ref, faith: v.faith, text: (v.text || "").slice(0, 140), score: inc };
    update[type] = inc;
    try { await db.collection("reactions").doc(id).set(update, { merge: true }); } catch (e) {}
  }
  function watchCounts(v, cb) {
    if (!ready) { cb({ likes: 0, loves: 0 }); return () => {}; }
    return db.collection("reactions").doc(refId(v)).onSnapshot(
      (s) => { const d = s.data() || {}; cb({ likes: d.likes || 0, loves: d.loves || 0 }); },
      () => cb({ likes: 0, loves: 0 })
    );
  }

  /* ---- Reaction bar ---- */
  function reactionBar(v) {
    const bar = document.createElement("div");
    bar.className = "react-bar";
    if (!ready) return bar;
    const id = refId(v);
    let last = { likes: 0, loves: 0 };
    const love = document.createElement("button"); love.className = "react-btn love";
    const like = document.createElement("button"); like.className = "react-btn like";
    function paint() {
      love.innerHTML = `🙏 <b>${last.loves}</b>`;
      like.innerHTML = `👍 <b>${last.likes}</b>`;
      love.classList.toggle("on", hasReacted(id, "loves"));
      like.classList.toggle("on", hasReacted(id, "likes"));
    }
    paint();
    watchCounts(v, (c) => { last = c; paint(); });
    love.onclick = () => { toggle(v, "loves"); paint(); };
    like.onclick = () => { toggle(v, "likes"); paint(); };
    bar.append(love, like);
    return bar;
  }

  /* ---- Comments (basic moderation) ---- */
  const BADWORDS = ["fuck", "shit", "bitch", "asshole", "cunt", "nigger", "faggot", "slut", "whore", "dick", "porn"];
  function isProfane(s) { const t = (s || "").toLowerCase(); return BADWORDS.some((w) => t.includes(w)); }
  function tooSoon() { try { const t = +localStorage.getItem("ev_last_comment") || 0; return Date.now() - t < 20000; } catch (e) { return false; } }
  function markPosted() { try { localStorage.setItem("ev_last_comment", String(Date.now())); } catch (e) {} }

  function commentsSection(v) {
    const wrap = document.createElement("div");
    wrap.className = "comments";
    if (!ready) return wrap;
    const id = refId(v);
    const h = document.createElement("div"); h.className = "cmt-heading"; h.textContent = "Reflections";
    const list = document.createElement("div"); list.className = "cmt-list";
    const form = document.createElement("div"); form.className = "cmt-form";
    form.innerHTML =
      `<input class="cmt-name" placeholder="Your name (optional)" maxlength="40" />` +
      `<textarea class="cmt-text" placeholder="Share a reflection or prayer…" maxlength="500" rows="2"></textarea>` +
      `<div class="cmt-row"><button class="btn primary sm cmt-send">Post</button><span class="cmt-status"></span></div>`;
    wrap.append(h, list, form);

    db.collection("comments").where("refId", "==", id).orderBy("created", "desc").limit(60).onSnapshot(
      (snap) => {
        list.innerHTML = "";
        if (snap.empty) { list.innerHTML = '<div class="cmt-empty">Be the first to share a reflection. 🙏</div>'; return; }
        snap.forEach((doc) => {
          const c = doc.data();
          const el = document.createElement("div"); el.className = "cmt";
          const nm = document.createElement("div"); nm.className = "cmt-name-lbl"; nm.textContent = c.name || "Anonymous";
          const bd = document.createElement("div"); bd.className = "cmt-body"; bd.textContent = c.text || "";
          el.append(nm, bd); list.appendChild(el);
        });
      },
      () => { list.innerHTML = '<div class="cmt-empty">Reflections are unavailable right now.</div>'; }
    );

    form.querySelector(".cmt-send").onclick = async () => {
      const st = form.querySelector(".cmt-status");
      const name = (form.querySelector(".cmt-name").value || "").trim().slice(0, 40);
      let text = (form.querySelector(".cmt-text").value || "").trim();
      if (!text) { st.textContent = "Write something first."; return; }
      if (isProfane(text) || isProfane(name)) { st.textContent = "Please keep it kind. 🙏"; return; }
      if (tooSoon()) { st.textContent = "Please wait a moment before posting again."; return; }
      text = text.slice(0, 500);
      st.textContent = "Posting…";
      try {
        await db.collection("comments").add({
          refId: id, ref: v.ref, name: name || "Anonymous", text,
          created: firebase.firestore.FieldValue.serverTimestamp(),
        });
        form.querySelector(".cmt-text").value = "";
        st.textContent = "Thank you for sharing. 🙏";
        markPosted();
      } catch (e) { st.textContent = "Could not post — please try again."; }
    };
    return wrap;
  }

  /* ---- Trending (most loved) ---- */
  function renderTrending(container) {
    container.innerHTML = "";
    if (!ready) {
      container.innerHTML = '<p class="section-sub">Trending lights up once community reactions are enabled.</p>';
      return;
    }
    const list = document.createElement("div"); list.className = "trend-list"; container.appendChild(list);
    db.collection("reactions").orderBy("score", "desc").limit(15).onSnapshot(
      (snap) => {
        list.innerHTML = "";
        if (snap.empty) { list.innerHTML = '<div class="cmt-empty">No reactions yet — be the first to love a verse. 🙏</div>'; return; }
        let rank = 1;
        snap.forEach((doc) => {
          const d = doc.data();
          if (((d.loves || 0) + (d.likes || 0)) <= 0) return;
          const v = VERSE_DB.find((x) => x.ref === d.ref) || { ref: d.ref, text: d.text || "", faith: d.faith || "Bible", theme: "warm", topic: "faith" };
          const row = document.createElement("div"); row.className = "trend-row";
          const rk = document.createElement("span"); rk.className = "trend-rank"; rk.textContent = rank++;
          const main = document.createElement("div"); main.className = "trend-main";
          const rf = document.createElement("div"); rf.className = "trend-ref"; rf.textContent = d.ref;
          const tx = document.createElement("div"); tx.className = "trend-text"; tx.textContent = (d.text || "").slice(0, 90) + "…";
          main.append(rf, tx);
          const ct = document.createElement("div"); ct.className = "trend-counts"; ct.textContent = `🙏 ${d.loves || 0} · 👍 ${d.likes || 0}`;
          row.append(rk, main, ct);
          row.onclick = () => openVerseDetail(v);
          list.appendChild(row);
        });
        if (!list.children.length) list.innerHTML = '<div class="cmt-empty">No reactions yet — be the first to love a verse. 🙏</div>';
      },
      () => { list.innerHTML = '<div class="cmt-empty">Trending is unavailable right now.</div>'; }
    );
  }

  return { init, isReady, reactionBar, commentsSection, renderTrending, refId };
})();
