/* ==========================================================================
   Project page: renders work.html?p=<id> from window.PROJECTS.
   Runs before app.js, so the reveal and progress hooks see the content.
   ========================================================================== */
(function () {
  "use strict";

  var P = window.PROJECTS || [];
  var page = document.getElementById("page");
  if (!page) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("p") || window.location.hash.replace("#", "");
  var idx = -1;
  for (var i = 0; i < P.length; i++) if (P[i].id === id) idx = i;

  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var esc = function (s) { return String(s).replace(/&(?!amp;|lt;|gt;|#)/g, "&amp;"); };
  var href = function (p) { return "work.html?p=" + p.id; };

  if (idx < 0) {
    page.innerHTML =
      '<div class="missing"><a class="back" href="index.html#work">← Work</a>' +
      '<h1 style="margin-top:28px">That project isn’t here.</h1>' +
      '<div class="prose"><p>Pick one of these instead:</p></div><div class="more">' +
      P.map(function (p, k) {
        return '<a href="' + href(p) + '" style="display:block;padding:16px 20px;border-top:' + (k ? "1px solid var(--line)" : "0") + '"><span class="t">' + esc(p.title) + '</span><span class="d" style="display:block;color:var(--muted);font-size:14px">' + esc(p.hook) + "</span></a>";
      }).join("") + "</div></div>";
    return;
  }

  var p = P[idx];
  var num = pad(idx + 1);
  var prev = P[(idx - 1 + P.length) % P.length];
  var next = P[(idx + 1) % P.length];

  document.title = p.title.replace(/&amp;/g, "&") + " — Chandan Prajapati";
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content", p.desc);

  /* ---------- diagram ---------- */
  var NW = 178, NH = 66, W = 998; // columns sit at x = 20 / 280 / 540 / 800
  function diagramHTML(d) {
    var H = d.h || 370;
    var byId = {};
    d.nodes.forEach(function (n) { byId[n.id] = n; });

    function anchor(a, b, e) {
      var aw = a.w || NW, ah = a.h || NH, bw = b.w || NW, bh = b.h || NH;
      var fo = e.fo || 0, to = e.to || 0, GAP = 4;
      if (b.x >= a.x + aw - 2) return { x1: a.x + aw, y1: a.y + ah / 2 + fo, x2: b.x - GAP, y2: b.y + bh / 2 + to, v: false };
      if (b.x + bw <= a.x + 2) return { x1: a.x, y1: a.y + ah / 2 + fo, x2: b.x + bw + GAP, y2: b.y + bh / 2 + to, v: false };
      if (b.y >= a.y + ah) return { x1: a.x + aw / 2 + fo, y1: a.y + ah, x2: b.x + bw / 2 + to, y2: b.y - GAP, v: true };
      return { x1: a.x + aw / 2 + fo, y1: a.y, x2: b.x + bw / 2 + to, y2: b.y + bh + GAP, v: true };
    }

    var paths = "", labels = "";
    d.edges.forEach(function (e, k) {
      var a = byId[e.f], b = byId[e.t];
      if (!a || !b) return;
      var g = anchor(a, b, e), dpath;
      if (g.v) {
        var dy = g.y2 - g.y1;
        dpath = "M" + g.x1 + "," + g.y1 + " C" + g.x1 + "," + (g.y1 + dy / 2) + " " + g.x2 + "," + (g.y2 - dy / 2) + " " + g.x2 + "," + g.y2;
      } else {
        var dx = g.x2 - g.x1;
        dpath = "M" + g.x1 + "," + g.y1 + " C" + (g.x1 + dx / 2) + "," + g.y1 + " " + (g.x2 - dx / 2) + "," + g.y2 + " " + g.x2 + "," + g.y2;
      }
      paths += '<path class="edge" data-e="' + k + '" d="' + dpath + '" marker-end="url(#ah)"/>';
      if (e.l) {
        labels += '<text class="elabel" data-e="' + k + '" x="' + ((g.x1 + g.x2) / 2).toFixed(1) + '" y="' + ((g.y1 + g.y2) / 2 + 4).toFixed(1) + '" text-anchor="middle">' + esc(e.l) + "</text>";
      }
    });

    var nodes = d.nodes.map(function (n) {
      var w = n.w || NW, h = n.h || NH;
      return '<button type="button" class="node k-' + n.k + '" data-id="' + n.id + '" style="left:' + (n.x / W * 100).toFixed(3) + "%;top:" + (n.y / H * 100).toFixed(3) + "%;width:" + (w / W * 100).toFixed(3) + "%;height:" + (h / H * 100).toFixed(3) + '%">' +
        '<span class="nt">' + esc(n.t) + '</span><span class="ns">' + esc(n.s) + "</span></button>";
    }).join("");

    var used = {};
    d.nodes.forEach(function (n) { used[n.k] = true; });
    var LEG = [["data", "Data"], ["service", "Service / view"], ["guard", "Guard"], ["llm", "LLM"], ["ext", "External system"], ["person", "Person"]];
    var legend = LEG.filter(function (l) { return used[l[0]]; }).map(function (l) { return '<span><i class="k-' + l[0] + '"></i>' + l[1] + "</span>"; }).join("");

    return '<div class="diagram" data-reveal>' +
      '<div class="panel-head"><span>How the data flows · ' + esc(p.title) + "</span></div>" +
      '<div class="dg-scroll"><div class="dg-canvas" id="dg" style="aspect-ratio:' + W + " / " + H + '">' +
      '<svg viewBox="0 0 ' + W + " " + H + '" aria-hidden="true"><defs>' +
      '<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ah" d="M0,0 L10,5 L0,10 z"/></marker>' +
      '<marker id="ah-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ah-on" d="M0,0 L10,5 L0,10 z"/></marker>' +
      "</defs>" + paths + labels + "</svg>" + nodes +
      "</div></div>" +
      '<div class="dg-foot"><p class="dg-info" id="dg-info">Hover or tap a component to see what it does, and why it exists.</p><div class="dg-legend">' + legend + "</div></div>" +
      "</div>";
  }

  /* ---------- page ---------- */
  var tags = p.themes.concat(["2026", "Badho"]).join(" · ");
  var html =
    '<article class="wp">' +
      '<a class="back" href="index.html#work"><span aria-hidden="true">←</span> Work</a>' +
      '<p class="wp-tags">' + esc(tags) + "</p>" +
      '<span class="wp-num" aria-hidden="true">' + num + "</span>" +
      '<h1 class="wp-title">' + esc(p.title) + "</h1>" +
      '<p class="wp-lede">' + esc(p.lede) + "</p>" +
      '<div class="pills">' + p.stack.map(function (s) { return '<span class="pill">' + esc(s) + "</span>"; }).join("") + "</div>" +
      '<div class="wp-stats">' + p.stats.map(function (s) { return '<div class="wp-stat"><div class="v">' + s.v + '</div><div class="l">' + esc(s.l) + "</div></div>"; }).join("") + "</div>" +
    "</article>" +

    '<section class="sec s2" aria-labelledby="h-context"><div class="sec-head"><h2 class="sec-title" id="h-context">Context</h2></div>' +
      '<div class="prose" data-reveal>' + p.context.map(function (c) { return "<p>" + c + "</p>"; }).join("") + "</div></section>" +

    '<section class="sec s2" aria-labelledby="h-flow"><div class="sec-head"><h2 class="sec-title" id="h-flow">Architecture</h2></div>' +
      diagramHTML(p.diagram) + "</section>" +

    '<section class="sec s2" aria-labelledby="h-build"><div class="sec-head"><h2 class="sec-title" id="h-build">The build</h2></div>' +
      '<div class="bgrid">' + p.build.map(function (b, k) {
        return '<div class="bcard" data-reveal><span class="n">' + pad(k + 1) + "</span><h3>" + esc(b.t) + "</h3><p>" + b.d + "</p></div>";
      }).join("") + "</div></section>" +

    '<section class="sec s2" aria-labelledby="h-num"><div class="sec-head"><div><h2 class="sec-title" id="h-num">Numbers, honestly</h2><p class="sec-sub">Each figure says where it came from. Business figures stay inside the company.</p></div></div>' +
      '<div class="ngrid">' + p.numbers.map(function (n) {
        return '<div class="ncard" data-reveal><div class="v">' + n.v + '</div><div class="l">' + esc(n.l) + '</div><div class="h">' + esc(n.h) + "</div></div>";
      }).join("") + "</div>" +
      '<p class="nnote" data-reveal><b>What these numbers mean</b>' + esc(p.note) + "</p></section>" +

    '<section class="sec s2" aria-labelledby="h-lessons"><div class="sec-head"><h2 class="sec-title" id="h-lessons">Lessons I keep</h2></div>' +
      '<div class="lgrid">' + p.lessons.map(function (l) { return '<blockquote class="lcard" data-reveal>“' + esc(l) + "”</blockquote>"; }).join("") + "</div></section>" +

    '<nav class="pn" aria-label="More projects">' +
      '<a href="' + href(prev) + '"><span class="k"><span aria-hidden="true">←</span> Previous</span><div class="t">' + esc(prev.title) + "</div></a>" +
      '<a class="next" href="' + href(next) + '"><span class="k">Next <span aria-hidden="true">→</span></span><div class="t">' + esc(next.title) + "</div></a>" +
    "</nav>";

  page.innerHTML = html;

  /* ---------- diagram interaction ---------- */
  var dg = document.getElementById("dg"), info = document.getElementById("dg-info");
  if (!dg) return;
  var defaultInfo = info.innerHTML;
  var edges = p.diagram.edges;
  var nodeEls = Array.prototype.slice.call(dg.querySelectorAll(".node"));
  var pathEls = Array.prototype.slice.call(dg.querySelectorAll(".edge"));
  var labelEls = Array.prototype.slice.call(dg.querySelectorAll(".elabel"));
  var pinned = null;

  function light(nid) {
    var node = null;
    p.diagram.nodes.forEach(function (n) { if (n.id === nid) node = n; });
    if (!node) return;
    var near = {}; near[nid] = true;
    pathEls.forEach(function (el) {
      var e = edges[+el.dataset.e], hit = e.f === nid || e.t === nid;
      el.classList.toggle("on", hit);
      el.setAttribute("marker-end", hit ? "url(#ah-on)" : "url(#ah)");
      if (hit) { near[e.f] = true; near[e.t] = true; }
    });
    labelEls.forEach(function (el) { var e = edges[+el.dataset.e]; el.classList.toggle("on", e.f === nid || e.t === nid); });
    nodeEls.forEach(function (el) { el.classList.toggle("on", !!near[el.dataset.id]); });
    dg.classList.add("hovering");
    info.innerHTML = "<b>" + esc(node.t) + ".</b> " + esc(node.d);
  }
  function clear() {
    if (pinned) return light(pinned);
    dg.classList.remove("hovering");
    nodeEls.forEach(function (el) { el.classList.remove("on"); });
    pathEls.forEach(function (el) { el.classList.remove("on"); el.setAttribute("marker-end", "url(#ah)"); });
    labelEls.forEach(function (el) { el.classList.remove("on"); });
    info.innerHTML = defaultInfo;
  }
  nodeEls.forEach(function (el) {
    el.addEventListener("mouseenter", function () { light(el.dataset.id); });
    el.addEventListener("mouseleave", clear);
    el.addEventListener("focus", function () { light(el.dataset.id); });
    el.addEventListener("blur", clear);
    el.addEventListener("click", function () {
      pinned = pinned === el.dataset.id ? null : el.dataset.id;
      if (pinned) light(pinned); else clear();
    });
  });
  document.addEventListener("click", function (ev) {
    if (pinned && !dg.contains(ev.target)) { pinned = null; clear(); }
  });
})();
