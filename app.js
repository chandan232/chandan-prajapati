/* ==========================================================================
   Shared behaviour (every page) + the home page.
   No framework, no build step.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  /* ---------- theme ---------- */
  function syncThemeButtons() {
    var dark = root.dataset.theme === "dark";
    $$(".theme-btn").forEach(function (b) { b.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme"); });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#121212" : "#f3eee4");
  }
  $$(".theme-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      store.set("theme", root.dataset.theme);
      syncThemeButtons();
      window.dispatchEvent(new Event("themechange"));
    });
  });
  syncThemeButtons();

  /* ---------- scroll progress ---------- */
  var bar = $("#progress");
  if (bar) {
    var ticking = false;
    var paint = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    window.addEventListener("resize", paint);
    paint();
  }

  /* ---------- colour helpers for canvases ---------- */
  function rgb(name) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    if (v.charAt(0) === "#") {
      if (v.length === 4) v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
      var n = parseInt(v.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    var m = v.match(/\d+/g);
    return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
  }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a.toFixed(3) + ")"; }

  /* ---------- background network (whole page, faint) ---------- */
  (function bgNet() {
    var canvas = $("#bg");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, nodes = [], acc, rule, dark, raf = 0, last = 0;
    var LINK = 170;

    function colors() { acc = rgb("--accent"); rule = rgb("--rule"); dark = root.dataset.theme === "dark"; }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(22, Math.min(64, Math.round((w * h) / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16, a: Math.random() < 0.4 });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var la = dark ? 0.16 : 0.2;
      for (var i = 0; i < nodes.length; i++) {
        var p = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var q = nodes[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            var t = 1 - Math.sqrt(d2) / LINK;
            ctx.strokeStyle = rgba(p.a || q.a ? acc : rule, t * la);
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        if (n.a) {
          ctx.fillStyle = rgba(acc, dark ? 0.12 : 0.1);
          ctx.beginPath(); ctx.arc(n.x, n.y, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = rgba(acc, dark ? 0.55 : 0.5);
        } else {
          ctx.fillStyle = rgba(rule, dark ? 0.35 : 0.45);
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, n.a ? 2 : 1.3, 0, Math.PI * 2); ctx.fill();
      }
    }
    function step(ts) {
      raf = requestAnimationFrame(step);
      if (ts - last < 33) return; // ~30 fps is plenty for a drift
      last = ts;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }
      draw();
    }
    colors(); size(); draw();
    if (!reduce) raf = requestAnimationFrame(step);
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { size(); draw(); }, 150); });
    window.addEventListener("themechange", function () { colors(); draw(); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) raf = requestAnimationFrame(step);
    });
  })();

  /* ---------- hero network: nodes orbiting the portrait ---------- */
  (function heroNet() {
    var canvas = $(".hero-net");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, cx = 0, cy = 0, R = 0, nodes = [], acc, rule, dark, raf = 0, visible = true, t0 = performance.now();
    var BLEED = 160; // .hero-net extends this far past the portrait on every side (styles.css)

    function colors() { acc = rgb("--accent"); rule = rgb("--rule"); dark = root.dataset.theme === "dark"; }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height; cx = w / 2; cy = h / 2;
      R = (Math.min(w, h) - BLEED * 2) / 2; // photo radius
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = [];
      var count = 30;
      for (var i = 0; i < count; i++) {
        var ang = (i / count) * Math.PI * 2 + Math.random() * 0.25;
        var ring = R + 34 + Math.random() * (BLEED - 40);
        nodes.push({
          ang: ang, ring: ring, spd: (Math.random() < 0.5 ? -1 : 1) * (0.012 + Math.random() * 0.02),
          wob: Math.random() * Math.PI * 2, a: Math.random() < 0.55, spoke: Math.random() < 0.45,
          r: Math.random() < 0.15 ? 3.4 : 2.1
        });
      }
    }
    function pos(n, t) {
      var a = n.ang + n.spd * t;
      var rr = n.ring + Math.sin(t * 0.6 + n.wob) * 6;
      return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      var pts = nodes.map(function (n) { return pos(n, t); });
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], n = nodes[i];
        if (n.spoke) { // a line toward the photo; the photo covers the inner part
          ctx.strokeStyle = rgba(n.a ? acc : rule, dark ? 0.32 : 0.35);
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(cx + (p.x - cx) * 0.55, cy + (p.y - cy) * 0.55); ctx.stroke();
        }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 92) {
            ctx.strokeStyle = rgba(n.a && nodes[j].a ? acc : rule, (1 - d / 92) * (dark ? 0.4 : 0.42));
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < pts.length; k++) {
        var m = nodes[k], pt = pts[k];
        // fade nodes near the canvas edge so the field has no hard border
        var edge = Math.min(pt.x, w - pt.x, pt.y, h - pt.y);
        var fade = Math.max(0, Math.min(1, edge / 70));
        if (m.a) {
          ctx.fillStyle = rgba(acc, 0.16 * fade);
          ctx.beginPath(); ctx.arc(pt.x, pt.y, m.r * 2.6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = rgba(acc, 0.95 * fade);
        } else {
          ctx.fillStyle = rgba(rule, 0.9 * fade);
        }
        ctx.beginPath(); ctx.arc(pt.x, pt.y, m.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      draw((now - t0) / 1000);
    }
    colors(); size(); draw(0);
    if (!reduce) {
      raf = requestAnimationFrame(loop);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting;
          cancelAnimationFrame(raf);
          if (visible && !document.hidden) raf = requestAnimationFrame(loop);
        }).observe(canvas);
      }
      document.addEventListener("visibilitychange", function () {
        cancelAnimationFrame(raf);
        if (!document.hidden && visible) raf = requestAnimationFrame(loop);
      });
    }
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { size(); draw((performance.now() - t0) / 1000); }, 150); });
    window.addEventListener("themechange", function () { colors(); draw((performance.now() - t0) / 1000); });
  })();

  /* ---------- reveal on scroll ---------- */
  (function reveal() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- copy buttons ---------- */
  $$("[data-copy]").forEach(function (b) {
    var label = b.textContent;
    b.addEventListener("click", function () {
      var done = function () {
        b.textContent = "Copied"; b.classList.add("done");
        setTimeout(function () { b.textContent = label; b.classList.remove("done"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(b.dataset.copy).then(done, done);
      else {
        var ta = document.createElement("textarea"); ta.value = b.dataset.copy; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        ta.remove(); done();
      }
    });
  });

  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ======================================================================
     Home page only
     ====================================================================== */

  /* ---------- query stream (simulated, and labelled so on the page) ---------- */
  (function stream() {
    var body = $("#stream");
    if (!body) return;
    var EVENTS = [
      ["pnl.statement", "basis=delivery", "26 cols · 412 ms", "fin"],
      ["view_query", "/api/p-and-l/statement", "sql + params captured", ""],
      ["cod.sheet.parse", "delhivery.xlsx", "format from column shape", "fin"],
      ["cod.preview", "will_update=70", "already_set=16 · no_match=4", "fin"],
      ["tat.percentiles", "p50 · p90 · p100", "6 speed bands", ""],
      ["refund.flag", "buyer-1182", "HIGH · 6 orders · 3 claims", "warn"],
      ["cod.apply", "txn committed", "audit ✓ · re-run safe", "fin"],
      ["meta.funnel", "campaign 2385…", "7 stages · cache hit", ""],
      ["pool.transfer", "MASTER → COUPON", "both sides · 1 txn", "fin"],
      ["scheme.near_miss", "tier 2", "within 25% of target", ""],
      ["payout.approve", "PAY-48213", "processed guard ✓", "fin"],
      ["ist.bucket", "Asia/Kolkata", "23:50 → right day", ""],
      ["sla.breach", "seller-0417", "> 2 days, Sundays excluded", "warn"],
      ["segments.refresh", "8 lifecycle × 4 tiers", "412 ms", ""]
    ];
    var fmt;
    try { fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }); }
    catch (e) { fmt = null; }
    var stamp = function (d) { return fmt ? fmt.format(d) : d.toTimeString().slice(0, 8); };
    var i = 0;
    function row(date, animate) {
      var e = EVENTS[i++ % EVENTS.length];
      var el = document.createElement("div");
      el.className = "srow";
      if (!animate) el.style.animation = "none";
      el.innerHTML = '<span class="t">' + stamp(date) + '</span><span class="e ' + e[3] + '">' + e[0] + '</span><span class="s">' + e[1] + '</span><span class="x">' + e[2] + "</span>";
      body.appendChild(el);
      while (body.children.length > 6) body.removeChild(body.firstChild);
    }
    var now = Date.now();
    for (var k = 5; k >= 0; k--) row(new Date(now - k * 1900), false);
    if (!reduce) setInterval(function () { if (!document.hidden) row(new Date(), true); }, 2100);
  })();

  /* ---------- count-up stats ---------- */
  (function counters() {
    var els = $$("[data-count]");
    if (!els.length || reduce || !("IntersectionObserver" in window)) return;
    var fmt = function (n) { return Math.round(n).toLocaleString("en-IN"); };
    els.forEach(function (el) { el.textContent = "0"; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, target = parseFloat(el.dataset.count), t0 = performance.now(), dur = 1300;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * e);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- selected work: index, sticky panel, filters, cards ---------- */
  (function work() {
    var list = $("#plist"), grid = $("#work-grid"), panel = $("#pp-body");
    var P = window.PROJECTS, VIZ = window.VIZ || {};
    if (!list || !P) return;
    var total = P.length;
    var esc = function (s) { return String(s).replace(/&(?!amp;|lt;|gt;|#)/g, "&amp;"); };
    var href = function (p) { return "work.html?p=" + p.id; };

    function words(p) {
      var txt = [p.lede].concat(p.context, p.build.map(function (b) { return b.t + " " + b.d; }), p.numbers.map(function (n) { return n.l + " " + n.h; }), [p.note], p.lessons, p.diagram.nodes.map(function (n) { return n.d; })).join(" ");
      return txt.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    }
    P.forEach(function (p, i) { p.num = pad(i + 1); p.read = Math.max(2, Math.round(words(p) / 200)); });

    list.innerHTML = P.map(function (p) {
      return '<article class="prow" data-id="' + p.id + '" data-themes="' + p.themes.join("|") + '">' +
        '<a class="cover" href="' + href(p) + '" aria-label="' + esc(p.title) + ': read the build notes"></a>' +
        '<span class="num">' + p.num + "</span>" +
        '<div class="head"><h3>' + esc(p.title) + '</h3><p class="hook">' + esc(p.hook) + "</p></div>" +
        '<div class="kpi"><div class="v">' + p.kpi.v + '</div><div class="l">' + esc(p.kpi.l) + "</div></div>" +
        '<div class="viz">' + (VIZ[p.viz] ? VIZ[p.viz]() : "") + '<div class="vl">' + esc(p.vizLabel) + "</div></div>" +
        '<p class="desc">' + esc(p.desc) + "</p>" +
        '<div class="stack">' + p.stack.map(esc).join(" · ") + "</div>" +
        '<span class="arrow" aria-hidden="true">→</span>' +
        "</article>";
    }).join("");
    var rows = $$(".prow", list);

    /* Theme chips */
    var chips = $("#chips");
    var order = ["Finance", "Reconciliation", "Controls", "Ops", "Growth", "AI"];
    var themes = order.filter(function (t) { return P.some(function (p) { return p.themes.indexOf(t) > -1; }); });
    var filter = "All";
    ["All"].concat(themes).forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = t;
      b.setAttribute("aria-pressed", t === "All" ? "true" : "false");
      b.addEventListener("click", function () {
        filter = filter === t && t !== "All" ? "All" : t;
        $$(".chip", chips).forEach(function (c) { c.setAttribute("aria-pressed", c.textContent === filter ? "true" : "false"); });
        rows.forEach(function (r) { r.hidden = filter !== "All" && r.dataset.themes.split("|").indexOf(filter) < 0; });
        current = -1; update();
      });
      chips.appendChild(b);
    });

    /* Index / Cards */
    var seg = $$(".seg button");
    function setView(v) {
      grid.classList.toggle("is-cards", v === "cards");
      seg.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.view === v ? "true" : "false"); });
      store.set("workView", v);
      current = -1; update();
    }
    seg.forEach(function (b) { b.addEventListener("click", function () { setView(b.dataset.view); }); });

    /* Sticky panel */
    var introHTML = panel.innerHTML;
    function panelHTML(p) {
      var idx = P.indexOf(p);
      return '<div class="pp-top"><span>' + p.themes.join(" · ") + '</span><span class="c">' + p.num + " / " + pad(total) + "</span></div>" +
        '<div class="pp-track"><i style="width:' + ((idx + 1) / total) * 100 + '%"></i></div>' +
        '<h3 class="pp-title">' + esc(p.title) + "</h3>" +
        '<p class="pp-desc">' + esc(p.desc) + "</p>" +
        '<div class="pp-stats">' + p.stats.map(function (s) { return '<div class="pp-stat"><div class="v">' + s.v + '</div><div class="l">' + esc(s.l) + "</div></div>"; }).join("") + "</div>" +
        '<div class="pills">' + p.stack.map(function (s) { return '<span class="pill">' + esc(s) + "</span>"; }).join("") + "</div>" +
        '<div class="pp-cta"><a class="btn-pill" href="' + href(p) + '">' + esc(p.hook) + ' <span aria-hidden="true">→</span></a><span class="read">' + p.read + " min read</span></div>" +
        '<p class="pp-quote">“' + esc(p.quote) + "”</p>";
    }
    var current = -1, swapT;
    function show(i) {
      if (i === current) return;
      current = i;
      rows.forEach(function (r, k) { r.classList.toggle("is-active", k === i); });
      list.classList.toggle("has-active", i > -1);
      panel.classList.add("swap");
      clearTimeout(swapT);
      swapT = setTimeout(function () {
        panel.innerHTML = i > -1 ? panelHTML(P[i]) : introHTML;
        panel.classList.remove("swap");
      }, reduce ? 0 : 160);
    }
    var mq = window.matchMedia("(max-width: 1080px)");
    function update() {
      if (grid.classList.contains("is-cards") || mq.matches) {
        rows.forEach(function (r) { r.classList.remove("is-active"); });
        list.classList.remove("has-active");
        return;
      }
      var line = window.innerHeight * 0.46, pick = -1;
      var vis = rows.filter(function (r) { return !r.hidden; });
      if (!vis.length) return show(-1);
      var first = vis[0].getBoundingClientRect(), lastR = vis[vis.length - 1].getBoundingClientRect();
      if (first.top > line) pick = -1;
      else if (lastR.bottom < line) pick = rows.indexOf(vis[vis.length - 1]);
      else vis.forEach(function (r) { var b = r.getBoundingClientRect(); if (b.top <= line && b.bottom > line) pick = rows.indexOf(r); });
      if (pick === -1 && first.top <= line) pick = rows.indexOf(vis[0]);
      show(pick);
    }
    var queued = false;
    window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; update(); }); } }, { passive: true });
    window.addEventListener("resize", update);
    if (mq.addEventListener) mq.addEventListener("change", update);
    setView(store.get("workView") === "cards" ? "cards" : "index");
  })();
})();
