// updater.js
// Keeps EverVerse current without anyone having to hard-refresh.
//
// sw.js calls skipWaiting() + clients.claim(), so a newly deployed worker
// takes control as soon as it installs — but the page is still running the
// JS it loaded first, which is why a new feature can look "missing" until a
// manual Ctrl+Shift+R. This watches for that moment and swaps the page over:
//   • tab in the background  → reload silently, nobody notices
//   • user is on the page    → offer a one-tap Refresh, so a half-finished
//                              export is never thrown away
// It also re-checks for a deploy on a timer and whenever the tab regains
// focus, so a long-open studio session still picks up new versions.

(function () {
  var LAST_RELOAD = "ev_last_reload";
  var CHECK_MS = 60000;   // poll for a deploy every minute
  var LOOP_GUARD_MS = 15000; // never auto-reload twice in quick succession

  function lastReload() {
    try { return parseInt(sessionStorage.getItem(LAST_RELOAD), 10) || 0; } catch (e) { return 0; }
  }
  function recentlyReloaded() {
    return Date.now() - lastReload() < LOOP_GUARD_MS;
  }
  function doReload() {
    if (recentlyReloaded()) return;
    try { sessionStorage.setItem(LAST_RELOAD, String(Date.now())); } catch (e) {}
    location.reload();
  }

  function showBanner() {
    if (document.getElementById("ev-update-bar")) return;
    var bar = document.createElement("div");
    bar.id = "ev-update-bar";
    bar.setAttribute("role", "status");
    bar.style.cssText = [
      "position:fixed", "left:50%", "transform:translateX(-50%)",
      "bottom:calc(18px + env(safe-area-inset-bottom,0px))", "z-index:99999",
      "display:flex", "align-items:center", "gap:12px",
      "padding:11px 14px", "border-radius:12px",
      "background:#20201f", "color:#f4efe6",
      "border:1px solid rgba(214,183,122,0.35)",
      "box-shadow:0 8px 26px rgba(0,0,0,0.32)",
      "font:500 14px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
      "max-width:calc(100vw - 24px)",
    ].join(";");

    var msg = document.createElement("span");
    msg.textContent = "✦ A new version of EverVerse is ready.";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Refresh";
    btn.style.cssText = [
      "cursor:pointer", "border:0", "border-radius:8px",
      "padding:7px 13px", "background:#d6b77a", "color:#20201f",
      "font:600 14px/1 inherit", "flex:none",
    ].join(";");
    btn.onclick = doReload;
    bar.appendChild(msg);
    bar.appendChild(btn);
    document.body.appendChild(bar);

    // If they wander off to another tab, apply it quietly instead of nagging.
    document.addEventListener("visibilitychange", function onHide() {
      if (document.visibilityState === "hidden") {
        document.removeEventListener("visibilitychange", onHide);
        doReload();
      }
    });
  }

  function onUpdateReady() {
    if (recentlyReloaded()) return;
    if (document.visibilityState === "hidden") doReload();
    else showBanner();
  }

  window.initAutoUpdate = function (swUrl) {
    if (!("serviceWorker" in navigator)) return;
    // A page with no controller is a first-ever visit — the worker claiming
    // it is not an "update", so don't reload on that.
    var hadController = !!navigator.serviceWorker.controller;

    navigator.serviceWorker.register(swUrl || "sw.js").then(function (reg) {
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (hadController) onUpdateReady();
      });

      reg.addEventListener("updatefound", function () {
        var sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", function () {
          if (sw.state === "installed" && navigator.serviceWorker.controller) onUpdateReady();
        });
      });

      var check = function () { try { reg.update(); } catch (e) {} };
      setInterval(check, CHECK_MS);
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") check();
      });
    }).catch(function () {});
  };
})();
