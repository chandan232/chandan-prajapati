(() => {
  'use strict';

  /* ================================================================== *
   * Utilities                                                          *
   * ================================================================== */
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = (n) => String(n).padStart(2, '0');
  const fmt = new Intl.NumberFormat('en-IN');
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
  };
  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const EMAIL = 'chandangah@gmail.com';
  const PHONE = '+919305129200';
  const RESUME = 'resume.html';
  const LINKEDIN = 'https://www.linkedin.com/in/chandan-prajapati-915568166/';

  /* ================================================================== *
   * Toasts + clipboard                                                 *
   * ================================================================== */
  const toaster = $('.toaster');
  function toast(msg) {
    if (!toaster) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
    t.append(msg);
    toaster.appendChild(t);
    while (toaster.children.length > 3) toaster.firstElementChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 220); }, 2200);
  }
  async function copy(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* nothing else to try */ }
      ta.remove();
    }
    toast(msg || 'Copied');
  }
  $$('[data-copy]').forEach((b) => b.addEventListener('click', () => copy(b.dataset.copy, b.dataset.toast)));

  /* ================================================================== *
   * Charts (SVG). All data here is synthetic; the page says so.        *
   * ================================================================== */
  const NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, str, cls = 'v-t', anchor = 'start', i) {
    const n = s('text', { x, y, class: cls, 'text-anchor': anchor }, parent);
    if (i !== undefined) n.style.setProperty('--i', i);
    n.textContent = str;
    return n;
  }
  function frame(label, w = 420, h = 220) {
    return s('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': label });
  }
  function colTop(parent, x, y, w, h, cls, i, r = 4) {
    r = Math.max(0, Math.min(r, h, w / 2));
    const p = s('path', { d: `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`, class: cls }, parent);
    if (i !== undefined) p.style.setProperty('--i', i);
    return p;
  }
  function barRight(parent, x, y, w, h, cls, i, r = 4) {
    r = Math.max(0, Math.min(r, w, h / 2));
    const p = s('path', { d: `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`, class: cls }, parent);
    if (i !== undefined) p.style.setProperty('--i', i);
    return p;
  }
  function hit(parent, x, y, w, h, tip) {
    return s('rect', { x, y, width: w, height: h, class: 'v-hit', 'data-tip': tip }, parent);
  }
  function play(svg) {
    if (!svg || reduceMotion) return;
    svg.classList.remove('play');
    void svg.getBoundingClientRect();
    svg.classList.add('play');
  }

  const VIZ = {
    pnl() {
      const svg = frame('Waterfall: revenue indexed to 100, less discounts 12, delivery 9 and RTO 4, plus penalties 3, gives a net P&L of 78. Synthetic data.');
      const data = [['Revenue', 100, true], ['Discounts', -12], ['Delivery', -9], ['RTO', -4], ['Penalties', 3], ['Net P&L', 78, true]];
      const x0 = 46, x1 = 410, base = 184, top = 40, k = (base - top) / 100, w = 26, slot = (x1 - x0) / data.length;
      [0, 50, 100].forEach((v) => {
        const y = base - v * k;
        s('line', { x1: x0, x2: x1, y1: y, y2: y, class: v ? 'v-grid' : 'v-axis' }, svg);
        txt(svg, x0 - 10, y + 3.5, String(v), 'v-t', 'end');
      });
      txt(svg, x0, 16, '₹ indexed · revenue = 100', 'v-t');
      let level = 0;
      data.forEach(([name, v, total], i) => {
        const cx = x0 + slot * (i + 0.5), x = cx - w / 2, before = level;
        if (i > 0) {
          const y = base - before * k;
          const c = s('line', { x1: cx - slot + w / 2, x2: x, y1: y, y2: y, class: 'v-conn a-fade' }, svg);
          c.style.setProperty('--i', i + 2);
        }
        let yTop;
        if (total) {
          yTop = base - v * k;
          colTop(svg, x, yTop, w, v * k, 'v-acc a-col', i);
          level = v;
          txt(svg, cx, yTop - 7, String(v), 'v-t1 a-fade', 'middle', i);
        } else {
          const to = before + v;
          yTop = base - Math.max(before, to) * k;
          const r = s('rect', { x, y: yTop, width: w, height: Math.abs(v) * k, rx: 2, class: (v < 0 ? 'v-neu' : 'v-acc') + ' a-col', 'fill-opacity': v < 0 ? 1 : 0.55 }, svg);
          r.style.setProperty('--i', i);
          level = to;
          txt(svg, cx, yTop - 7, (v > 0 ? '+' : '−') + Math.abs(v), 'v-t1 a-fade', 'middle', i);
        }
        txt(svg, cx, base + 17, name, 'v-t', 'middle');
        hit(svg, cx - slot / 2, top - 20, slot, base - top + 28, total ? `${name} · ${v}` : `${name} · ${v > 0 ? '+' : '−'}${Math.abs(v)} → running ${level}`);
      });
      return svg;
    },

    cod() {
      const svg = frame('One courier sheet of 96 rows previewed before writing: 70 will update, 16 already set, 4 no match, 3 no date, 3 not delivered. Synthetic data.');
      const kinds = [
        { key: 'will update', n: 70, tip: 'WILL_UPDATE · new settlement date', draw: (g, x, y) => s('circle', { cx: x, cy: y, r: 5, class: 'v-acc' }, g) },
        { key: 'already set', n: 16, tip: 'ALREADY_SET · re-run, no change', draw: (g, x, y) => s('circle', { cx: x, cy: y, r: 5, class: 'v-neu' }, g) },
        { key: 'no match', n: 4, tip: 'NO_MATCH · AWB and order ID not found', draw: (g, x, y) => s('rect', { x: x - 5, y: y - 5, width: 10, height: 10, rx: 2, class: 'v-bad' }, g) },
        { key: 'no date', n: 3, tip: 'NO_DATE · no date on the chosen basis', draw: (g, x, y) => s('rect', { x: x - 4.2, y: y - 4.2, width: 8.4, height: 8.4, rx: 1.5, class: 'v-warn', transform: `rotate(45 ${x} ${y})` }, g) },
        { key: 'not delivered', n: 3, tip: 'NOT_DELIVERED · never forward-delivered', draw: (g, x, y) => s('circle', { cx: x, cy: y, r: 4.2, fill: 'none', stroke: 'var(--text-3)', 'stroke-width': 1.6 }, g) },
      ];
      const cells = [];
      kinds.forEach((kd, i) => { for (let j = 0; j < kd.n; j++) cells.push(i); });
      const r = rng(11);
      for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
      txt(svg, 20, 16, 'courier sheet · 96 rows · preview', 'v-t');
      cells.forEach((ki, idx) => {
        const c = idx % 12, row = Math.floor(idx / 12);
        const x = 28 + c * 20, y = 38 + row * 20;
        const g = s('g', { class: 'a-pop' }, svg);
        g.style.setProperty('--i', c + row * 3);
        kinds[ki].draw(g, x, y);
        hit(g, x - 10, y - 10, 20, 20, `row ${idx + 2} · ${kinds[ki].tip}`);
      });
      s('line', { x1: 272, x2: 272, y1: 30, y2: 184, class: 'v-grid' }, svg);
      kinds.forEach((kd, i) => {
        const y = 48 + i * 28;
        const g = s('g', null, svg);
        kd.draw(g, 292, y - 4);
        txt(svg, 306, y, kd.key, 'v-t2');
        txt(svg, 410, y, String(kd.n), 'v-t1', 'end');
      });
      txt(svg, 20, 208, 'nothing is written until apply · one transaction', 'v-t');
      return svg;
    },

    refund() {
      const svg = frame('Buyers by completed orders and claims. A flag is only possible at 6 or more orders and 3 or more claims; buyers there with a high claim rate are flagged. Synthetic data.');
      const x0 = 44, x1 = 404, y0 = 182, y1 = 36, maxX = 40, maxY = 12;
      const X = (v) => x0 + (v / maxX) * (x1 - x0);
      const Y = (v) => y0 - (v / maxY) * (y0 - y1);
      [0, 4, 8, 12].forEach((v) => {
        s('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), class: v ? 'v-grid' : 'v-axis' }, svg);
        txt(svg, x0 - 10, Y(v) + 3.5, String(v), 'v-t', 'end');
      });
      [0, 10, 20, 30, 40].forEach((v) => txt(svg, X(v), y0 + 16, String(v), 'v-t', 'middle'));
      txt(svg, x0 - 10, 16, 'claims', 'v-t');
      txt(svg, x1, 212, 'completed orders', 'v-t', 'end');
      s('rect', { x: X(6), y: Y(maxY), width: X(maxX) - X(6), height: Y(3) - Y(maxY), class: 'v-acc', 'fill-opacity': 0.07 }, svg);
      s('path', { d: `M${X(6)},${Y(maxY)}V${Y(3)}H${X(maxX)}`, fill: 'none', stroke: 'var(--accent)', 'stroke-opacity': 0.55 }, svg);
      txt(svg, X(6) + 8, Y(maxY) + 14, 'flag possible: ≥ 6 orders & ≥ 3 claims', 'v-t');
      s('circle', { cx: 262, cy: 12, r: 4, class: 'v-acc' }, svg);
      txt(svg, 271, 15.5, 'buyer', 'v-t2');
      s('rect', { x: 318, y: 7.5, width: 9, height: 9, rx: 2, class: 'v-bad' }, svg);
      txt(svg, 333, 15.5, 'flagged', 'v-t2');
      const r = rng(29), pts = [];
      for (let i = 0; i < 62; i++) {
        const orders = Math.min(39, Math.round(Math.pow(r(), 1.5) * 36) + 1);
        const p = 0.02 + r() * 0.08;
        let claims = 0;
        for (let j = 0; j < orders; j++) if (r() < p) claims++;
        pts.push({ orders, claims: Math.min(claims, 11) });
      }
      [[9, 5], [14, 7], [19, 8], [11, 6], [26, 10], [7, 4]].forEach(([o, c]) => pts.push({ orders: o, claims: c }));
      const jr = rng(5);
      pts.forEach((p, i) => {
        const rate = p.claims / p.orders;
        const flagged = p.orders >= 6 && p.claims >= 3 && rate >= 0.3;
        const cx = X(p.orders) + (jr() - 0.5) * 5, cy = Y(p.claims) + (jr() - 0.5) * 5;
        const g = s('g', { class: 'a-pop' }, svg);
        g.style.setProperty('--i', flagged ? 60 + (i % 8) * 4 : i);
        if (flagged) s('rect', { x: cx - 4.5, y: cy - 4.5, width: 9, height: 9, rx: 2, class: 'v-bad v-ring' }, g);
        else s('circle', { cx, cy, r: 4, class: 'v-acc v-ring', 'fill-opacity': 0.85 }, g);
        s('circle', { cx, cy, r: 9, class: 'v-hit', 'data-tip': `${p.orders} orders · ${p.claims} claims · ${Math.round(rate * 100)}% claim rate${flagged ? ' · flagged' : ''}` }, g);
      });
      return svg;
    },

    ledger() {
      const svg = frame('Five funding pools with balances against their minimums; the RTO pool is close to its minimum. Synthetic data.');
      const pools = [['MASTER', 14.6, 3.0], ['COMMISSION', 9.8, 2.0], ['COUPON', 6.2, 1.5], ['DELIVERY', 4.4, 1.2], ['RTO', 0.95, 0.8]];
      const x0 = 112, x1 = 366, max = 16, h = 12;
      const X = (v) => x0 + (v / max) * (x1 - x0);
      txt(svg, 20, 16, 'pool balances · ₹ lakh · tick = minimum', 'v-t');
      pools.forEach(([name, bal, min], i) => {
        const y = 36 + i * 30;
        const near = bal < min * 1.25;
        txt(svg, 20, y + 9.5, name, 'v-t');
        s('rect', { x: x0, y, width: x1 - x0, height: h, rx: 3, class: 'v-neu', 'fill-opacity': 0.5 }, svg);
        barRight(svg, x0, y, X(bal) - x0, h, (near ? 'v-bad' : 'v-acc') + ' a-row', i);
        s('line', { x1: X(min), x2: X(min), y1: y - 3, y2: y + h + 3, stroke: 'var(--text-2)', 'stroke-width': 1.5 }, svg);
        txt(svg, 410, y + 9.5, bal.toFixed(1), 'v-t1', 'end');
        if (near) {
          const gx = x0, gy = y + h + 8;
          s('rect', { x: gx, y: gy, width: 11, height: 11, rx: 2.5, class: 'v-warn' }, svg);
          const bang = txt(svg, gx + 5.5, gy + 9, '!', 'v-t', 'middle');
          bang.setAttribute('style', 'fill:#231800;font-weight:700');
          txt(svg, gx + 17, gy + 9, 'near minimum: blinks red on the dashboard', 'v-t');
        }
        hit(svg, 16, y - 8, 398, h + 16, `${name} · ₹${bal}L · minimum ₹${min}L`);
      });
      txt(svg, 20, 208, 'MASTER → COUPON ₹2.0L · debit + credit in one transaction', 'v-t');
      return svg;
    },

    tat() {
      const svg = frame('Share of orders by delivery speed band: 0–3 days 38%, 4–5 days 27%, 6–7 days 16%, 8–10 days 11%, 11–15 days 5%, 15+ days 3%. p50 falls in 4–5 days, p90 in 8–10 days. Synthetic data.');
      const bands = [['0–3', 38], ['4–5', 27], ['6–7', 16], ['8–10', 11], ['11–15', 5], ['15+', 3]];
      const marks = { 1: 'p50 · 4.2 d', 3: 'p90 · 9.1 d', 5: 'p100 · 21 d' };
      const x0 = 44, x1 = 404, base = 158, top = 40, max = 40, w = 26, slot = (x1 - x0) / bands.length;
      const Y = (v) => base - (v / max) * (base - top);
      [0, 20, 40].forEach((v) => {
        s('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), class: v ? 'v-grid' : 'v-axis' }, svg);
        txt(svg, x0 - 10, Y(v) + 3.5, v + '%', 'v-t', 'end');
      });
      txt(svg, x0 - 10, 16, 'share of orders by delivery speed band (days)', 'v-t');
      bands.forEach(([b, v], i) => {
        const cx = x0 + slot * (i + 0.5);
        colTop(svg, cx - w / 2, Y(v), w, base - Y(v), 'v-acc a-col', i);
        txt(svg, cx, Y(v) - 7, v + '%', 'v-t1 a-fade', 'middle', i);
        txt(svg, cx, base + 16, b, 'v-t', 'middle');
        if (marks[i]) {
          const tri = s('path', { d: `M${cx},${base + 25}L${cx - 5},${base + 33}L${cx + 5},${base + 33}Z`, class: 'v-acc a-fade' }, svg);
          tri.style.setProperty('--i', i + 4);
          txt(svg, cx, base + 48, marks[i], 'v-t2 a-fade', 'middle', i + 4);
        }
        hit(svg, cx - slot / 2, top - 20, slot, 210 - top, `${b} days · ${v}% of orders${marks[i] ? ' · ' + marks[i] : ''}`);
      });
      return svg;
    },

    funnel() {
      const svg = frame('Seven-stage campaign funnel as a share of installs: App Installed 100%, OTP Verified 78%, View Content 64%, Brand View 49%, Add to Cart 31%, Purchased 17%, Delivered 14%. Synthetic data.');
      const st = [['App Installed', 100], ['OTP Verified', 78], ['View Content', 64], ['Brand View', 49], ['Add to Cart', 31], ['Purchased', 17], ['Delivered', 14]];
      const x0 = 118, x1 = 370, h = 14, gap = 10;
      txt(svg, 20, 16, 'one campaign · share of its installs', 'v-t');
      st.forEach(([n, v], i) => {
        const y = 32 + i * (h + gap);
        const w = ((x1 - x0) * v) / 100;
        txt(svg, x0 - 10, y + 10.5, n, 'v-t2', 'end');
        barRight(svg, x0, y, w, h, 'v-acc a-row', i);
        txt(svg, x0 + w + 8, y + 10.5, v + '%', 'v-t1 a-fade', 'start', i);
        hit(svg, 16, y - gap / 2, 398, h + gap, `${n} · ${v}% of installs`);
      });
      return svg;
    },

    cohort() {
      const svg = frame('Retention after reward by monthly cohort, April to August: roughly two-thirds still ordering one month later, falling to about 40% by month five. Synthetic data.');
      const rows = [['Apr', [68, 57, 49, 44, 41]], ['May', [71, 60, 52, 46]], ['Jun', [66, 55, 48]], ['Jul', [73, 62]], ['Aug', [70]]];
      const cw = 52, ch = 26, gp = 2, x0 = 92, y0 = 44, lo = 35, hi = 75;
      txt(svg, 20, 16, '% of rewarded buyers still ordering', 'v-t');
      for (let c = 0; c < 5; c++) txt(svg, x0 + c * (cw + gp) + cw / 2, y0 - 10, `M+${c + 1}`, 'v-t', 'middle');
      rows.forEach(([m, vals], ri) => {
        const y = y0 + ri * (ch + gp);
        txt(svg, x0 - 12, y + ch / 2 + 3.5, `${m} cohort`, 'v-t', 'end');
        vals.forEach((v, c) => {
          const x = x0 + c * (cw + gp);
          const op = 0.16 + (0.84 * (v - lo)) / (hi - lo);
          const g = s('g', { class: 'a-pop' }, svg);
          g.style.setProperty('--i', (ri + c) * 6);
          s('rect', { x, y, width: cw, height: ch, rx: 4, class: 'v-acc', 'fill-opacity': op.toFixed(2) }, g);
          txt(g, x + cw / 2, y + ch / 2 + 3.5, v + '%', op > 0.6 ? 'v-t1 v-inv' : 'v-t1', 'middle');
          hit(g, x, y, cw, ch, `${m} cohort · M+${c + 1} · ${v}% still ordering`);
        });
      });
      txt(svg, x0, y0 + 5 * (ch + gp) + 18, 'near-miss buyers (within 25% of next tier) get the nudge', 'v-t');
      return svg;
    },
  };
  $$('[data-viz]').forEach((el) => { const fn = VIZ[el.dataset.viz]; if (fn) el.appendChild(fn()); });

  /* Tooltip for [data-tip]; moves into an open dialog so it stays in the top layer. */
  const vizTip = document.createElement('div');
  vizTip.className = 'viz-tip';
  vizTip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(vizTip);
  function placeTip(e) {
    const pad = 14, r = vizTip.getBoundingClientRect();
    let x = e.clientX + pad, y = e.clientY + pad;
    if (x + r.width > window.innerWidth - 8) x = e.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = e.clientY - r.height - pad;
    vizTip.style.transform = `translate(${x}px, ${y}px)`;
  }
  document.addEventListener('pointerover', (e) => {
    const n = e.target.closest && e.target.closest('[data-tip]');
    if (!n) return;
    const host = n.closest('dialog') || document.body;
    if (vizTip.parentNode !== host) host.appendChild(vizTip);
    vizTip.textContent = n.getAttribute('data-tip');
    vizTip.classList.add('on');
    placeTip(e);
  });
  document.addEventListener('pointermove', (e) => { if (vizTip.classList.contains('on')) placeTip(e); });
  document.addEventListener('pointerout', (e) => {
    const n = e.target.closest && e.target.closest('[data-tip]');
    if (n && !(e.relatedTarget && n.contains(e.relatedTarget))) vizTip.classList.remove('on');
  });

  /* ================================================================== *
   * Theme, shortcut labels, nav                                        *
   * ================================================================== */
  const themeBtn = $('.theme-btn');
  function syncTheme() {
    const light = root.dataset.theme === 'light';
    if (themeBtn) themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', light ? '#f7f7f8' : '#08090b');
  }
  function toggleTheme() {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    store.set('theme', root.dataset.theme);
    syncTheme();
  }
  syncTheme();
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  if (!isMac) $$('.kbd-mod').forEach((k) => { k.textContent = 'Ctrl K'; });

  const nav = $('.nav');
  const onScrollNav = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScrollNav();

  const navLinks = $('.nav-links');
  if (navLinks) {
    const hl = $('.nav-hl', navLinks);
    $$('a', navLinks).forEach((a) => a.addEventListener('pointerenter', () => {
      hl.style.setProperty('--x', a.offsetLeft + 'px');
      hl.style.setProperty('--w', a.offsetWidth + 'px');
      navLinks.classList.add('is-hovering');
    }));
    navLinks.addEventListener('pointerleave', () => navLinks.classList.remove('is-hovering'));
    const linkFor = new Map($$('a', navLinks).map((a) => [a.getAttribute('href').slice(1), a]));
    const secIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        linkFor.forEach((a, id) => a.classList.toggle('is-current', id === e.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['approach', 'work', 'platform', 'experience', 'skills', 'contact'].forEach((id) => { const el = document.getElementById(id); if (el) secIO.observe(el); });
  }

  /* Segmented controls with a sliding highlight */
  function syncSeg(seg) {
    const hl = $('.seg-hl', seg);
    const on = $('button[aria-pressed="true"]', seg);
    if (!hl || !on || !seg.offsetParent) return;
    hl.style.setProperty('--x', on.offsetLeft + 'px');
    hl.style.setProperty('--w', on.offsetWidth + 'px');
  }
  function pressSeg(seg, btn) {
    $$('button', seg).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    syncSeg(seg);
  }
  const segs = $$('.seg');
  segs.forEach(syncSeg);
  window.addEventListener('resize', () => segs.forEach(syncSeg));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => segs.forEach(syncSeg));

  /* Cursor spotlight on cards */
  $$('.spot').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', e.clientX - r.left + 'px');
    el.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* ================================================================== *
   * Reveal + count-up                                                  *
   * ================================================================== */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach((el) => revealIO.observe(el));

  function countUp(el) {
    const to = Number(el.dataset.to);
    if (reduceMotion) { el.textContent = fmt.format(to); return; }
    const dur = 1500, t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt.format(Math.round(to * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-to]').forEach((el) => { if (!reduceMotion) el.textContent = '0'; countIO.observe(el); });

  /* ================================================================== *
   * Hero dashboard (illustrative data)                                 *
   * ================================================================== */
  const chartEl = $('.chart');
  if (chartEl) {
    const N = 30;
    const now = new Date(Date.now() + 330 * 60000);
    const dates = Array.from({ length: N }, (_, i) => {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - (N - 1 - i));
      return d;
    });
    const dayLabel = (d) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;

    // Statement lines per basis. Net is derived, so the pane always ties out.
    const BASE_LINES = { paid: 96.4, payout: 68.2, disc: 4.1, deliv: 3.6, rto: 1.9 };
    const BASIS = {
      order: { f: 1, of: 1, shift: 0, label: 'by order date', col: 'ordered_at' },
      delivery: { f: 0.968, of: 0.975, shift: 2, label: 'by delivery date', col: 'delivered_at' },
      invoice: { f: 0.951, of: 0.962, shift: 3, label: 'by invoice date', col: 'invoiced_at' },
    };
    const round1 = (v) => Math.round(v * 10) / 10;
    function linesFor(b) {
      const f = BASIS[b].f, L = {};
      for (const k in BASE_LINES) L[k] = round1(BASE_LINES[k] * f);
      L.net = round1(L.paid - L.payout - L.disc - L.deliv - L.rto);
      return L;
    }
    function rawSeries(seed, base, slope, noise, dip) {
      const r = rng(seed);
      return Array.from({ length: N + 4 }, (_, i) => {
        const dow = dates[Math.max(0, Math.min(N - 1, i - 4))].getUTCDay();
        return base + slope * i + (r() - 0.5) * noise + (dow === 0 ? -dip : 0);
      });
    }
    // Light smoothing so the line reads like a real daily metric, not noise.
    const smooth = (a) => a.map((v, i) => (a[Math.max(0, i - 1)] + v * 2 + a[Math.min(a.length - 1, i + 1)]) / 4);
    const RAW = {
      net: smooth(rawSeries(7, 55, 0.45, 9, 4)),
      orders: smooth(rawSeries(8, 372, 1.9, 36, 26)),
      refund: smooth(rawSeries(9, 2.12, -0.019, 0.4, -0.08)),
      cod: smooth(rawSeries(10, 98.15, 0.028, 0.55, 0.18)),
    };
    const scaleTo = (arr, total) => { const sum = arr.reduce((a, b) => a + b, 0); return arr.map((v) => (v * total) / sum); };
    const meanTo = (arr, mean) => { const m = arr.reduce((a, b) => a + b, 0) / arr.length; return arr.map((v) => v - m + mean); };
    function seriesFor(b) {
      const sh = BASIS[b].shift;
      const take = (a) => a.slice(4 - sh, 4 - sh + N);
      const L = linesFor(b);
      return {
        net: scaleTo(take(RAW.net), L.net * 100),
        orders: scaleTo(take(RAW.orders), Math.round(12480 * BASIS[b].of)),
        refund: meanTo(take(RAW.refund), b === 'order' ? 1.8 : b === 'delivery' ? 1.84 : 1.86),
        cod: meanTo(take(RAW.cod), b === 'order' ? 98.6 : b === 'delivery' ? 98.5 : 98.4).map((v) => Math.min(v, 99.9)),
      };
    }
    const FORMAT = {
      net: { tick: (v) => '₹' + v + 'K', tip: (v) => '₹' + v.toFixed(1) + 'K', name: 'Net settlement' },
      orders: { tick: (v) => fmt.format(v), tip: (v) => fmt.format(Math.round(v)) + ' orders', name: 'Orders' },
      refund: { tick: (v) => v.toFixed(1) + '%', tip: (v) => v.toFixed(2) + '%', name: 'Refund rate' },
      cod: { tick: (v) => (Number.isInteger(v) ? v : v.toFixed(1)) + '%', tip: (v) => v.toFixed(1) + '%', name: 'COD settled' },
    };
    const kpiValue = {
      net: (b, S) => '₹' + linesFor(b).net.toFixed(1) + 'L',
      orders: (b, S) => fmt.format(Math.round(S.orders.reduce((a, v) => a + v, 0))),
      refund: (b, S) => (S.refund.reduce((a, v) => a + v, 0) / N).toFixed(1) + '%',
      cod: (b, S) => (S.cod.reduce((a, v) => a + v, 0) / N).toFixed(1) + '%',
    };

    let key = 'net', basis = 'order', S = seriesFor(basis);
    let W = 0, H = 0, svg, gGrid, gX, pArea, pLine, cross, dot, tipEl, curPix = null, targetPix = null, raf = 0, hoverI = -1, domain = null, started = false;
    const M = { l: 48, r: 10, t: 12, b: 26 };
    const xs = () => Array.from({ length: N }, (_, i) => M.l + (i * (W - M.l - M.r)) / (N - 1));

    function niceTicks(min, max, count = 4) {
      const span = max - min || 1;
      let step = Math.pow(10, Math.floor(Math.log10(span / count)));
      const err = span / count / step;
      if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
      const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, ticks = [];
      for (let v = lo; v <= hi + step / 1e6; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
      return { lo, hi, ticks };
    }
    function monotone(X, Y) {
      const n = X.length, dx = [], m = [], t = [];
      for (let i = 0; i < n - 1; i++) { dx[i] = X[i + 1] - X[i]; m[i] = (Y[i + 1] - Y[i]) / dx[i]; }
      t[0] = m[0];
      for (let i = 1; i < n - 1; i++) {
        if (m[i - 1] * m[i] <= 0) t[i] = 0;
        else { const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1]; t[i] = (w1 + w2) / (w1 / m[i - 1] + w2 / m[i]); }
      }
      t[n - 1] = m[n - 2];
      let d = `M${X[0].toFixed(1)},${Y[0].toFixed(1)}`;
      for (let i = 0; i < n - 1; i++) {
        const h = dx[i] / 3;
        d += `C${(X[i] + h).toFixed(1)},${(Y[i] + t[i] * h).toFixed(1)} ${(X[i + 1] - h).toFixed(1)},${(Y[i + 1] - t[i + 1] * h).toFixed(1)} ${X[i + 1].toFixed(1)},${Y[i + 1].toFixed(1)}`;
      }
      return d;
    }
    function build() {
      chartEl.replaceChildren();
      W = chartEl.clientWidth; H = chartEl.clientHeight;
      svg = s('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
      const defs = s('defs', null, svg);
      const lg = s('linearGradient', { id: 'hero-grad', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      s('stop', { offset: '0%', style: 'stop-color:var(--accent);stop-opacity:.28' }, lg);
      s('stop', { offset: '100%', style: 'stop-color:var(--accent);stop-opacity:0' }, lg);
      gGrid = s('g', null, svg);
      pArea = s('path', { fill: 'url(#hero-grad)' }, svg);
      pLine = s('path', { class: 'v-line' }, svg);
      gX = s('g', null, svg);
      cross = s('line', { class: 'v-axis', y1: M.t, y2: H - M.b, opacity: 0 }, svg);
      dot = s('circle', { r: 4.5, class: 'v-acc v-ring', opacity: 0 }, svg);
      chartEl.appendChild(svg);
      tipEl = document.createElement('div');
      tipEl.className = 'chart-tip';
      tipEl.innerHTML = '<div class="d"></div><div class="v"><i></i><span></span></div>';
      chartEl.appendChild(tipEl);
      const X = xs();
      (W < 520 ? [0, 14, N - 1] : [0, 7, 14, 21, N - 1]).forEach((i) => txt(gX, X[i], H - 6, dayLabel(dates[i]), 'v-t', i === 0 ? 'start' : i === N - 1 ? 'end' : 'middle'));
    }
    function drawGrid(animate) {
      const vals = S[key];
      domain = niceTicks(Math.min(...vals), Math.max(...vals));
      gGrid.replaceChildren();
      domain.ticks.forEach((v) => {
        const y = Y(v);
        s('line', { x1: M.l, x2: W - M.r, y1: y, y2: y, class: v === domain.lo ? 'v-axis' : 'v-grid' }, gGrid);
        txt(gGrid, M.l - 8, y + 3.5, FORMAT[key].tick(v), 'v-t', 'end');
      });
      if (animate && !reduceMotion && gGrid.animate) gGrid.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
    }
    const Y = (v) => M.t + (1 - (v - domain.lo) / (domain.hi - domain.lo)) * (H - M.t - M.b);
    function render(pix) {
      const X = xs(), line = monotone(X, pix);
      pLine.setAttribute('d', line);
      pArea.setAttribute('d', `${line}L${X[N - 1].toFixed(1)},${H - M.b}L${X[0].toFixed(1)},${H - M.b}Z`);
    }
    function animateTo(target, dur = 700) {
      targetPix = target;
      cancelAnimationFrame(raf);
      if (reduceMotion || !curPix) { curPix = target.slice(); render(curPix); if (hoverI >= 0) placeHover(hoverI); return; }
      const from = curPix.slice(), t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
        curPix = from.map((y, i) => y + (target[i] - y) * e);
        render(curPix);
        if (hoverI >= 0) placeHover(hoverI);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    function update(animate) {
      drawGrid(animate);
      animateTo(S[key].map(Y));
    }
    function placeHover(i) {
      const X = xs(), x = X[i], y = (curPix || targetPix)[i];
      cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.setAttribute('opacity', 1);
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('opacity', 1);
      $('.d', tipEl).textContent = dayLabel(dates[i]) + (i === N - 1 ? ' · today' : '');
      $('.v span', tipEl).textContent = FORMAT[key].tip(S[key][i]);
      tipEl.classList.add('on');
      const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
      let left = x + 14;
      if (left + tw > W) left = x - tw - 14;
      const top = clamp(y - th - 10, 0, H - th);
      tipEl.style.transform = `translate(${left}px, ${top}px)`;
    }
    function hideHover() {
      hoverI = -1;
      cross.setAttribute('opacity', 0); dot.setAttribute('opacity', 0);
      tipEl.classList.remove('on');
    }
    chartEl.addEventListener('pointermove', (e) => {
      const r = chartEl.getBoundingClientRect();
      const i = clamp(Math.round(((e.clientX - r.left - M.l) / (W - M.l - M.r)) * (N - 1)), 0, N - 1);
      if (i !== hoverI) { hoverI = i; placeHover(i); }
    });
    chartEl.addEventListener('pointerleave', hideHover);
    const live = $('#chart-live');
    chartEl.addEventListener('focus', () => { hoverI = N - 1; placeHover(hoverI); });
    chartEl.addEventListener('blur', hideHover);
    chartEl.addEventListener('keydown', (e) => {
      const keys = { ArrowLeft: -1, ArrowRight: 1, Home: -N, End: N };
      if (!(e.key in keys)) return;
      e.preventDefault();
      hoverI = clamp((hoverI < 0 ? N - 1 : hoverI) + keys[e.key], 0, N - 1);
      placeHover(hoverI);
      if (live) live.textContent = `${FORMAT[key].name}, ${dayLabel(dates[hoverI])}: ${FORMAT[key].tip(S[key][hoverI])}`;
    });

    // KPI tabs with roving focus
    const tabs = $$('.kpi-tab');
    function selectTab(tab, focus) {
      tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
      if (focus) tab.focus();
      key = tab.dataset.series;
      update(true);
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => selectTab(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        selectTab(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
    function paintValues(animate) {
      tabs.forEach((t) => {
        const v = $('.kpi-val', t), next = kpiValue[t.dataset.series](basis, S);
        if (v.textContent !== next) {
          v.textContent = next;
          if (animate && !reduceMotion && v.animate) v.animate([{ opacity: 0, filter: 'blur(4px)', transform: 'translateY(4px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 380, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
        }
      });
      const L = linesFor(basis);
      $$('.stmt-row').forEach((row) => {
        const k = row.dataset.line, b = $('b', row);
        const next = (k === 'paid' || k === 'net' ? '₹' : '−₹') + L[k].toFixed(1) + 'L';
        if (b.textContent !== next) {
          b.textContent = next;
          if (animate && !reduceMotion && b.animate) b.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 400, easing: 'ease-out' });
        }
      });
    }

    // Date basis switch
    const basisSeg = $('.main-tools .seg');
    if (basisSeg) $$('button', basisSeg).forEach((b) => b.addEventListener('click', () => {
      pressSeg(basisSeg, b);
      basis = b.dataset.basis;
      S = seriesFor(basis);
      $$('.basis-label').forEach((el) => { el.textContent = BASIS[basis].label; });
      $$('.basis-col').forEach((el) => { el.textContent = BASIS[basis].col; });
      paintValues(true);
      update(true);
    }));

    build();
    paintValues(false);
    domain = niceTicks(Math.min(...S[key]), Math.max(...S[key]));
    drawGrid(false);
    curPix = Array(N).fill(H - M.b);
    render(curPix);

    const start = () => {
      if (started) return;
      started = true;
      if (reduceMotion) { curPix = S[key].map(Y); render(curPix); } else animateTo(S[key].map(Y), 1300);
    };
    new IntersectionObserver((es, io) => es.forEach((e) => { if (e.isIntersecting) { setTimeout(start, 700); io.disconnect(); } }), { threshold: 0.2 }).observe(chartEl);

    let rt = 0;
    new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (chartEl.clientWidth === W && chartEl.clientHeight === H) return;
        build();
        drawGrid(false);
        curPix = started ? S[key].map(Y) : Array(N).fill(H - M.b);
        render(curPix);
      }, 120);
    }).observe(chartEl);

    // View query popover
    const qBtn = $('.query-btn'), qPop = $('#query-pop');
    if (qBtn && qPop) {
      const setOpen = (open) => { qPop.classList.toggle('is-open', open); qBtn.setAttribute('aria-expanded', String(open)); };
      qBtn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!qPop.classList.contains('is-open')); });
      document.addEventListener('click', (e) => { if (!qPop.contains(e.target)) setOpen(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
      $('.copy-sql', qPop).addEventListener('click', () => copy($('pre', qPop).textContent.trim(), 'SQL copied'));
    }
  }

  /* Reconciliation feed (simulated) with FLIP re-ordering */
  const feed = $('.feed');
  if (feed) {
    const count = $('.feed-count');
    const rnd = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const inr = (n) => '₹' + fmt.format(n);
    const awb = () => 'AWB …' + rnd(10000, 99999);
    const ord = () => 'ORD-' + rnd(48000, 59999);
    const EVENTS = [
      { w: 16, k: 'pnl.drill', ref: () => pick(['Delivery · Sep', 'RTO · Aug', 'Discounts · Sep']), amt: () => inr(rnd(40, 900) * 100), st: 'ok' },
      { w: 18, k: 'cod.remit', ref: awb, amt: () => inr(rnd(400, 9000)), st: 'ok' },
      { w: 8, k: 'cod.already_set', ref: awb, amt: () => inr(rnd(400, 9000)), st: 'ok' },
      { w: 3, k: 'cod.no_match', ref: awb, amt: () => inr(rnd(400, 9000)), st: 'bad' },
      { w: 3, k: 'cod.mismatch', ref: awb, amt: () => '−' + inr(rnd(20, 480)), st: 'warn' },
      { w: 9, k: 'pool.transfer', ref: () => pick(['MASTER→COUPON', 'MASTER→RTO', 'COMMISSION→MASTER']), amt: () => inr(rnd(4, 40) * 5000), st: 'ok' },
      { w: 9, k: 'refund.approve', ref: ord, amt: () => inr(rnd(80, 2400)), st: 'ok' },
      { w: 3, k: 'refund.alert', ref: ord, amt: () => inr(rnd(300, 6000)), st: 'warn' },
      { w: 8, k: 'payout.approve', ref: () => 'PAY-' + rnd(10000, 99999), amt: () => inr(rnd(2000, 60000)), st: 'ok' },
      { w: 2, k: 'claim.flag', ref: () => 'BUYER-' + rnd(1000, 9999), amt: () => '—', st: 'bad' },
    ];
    const LABEL = { ok: 'Ties out', warn: 'Review', bad: 'Held' };
    const total = EVENTS.reduce((a, e) => a + e.w, 0);
    const weighted = () => { let x = Math.random() * total; for (const e of EVENTS) { x -= e.w; if (x <= 0) return e; } return EVENTS[0]; };
    let checked = 1284;
    function row() {
      const e = weighted(), li = document.createElement('li');
      [['k', e.k], ['ref', e.ref()], ['amt', e.amt()]].forEach(([c, v]) => { const sp = document.createElement('span'); sp.className = c; sp.textContent = v; li.appendChild(sp); });
      const st = document.createElement('span');
      st.className = 'status ' + e.st;
      st.innerHTML = '<i aria-hidden="true"></i>';
      st.append(LABEL[e.st]);
      li.appendChild(st);
      return li;
    }
    function push() {
      const before = new Map([...feed.children].map((el) => [el, el.getBoundingClientRect().top]));
      const li = row();
      li.classList.add('is-new');
      feed.prepend(li);
      while (feed.children.length > 7) feed.lastElementChild.remove();
      before.forEach((top, el) => {
        if (!el.isConnected || !el.animate) return;
        const dy = top - el.getBoundingClientRect().top;
        if (dy) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 500, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
      });
      checked += 1;
      if (count) count.textContent = fmt.format(checked);
    }
    for (let i = 0; i < 6; i++) feed.appendChild(row());
    if (!reduceMotion) {
      let timer = 0;
      const on = () => { if (!timer) timer = setInterval(push, 1900); };
      const off = () => { clearInterval(timer); timer = 0; };
      let visible = false;
      new IntersectionObserver((es) => es.forEach((e) => { visible = e.isIntersecting; visible && !document.hidden ? on() : off(); })).observe(feed);
      document.addEventListener('visibilitychange', () => (document.hidden || !visible ? off() : on()));
    }
  }

  /* Product shot tilts flat as it scrolls into view */
  const shotStage = $('.shot-stage'), shot = $('.shot');
  let tiltQueued = false;
  function tilt() {
    tiltQueued = false;
    if (!shot || reduceMotion) return;
    const r = shotStage.getBoundingClientRect(), vh = window.innerHeight;
    const p = clamp(1 - (r.top - vh * 0.12) / (vh * 0.62), 0, 1);
    const amp = window.innerWidth < 900 ? 8 : 14;
    shot.style.setProperty('--tilt', (amp * (1 - p)).toFixed(2) + 'deg');
    shot.style.setProperty('--scale', (0.94 + 0.06 * p).toFixed(3));
  }
  window.addEventListener('scroll', () => {
    onScrollNav();
    if (!tiltQueued) { tiltQueued = true; requestAnimationFrame(tilt); }
  }, { passive: true });
  window.addEventListener('resize', tilt);
  tilt();

  /* ================================================================== *
   * Selected work: chapters + sticky stage                             *
   * ================================================================== */
  const work = $('.work');
  const chapters = $$('.chapter');
  const stageItems = new Map($$('.stage-item').map((el) => [el.dataset.for, el]));
  const stageTitle = $('.stage-title'), stageCount = $('.stage-count'), stageKpi = $('.stage-kpi'), stepsEl = $('.stage-steps');
  let activeCh = null, stageSeen = false;
  const stageWin = $('.stage-win');
  if (stageWin) new IntersectionObserver((es, io) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    stageSeen = true;
    const on = $('.stage-item.is-active svg');
    if (on) play(on);
    io.disconnect();
  }), { threshold: 0.3 }).observe(stageWin);

  chapters.forEach((ch) => {
    const tpl = $('#tpl-' + ch.dataset.id), out = $('.read-time', ch);
    if (tpl && out) out.textContent = Math.max(1, Math.round(tpl.content.textContent.trim().split(/\s+/).length / 200)) + ' min read';
    if (stepsEl) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.for = ch.dataset.id;
      b.setAttribute('aria-label', 'Show ' + $('.ch-title', ch).textContent);
      b.addEventListener('click', () => ch.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }));
      stepsEl.appendChild(b);
    }
  });
  const visibleChapters = () => chapters.filter((c) => !c.hidden);
  function setActive(ch, force) {
    if (!ch || (ch === activeCh && !force)) return;
    activeCh = ch;
    chapters.forEach((c) => c.classList.toggle('is-active', c === ch));
    const vis = visibleChapters(), i = vis.indexOf(ch), id = ch.dataset.id;
    stageItems.forEach((el, key) => {
      const on = key === id;
      const was = el.classList.contains('is-active');
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-hidden', String(!on));
      if (on && !was && stageSeen) play($('svg', el));
    });
    if (stageTitle) stageTitle.textContent = $('.ch-title', ch).textContent;
    if (stageCount) stageCount.textContent = `${pad2(i + 1)} / ${pad2(vis.length)}`;
    if (stageKpi) {
      stageKpi.replaceChildren();
      const b = document.createElement('b');
      b.textContent = ch.dataset.kpi;
      stageKpi.append(b, ch.dataset.kpiLabel);
    }
    if (stepsEl) $$('button', stepsEl).forEach((b) => {
      const c = chapters.find((x) => x.dataset.id === b.dataset.for);
      b.hidden = c.hidden;
      const vi = vis.indexOf(c);
      b.classList.toggle('is-active', c === ch);
      b.classList.toggle('is-past', vi > -1 && vi < i);
    });
  }
  const chIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting && !e.target.hidden) setActive(e.target); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  chapters.forEach((ch) => chIO.observe(ch));
  if (chapters[0]) setActive(chapters[0], true);

  // Inline charts (cards view and mobile) animate when they scroll in
  const inlineIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && e.target.offsetParent) { play($('svg', e.target)); inlineIO.unobserve(e.target); }
    });
  }, { threshold: 0.35 });
  $$('.ch-viz').forEach((el) => inlineIO.observe(el));

  const viewSeg = $('.seg-view');
  function setView(mode, save) {
    if (!work || !viewSeg) return;
    work.classList.toggle('is-cards', mode === 'cards');
    pressSeg(viewSeg, $(`button[data-view="${mode}"]`, viewSeg));
    if (save) store.set('workView', mode);
    if (mode === 'cards') $$('.ch-viz').forEach((el) => { inlineIO.unobserve(el); inlineIO.observe(el); });
  }
  if (viewSeg) $$('button', viewSeg).forEach((b) => b.addEventListener('click', () => setView(b.dataset.view, true)));
  if (store.get('workView') === 'cards') setView('cards');

  $$('.filter').forEach((f) => f.addEventListener('click', () => {
    const val = f.dataset.filter;
    $$('.filter').forEach((x) => x.setAttribute('aria-pressed', String(x === f)));
    chapters.forEach((c) => { c.hidden = val !== 'all' && !c.dataset.themes.split(' ').includes(val); });
    visibleChapters().forEach((c, i) => { $('.ch-idx', c).textContent = pad2(i + 1); });
    setActive(visibleChapters()[0], true);
  }));

  /* ================================================================== *
   * Dialogs: case studies + command menu                               *
   * ================================================================== */
  const caseDlg = $('#case'), cmdk = $('#cmdk');
  const canDialog = caseDlg && typeof caseDlg.showModal === 'function';
  let opener = null;
  function openDialog(d) {
    if (!d.open) d.showModal();
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-in')));
  }
  function closeDialog(d) {
    if (!d.open) return;
    d.classList.remove('is-in');
    const sheet = d === caseDlg && window.matchMedia('(max-width: 640px)').matches;
    setTimeout(() => { if (!d.classList.contains('is-in')) d.close(); }, reduceMotion ? 0 : sheet ? 380 : 170);
  }
  [caseDlg, cmdk].forEach((d) => {
    if (!d) return;
    d.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(d); });
    d.addEventListener('click', (e) => { if (e.target === d) closeDialog(d); });
  });

  function openCase(id, from) {
    const ch = chapters.find((c) => c.dataset.id === id), tpl = $('#tpl-' + id);
    if (!ch || !tpl || !canDialog) return;
    if (cmdk && cmdk.open) { cmdk.classList.remove('is-in'); cmdk.close(); }
    $('#case-themes').textContent = ch.dataset.label;
    $('#case-title').textContent = $('.ch-title', ch).textContent;
    const body = $('#case-body');
    body.replaceChildren(tpl.content.cloneNode(true));
    const fig = $('[data-clone]', body);
    let chart = null;
    if (fig && VIZ[fig.dataset.clone]) { chart = VIZ[fig.dataset.clone](); fig.prepend(chart); }
    opener = from || document.activeElement;
    openDialog(caseDlg);
    caseDlg.scrollTop = 0;
    if (chart) setTimeout(() => play(chart), 120);
    history.replaceState(null, '', '#' + id);
  }
  if (caseDlg) {
    $('.case-close', caseDlg).addEventListener('click', () => closeDialog(caseDlg));
    caseDlg.addEventListener('close', () => {
      vizTip.classList.remove('on');
      document.body.appendChild(vizTip);
      history.replaceState(null, '', location.pathname + location.search);
      if (opener && document.contains(opener) && opener.focus) opener.focus({ preventScroll: true });
    });
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-case]');
    if (t) openCase(t.dataset.case, t);
  });

  // Command menu
  if (cmdk && canDialog) {
    const q = $('#cmdk-q'), list = $('#cmdk-list');
    const go = (hash) => { const el = $(hash); if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); };
    const COMMANDS = [
      ...chapters.map((ch) => ({ group: 'Projects', icon: 'i-file', label: $('.ch-title', ch).textContent, hint: ch.dataset.label, kw: ch.dataset.themes, run: () => openCase(ch.dataset.id) })),
      { group: 'Go to', icon: 'i-hash', label: 'How I work', run: () => go('#approach') },
      { group: 'Go to', icon: 'i-hash', label: 'Selected work', run: () => go('#work') },
      { group: 'Go to', icon: 'i-hash', label: 'Platform', run: () => go('#platform') },
      { group: 'Go to', icon: 'i-hash', label: 'Experience', run: () => go('#experience') },
      { group: 'Go to', icon: 'i-hash', label: 'Toolkit and education', kw: 'skills', run: () => go('#skills') },
      { group: 'Go to', icon: 'i-hash', label: 'Contact', run: () => go('#contact') },
      { group: 'Actions', icon: 'i-mail', label: 'Copy email address', hint: EMAIL, run: () => copy(EMAIL, 'Email copied') },
      { group: 'Actions', icon: 'i-phone', label: 'Copy phone number', hint: '+91 93051 29200', run: () => copy(PHONE, 'Number copied') },
      { group: 'Actions', icon: 'i-file', label: 'Open resume', kw: 'cv pdf', run: () => { window.location.href = RESUME; } },
      { group: 'Actions', icon: 'i-in', label: 'Open LinkedIn', run: () => window.open(LINKEDIN, '_blank', 'noopener') },
      { group: 'Actions', icon: 'i-sun', label: 'Toggle light / dark theme', kw: 'mode appearance', run: toggleTheme },
    ];
    let results = [], active = 0;
    function render() {
      const term = q.value.trim().toLowerCase();
      results = COMMANDS.filter((c) => !term || (c.label + ' ' + (c.kw || '') + ' ' + (c.hint || '') + ' ' + c.group).toLowerCase().includes(term));
      active = clamp(active, 0, Math.max(0, results.length - 1));
      list.replaceChildren();
      if (!results.length) {
        const empty = document.createElement('div');
        empty.className = 'cmdk-empty';
        empty.textContent = `No results for "${q.value}"`;
        list.appendChild(empty);
        q.removeAttribute('aria-activedescendant');
        return;
      }
      let group = '';
      results.forEach((c, i) => {
        if (c.group !== group) {
          group = c.group;
          const g = document.createElement('div');
          g.className = 'cmdk-group';
          g.textContent = group;
          g.setAttribute('role', 'presentation');
          list.appendChild(g);
        }
        const b = document.createElement('div');
        b.className = 'cmdk-item';
        b.id = 'cmdk-opt-' + i;
        b.setAttribute('role', 'option');
        b.setAttribute('aria-selected', String(i === active));
        b.innerHTML = `<svg aria-hidden="true"><use href="#${c.icon}"/></svg>`;
        const label = document.createElement('span');
        label.textContent = c.label;
        b.appendChild(label);
        if (c.hint) { const h = document.createElement('span'); h.className = 'hint'; h.textContent = c.hint; b.appendChild(h); }
        b.addEventListener('pointermove', () => { if (active !== i) { active = i; mark(); } });
        b.addEventListener('click', () => runAt(i));
        list.appendChild(b);
      });
      mark();
    }
    function mark() {
      $$('.cmdk-item', list).forEach((el, i) => el.setAttribute('aria-selected', String(i === active)));
      const el = $('#cmdk-opt-' + active);
      if (el) { q.setAttribute('aria-activedescendant', el.id); el.scrollIntoView({ block: 'nearest' }); }
    }
    function runAt(i) {
      const c = results[i];
      if (!c) return;
      cmdk.classList.remove('is-in');
      cmdk.close();
      c.run();
    }
    function openCmdk() {
      q.value = '';
      active = 0;
      render();
      openDialog(cmdk);
      q.focus();
    }
    q.addEventListener('input', () => { active = 0; render(); });
    q.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(1, results.length); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % Math.max(1, results.length); mark(); }
      else if (e.key === 'Enter') { e.preventDefault(); runAt(active); }
    });
    $$('[data-cmdk]').forEach((b) => b.addEventListener('click', openCmdk));
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (cmdk.open) closeDialog(cmdk); else if (!caseDlg.open) openCmdk();
      }
    });
  }

  const deep = location.hash.slice(1);
  if (deep && $('#tpl-' + deep)) openCase(deep);
})();
