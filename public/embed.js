/**
 * Flow Circuit — Embeddable Mini-Assessment Widget
 * Drop this on any site: <script src="https://YOUR_DOMAIN/embed.js"></script>
 * Optional: <div id="flow-circuit-widget" data-theme="dark"></div>
 * If no container exists, a floating button appears bottom-right.
 */
(function () {
  "use strict";

  var ORIGIN = (document.currentScript && document.currentScript.src)
    ? new URL(document.currentScript.src).origin
    : "https://greg-berry--ea5d0102.us2.manus.space";

  var ASSESS_URL = ORIGIN + "/assessment";
  var SOULPRINT_URL = ORIGIN + "/soulprint";
  var FIND_PATH_URL = ORIGIN + "/find-your-path";

  // ── Styles ──
  var css = [
    "#fc-embed-btn{position:fixed;bottom:24px;right:24px;z-index:99999;width:56px;height:56px;border-radius:50%;background:#000;color:#fbbf24;border:2px solid #fbbf24;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:transform .2s,box-shadow .2s}",
    "#fc-embed-btn:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(0,0,0,.4)}",
    "#fc-embed-panel{position:fixed;bottom:92px;right:24px;z-index:99998;width:340px;max-height:520px;background:#0a0a0a;border:1px solid #333;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.5);overflow:hidden;display:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff}",
    "#fc-embed-panel.open{display:block;animation:fc-slide-up .3s ease}",
    "@keyframes fc-slide-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}",
    "#fc-embed-panel .fc-header{padding:20px;background:linear-gradient(135deg,#000 0%,#1a1a1a 100%);border-bottom:1px solid #333}",
    "#fc-embed-panel .fc-header h3{margin:0 0 4px;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:.5px}",
    "#fc-embed-panel .fc-header p{margin:0;font-size:12px;color:#888;line-height:1.4}",
    "#fc-embed-panel .fc-body{padding:16px}",
    "#fc-embed-panel .fc-card{display:block;padding:14px;margin-bottom:10px;background:#111;border:1px solid #333;border-radius:12px;text-decoration:none;color:#fff;transition:border-color .2s,background .2s}",
    "#fc-embed-panel .fc-card:hover{border-color:#fbbf24;background:#1a1a0a}",
    "#fc-embed-panel .fc-card .fc-icon{font-size:20px;margin-bottom:6px}",
    "#fc-embed-panel .fc-card h4{margin:0 0 4px;font-size:14px;font-weight:700}",
    "#fc-embed-panel .fc-card p{margin:0;font-size:11px;color:#888;line-height:1.4}",
    "#fc-embed-panel .fc-card .fc-tag{display:inline-block;margin-top:8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;padding:2px 8px;border-radius:4px;background:#fbbf24;color:#000}",
    "#fc-embed-panel .fc-footer{padding:12px 16px;border-top:1px solid #222;text-align:center}",
    "#fc-embed-panel .fc-footer a{font-size:11px;color:#666;text-decoration:none}",
    "#fc-embed-panel .fc-footer a:hover{color:#fbbf24}",
    "#fc-embed-panel .fc-close{position:absolute;top:12px;right:12px;background:none;border:none;color:#666;cursor:pointer;font-size:18px;padding:4px}",
    "#fc-embed-panel .fc-close:hover{color:#fff}",
    ".fc-inline-widget{background:#0a0a0a;border:1px solid #333;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;max-width:400px}",
    ".fc-inline-widget .fc-header{padding:20px;background:linear-gradient(135deg,#000 0%,#1a1a1a 100%);border-bottom:1px solid #333}",
    ".fc-inline-widget .fc-header h3{margin:0 0 4px;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#fff}",
    ".fc-inline-widget .fc-header p{margin:0;font-size:12px;color:#888;line-height:1.4}",
    ".fc-inline-widget .fc-body{padding:16px}",
    ".fc-inline-widget .fc-card{display:block;padding:14px;margin-bottom:10px;background:#111;border:1px solid #333;border-radius:12px;text-decoration:none;color:#fff;transition:border-color .2s,background .2s}",
    ".fc-inline-widget .fc-card:hover{border-color:#fbbf24;background:#1a1a0a}",
    ".fc-inline-widget .fc-card .fc-icon{font-size:20px;margin-bottom:6px}",
    ".fc-inline-widget .fc-card h4{margin:0 0 4px;font-size:14px;font-weight:700;color:#fff}",
    ".fc-inline-widget .fc-card p{margin:0;font-size:11px;color:#888;line-height:1.4}",
    ".fc-inline-widget .fc-card .fc-tag{display:inline-block;margin-top:8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;padding:2px 8px;border-radius:4px;background:#fbbf24;color:#000}",
    ".fc-inline-widget .fc-footer{padding:12px 16px;border-top:1px solid #222;text-align:center}",
    ".fc-inline-widget .fc-footer a{font-size:11px;color:#666;text-decoration:none}",
    ".fc-inline-widget .fc-footer a:hover{color:#fbbf24}"
  ].join("\n");

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ── Card HTML ──
  function buildCards() {
    return [
      '<a class="fc-card" href="' + ASSESS_URL + '" target="_blank" rel="noopener">',
      '  <div class="fc-icon">⚡</div>',
      '  <h4>Flow Circuit Assessment</h4>',
      '  <p>Discover your energy role — Spark, Amplifier, Filter, Ground, or Conductor. Three minutes.</p>',
      '  <span class="fc-tag">Free</span>',
      '</a>',
      '<a class="fc-card" href="' + SOULPRINT_URL + '" target="_blank" rel="noopener">',
      '  <div class="fc-icon">🔮</div>',
      '  <h4>SoulPrint</h4>',
      '  <p>Map your soul\'s inertia — the patterns you can\'t run from. Three tiers of depth.</p>',
      '  <span class="fc-tag">$44</span>',
      '</a>',
      '<a class="fc-card" href="' + FIND_PATH_URL + '" target="_blank" rel="noopener">',
      '  <div class="fc-icon">🧭</div>',
      '  <h4>Find Your Frequency</h4>',
      '  <p>The master journey — energy, soul, tribe, impact, element. All connected.</p>',
      '  <span class="fc-tag">Explore</span>',
      '</a>'
    ].join("\n");
  }

  function buildWidget(isInline) {
    var html = [
      '<div class="fc-header">',
      '  <h3>Find Your Me</h3>',
      '  <p>Self-discovery tools from The Flow Circuit ecosystem. Know your energy. Know your soul. Know your team.</p>',
      '</div>',
      '<div class="fc-body">',
      buildCards(),
      '</div>',
      '<div class="fc-footer">',
      '  <a href="https://tonygreenb-gxhndhxp.manus.space" target="_blank" rel="noopener">Powered by Tony Greenberg &middot; Only Time Buys Trust</a>',
      '</div>'
    ].join("\n");
    return html;
  }

  // ── Check for inline container ──
  var inlineContainer = document.getElementById("flow-circuit-widget");

  if (inlineContainer) {
    inlineContainer.classList.add("fc-inline-widget");
    inlineContainer.innerHTML = buildWidget(true);
    return;
  }

  // ── Floating button + panel ──
  var btn = document.createElement("button");
  btn.id = "fc-embed-btn";
  btn.innerHTML = "⚡";
  btn.setAttribute("aria-label", "Open Flow Circuit");
  btn.title = "Find Your Me";

  var panel = document.createElement("div");
  panel.id = "fc-embed-panel";
  panel.innerHTML = '<button class="fc-close" aria-label="Close">&times;</button>' + buildWidget(false);

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  btn.addEventListener("click", function () {
    panel.classList.toggle("open");
  });

  panel.querySelector(".fc-close").addEventListener("click", function () {
    panel.classList.remove("open");
  });

  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove("open");
    }
  });
})();
