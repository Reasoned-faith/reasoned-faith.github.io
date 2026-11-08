/* Reasoned Faith — site-wide instant search.
   Click the header icon: it expands into a search bar with results right underneath, on the same page: articles (full text), verses, topics and categories.
   No libraries. The index is /search.json, built by Jekyll from your articles automatically. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var base = root.getAttribute("data-base") || "/", ver = root.getAttribute("data-ver") || "1";
  var btn = d.getElementById("search-open");
  if (!btn) return;

  var DB = null, pending = null, ui = null, lastFocus = null, closeT = 0;
  var st = { q: "", f: "all", act: -1, items: [], toks: [] };
  var LIM = { all: [6, 3, 4], a: [30, 0, 0], v: [0, 12, 0], t: [0, 0, 12] };

  /* ---------- helpers ---------- */
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var ta = d.createElement("textarea");
  function dec(s) { ta.innerHTML = String(s || ""); return ta.value; }
  function tokenize(q) { return norm(q).split(/[^\p{L}\p{N}:]+/u).map(function (t) { return t.replace(/^:+|:+$/g, ""); }).filter(Boolean); }
  function wordStart(s, i) { return i === 0 || /[^\p{L}\p{N}]/u.test(s.charAt(i - 1)); }
  function count(s, t, cap) { var n = 0, p = s.indexOf(t); while (p > -1 && n < cap) { n++; p = s.indexOf(t, p + t.length); } return n; }
  function hl(text, toks) {
    if (!toks.length) return esc(text);
    var re = new RegExp("(" + toks.slice().sort(function (a, b) { return b.length - a.length; }).map(reEsc).join("|") + ")", "gi");
    return text.split(re).map(function (x, i) { return i % 2 ? "<mark>" + esc(x) + "</mark>" : esc(x); }).join("");
  }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  /* ---------- index ---------- */
  function prepare(j) {
    var words = {}, seen = {};
    /* The same article saved in two category folders is listed once in search results. */
    j.a = j.a.filter(function (a) { var k = norm(a.title) + "|" + norm(a.body).slice(0, 120); return seen[k] ? false : (seen[k] = 1); });
    function addWords(s) { norm(s).split(/[^\p{L}\p{N}]+/u).forEach(function (w) { if (w.length > 3) words[w] = 1; }); }
    j.a.forEach(function (a) {
      a.title = dec(a.title); a.excerpt = dec(a.excerpt); a.body = dec(a.body); a.tags = a.tags || [];
      a.nt = norm(a.title); a.ne = norm(a.excerpt); a.nb = norm(a.body); a.lb = a.body.toLowerCase();
      a.ng = norm(a.tags.join(" ")); a.nc = norm(a.cat + " " + a.sub);
      addWords(a.title + " " + a.tags.join(" ") + " " + a.cat + " " + a.sub);
    });
    j.v.forEach(function (v) { v.nt = norm(v.text + " " + v.ref); v.nr = norm(v.ref); });
    j.t.forEach(function (t) { t.nt = norm(t.title + " " + t.desc + " " + t.q); t.nn = norm(t.title); addWords(t.title); });
    j.c.forEach(function (c) { c.nt = norm(c.name + " " + c.desc + " " + c.parent); c.nn = norm(c.name); addWords(c.name); });
    j.wl = Object.keys(words);
    return j;
  }
  function load() {
    if (DB) return Promise.resolve(DB);
    if (pending) return pending;
    pending = fetch(base + "search.json?v=" + ver).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { DB = prepare(j); return DB; })
      .catch(function () { pending = null; return { err: 1 }; });
    return pending;
  }

  /* ---------- matching ---------- */
  function scoreA(a, toks, phrase) {
    var s = 0, i, t, ti, c;
    for (i = 0; i < toks.length; i++) {
      t = toks[i]; ti = a.nt.indexOf(t); c = count(a.nb, t, 12);
      var g = a.ng.indexOf(t) > -1, k = a.nc.indexOf(t) > -1, e = a.ne.indexOf(t) > -1;
      if (ti < 0 && !g && !k && !e && !c) return 0;
      s += (ti > -1 ? (wordStart(a.nt, ti) ? 60 : 35) : 0) + (g ? 30 : 0) + (k ? 20 : 0) + (e ? 15 : 0) + (c ? 4 + Math.min(c, 10) * 2 : 0);
    }
    if (toks.length > 1) s += a.nt.indexOf(phrase) > -1 ? 80 : a.nb.indexOf(phrase) > -1 ? 25 : 0;
    return s;
  }
  function allIn(hay, toks) { return toks.every(function (t) { return hay.indexOf(t) > -1; }); }
  function find(toks) {
    var phrase = toks.join(" "), r = { a: [], v: [], t: [] };
    DB.a.forEach(function (a) { var s = scoreA(a, toks, phrase); if (s) r.a.push({ s: s, a: a }); });
    DB.v.forEach(function (v) { if (allIn(v.nt, toks)) r.v.push({ s: 40 + (v.nr === phrase ? 100 : 0) + (v.nr.indexOf(phrase) === 0 ? 30 : 0), v: v }); });
    DB.c.forEach(function (c) { if (allIn(c.nt, toks)) r.t.push({ s: 30 + (c.nn.indexOf(toks[0]) === 0 ? 30 : 0), c: c }); });
    DB.t.forEach(function (t) { if (allIn(t.nt, toks)) r.t.push({ s: 20 + (t.nn.indexOf(toks[0]) === 0 ? 30 : 0), t: t }); });
    ["a", "v", "t"].forEach(function (k) { r[k].sort(function (x, y) { return y.s - x.s; }); });
    return r;
  }
  function lev(a, b, k) {
    if (Math.abs(a.length - b.length) > k) return k + 1;
    var p = [], i, j; for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) {
      var c = [i], m = i;
      for (j = 1; j <= b.length; j++) { c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1)); if (c[j] < m) m = c[j]; }
      if (m > k) return k + 1; p = c;
    }
    return p[b.length];
  }
  function isSwap(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length - 1; i++) if (a.charAt(i) !== b.charAt(i)) return a.charAt(i) === b.charAt(i + 1) && a.charAt(i + 1) === b.charAt(i) && a.slice(i + 2) === b.slice(i + 2);
    return false;
  }
  function correct(toks) {
    var changed = false;
    var out = toks.map(function (t) {
      if (t.length < 4 || DB.wl.some(function (w) { return w.indexOf(t) === 0; })) return t;
      var k = t.length > 7 ? 2 : 1, best = null, bd = k + 1;
      DB.wl.forEach(function (w) { var dd = isSwap(t, w) ? 1 : lev(t, w, k); if (dd < bd) { bd = dd; best = w; } });
      if (best) { changed = true; return best; }
      return t;
    });
    return changed ? out : null;
  }
  function snips(a, toks, n) {
    var out = [], used = [], i, t, p;
    for (i = 0; i < toks.length && out.length < n; i++) {
      t = toks[i]; p = a.lb.indexOf(t);
      while (p > -1 && used.some(function (u) { return Math.abs(u - p) < 220; })) p = a.lb.indexOf(t, p + t.length);
      if (p < 0) continue;
      used.push(p);
      var s = Math.max(0, p - 80), e = Math.min(a.body.length, p + 170), x;
      if (s > 0) { x = a.body.indexOf(" ", s); if (x > -1 && x < p) s = x + 1; }
      if (e < a.body.length) { x = a.body.lastIndexOf(" ", e); if (x > p) e = x; }
      out.push((s > 0 ? "… " : "") + a.body.slice(s, e).trim() + (e < a.body.length ? " …" : ""));
    }
    return out;
  }

  /* ---------- dropdown (opens under the header icon; the page stays where it is) ---------- */
  function build() {
    var root_ = d.getElementById("rfs-drop");
    ui = { box: d.getElementById("sbox"), root: root_, input: d.getElementById("rfs-q"), clear: d.getElementById("rfs-close"),
      tabs: d.getElementById("rfs-tabs"), list: d.getElementById("rfs-list"), toast: root_.querySelector(".rfs-toast") };
    ui.input.addEventListener("input", function () { st.q = ui.input.value; st.act = -1; render(); });
    ui.input.addEventListener("focus", function () { if (!isOpen()) open(ui.input.value); });
    ui.clear.onclick = function () { if (ui.input.value) setQuery(""); else close(true); };
    ui.tabs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-f]"); if (!b) return;
      st.f = b.dataset.f; st.act = -1; render(); ui.input.focus();
    });
    ui.list.addEventListener("mousemove", function (e) { var it = e.target.closest(".rfs-it"); if (it && +it.dataset.n !== st.act) setActive(+it.dataset.n, false); });
    ui.list.addEventListener("click", function (e) {
      var it = e.target.closest(".rfs-it"); if (!it) return;
      var n = +it.dataset.n, x = st.items[n];
      if (x.type === "link") { close(false); return; } /* normal link navigation continues */
      e.preventDefault(); activate(n, e);
    });
    ui.box.addEventListener("keydown", onKey);
    function outside(e) { if (isOpen() && !ui.box.contains(e.target)) close(false); }
    d.addEventListener("mousedown", outside); d.addEventListener("touchstart", outside, { passive: true });
  }
  function isOpen() { return ui.box.classList.contains("open"); }
  function onKey(e) {
    var k = e.key;
    if (k === "Escape") { e.preventDefault(); close(true); }
    else if (k === "ArrowDown" || k === "ArrowUp") {
      if (!st.items.length) return; e.preventDefault();
      var n = st.act + (k === "ArrowDown" ? 1 : -1);
      setActive(n < 0 ? st.items.length - 1 : n >= st.items.length ? 0 : n, true);
    } else if (k === "Enter" && e.target === ui.input) {
      if (st.act > -1) { e.preventDefault(); activate(st.act, e); }
    }
  }
  function open(q) {
    ui.box.classList.add("open"); btn.setAttribute("aria-expanded", "true"); if (q != null && q !== ui.input.value) ui.input.value = q;
    st.q = ui.input.value; st.f = "all"; st.act = -1;
    render(); ui.input.focus();
    if (!DB) load().then(function () { if (isOpen()) render(); });
  }
  function close(restore) {
    if (!ui || !isOpen()) return;
    ui.box.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); ui.root.hidden = true;
    if (restore) btn.focus();
  }
  function setQuery(v) { st.q = v; st.act = -1; ui.input.value = v; render(); ui.input.focus(); ui.list.scrollTop = 0; }
  function setActive(n, scroll) {
    var nodes = ui.list.querySelectorAll(".rfs-it");
    [].forEach.call(nodes, function (x) { x.setAttribute("aria-selected", +x.dataset.n === n ? "true" : "false"); });
    st.act = n;
    var cur = nodes[n];
    ui.input.setAttribute("aria-activedescendant", cur ? cur.id : "");
    if (cur && scroll) cur.scrollIntoView({ block: "nearest" });
  }
  function activate(n, e) {
    var x = st.items[n]; if (!x) return;
    if (x.type === "topic") setQuery(x.q);
    else if (x.type === "verse") copy(x.text);
    else if (e && (e.metaKey || e.ctrlKey)) window.open(x.href, "_blank");
    else { close(false); location.href = x.href; }
  }
  function copy(text) {
    var done = function () { ui.toast.textContent = "Verse copied"; setTimeout(function () { ui.toast.textContent = ""; }, 1800); };
    var fb = function () {
      var t = d.createElement("textarea"); t.value = text; t.style.cssText = "position:fixed;opacity:0";
      d.body.appendChild(t); t.select(); try { d.execCommand("copy"); done(); } catch (er) {} d.body.removeChild(t);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fb); else fb();
  }

  /* ---------- rendering ---------- */
  function render() {
    var toks = tokenize(st.q), items = [], html = "", note = "", total = [0, 0, 0], r = null;
    /* Nothing is shown until the reader starts typing */
    ui.root.hidden = !toks.length;
    if (!toks.length) { st.items = []; st.toks = []; ui.list.innerHTML = ""; ui.tabs.innerHTML = ""; return; }
    if (!DB || DB.err) {
      ui.tabs.innerHTML = ""; st.items = [];
      ui.list.innerHTML = '<p class="rfs-empty">' + (DB && DB.err ? "Search could not load. Check your connection and try again." : "Loading the library…") + "</p>";
      return;
    }
    function nextN() { return items.length; }
    function rowA(a, sn) {
      var n = nextN(); items.push({ type: "link", href: a.url, a: a });
      return '<a class="rfs-it" role="option" aria-selected="false" id="rfs-o' + n + '" data-n="' + n + '" href="' + esc(a.url) + '"><span class="k">' + esc(a.cat) + (a.sub ? " › " + esc(a.sub) : "") +
        '</span><span class="t">' + hl(a.title, toks) + '</span><span class="s">' + hl(sn || a.excerpt, toks) + "</span></a>";
    }
    function rowV(v) {
      var n = nextN(); items.push({ type: "verse", v: v, text: v.text + " — " + v.ref });
      return '<div class="rfs-it verse" role="option" aria-selected="false" id="rfs-o' + n + '" data-n="' + n + '"><span class="k">Verse · ' + hl(v.ref, toks) +
        '</span><span class="t">' + hl(v.text, toks) + '</span><span class="s">Tap to copy</span></div>';
    }
    function rowT(x) {
      var n = nextN();
      if (x.c) {
        items.push({ type: "link", href: x.c.url, c: x.c });
        return '<a class="rfs-it" role="option" aria-selected="false" id="rfs-o' + n + '" data-n="' + n + '" href="' + esc(x.c.url) + '"><span class="k">' + (x.c.parent ? "Sub-category · " + esc(x.c.parent) : "Category") +
          '</span><span class="t">' + hl(x.c.name, toks) + '</span><span class="s">' + plural(x.c.n, "article") + (x.c.desc ? " · " + hl(x.c.desc, toks) : "") + "</span></a>";
      }
      items.push({ type: "topic", q: x.t.q, t: x.t });
      return '<div class="rfs-it" role="option" aria-selected="false" id="rfs-o' + n + '" data-n="' + n + '"><span class="k">Topic</span><span class="t">' + hl(x.t.title, toks) +
        '</span><span class="s">' + hl(x.t.desc, toks) + "</span></div>";
    }
    function group(label, rows) { return rows.length ? '<div class="rfs-h">' + label + "</div>" + rows.join("") : ""; }

    {
      r = find(toks);
      if (!r.a.length && !r.v.length && !r.t.length) {
        var c = correct(toks);
        if (c) { var r2 = find(c); if (r2.a.length || r2.v.length || r2.t.length) { r = r2; toks = c; note = c.join(" "); } }
      }
      st.toks = toks;
      total = [r.a.length, r.v.length, r.t.length];
      var sum = total[0] + total[1] + total[2], lim = LIM[st.f];
      ui.tabs.innerHTML = [["all", "All", sum], ["a", "Articles", total[0]], ["v", "Verses", total[1]], ["t", "Topics", total[2]]].map(function (t) {
        return '<button type="button" class="rfs-tab" data-f="' + t[0] + '" aria-pressed="' + (st.f === t[0]) + '">' + t[1] + "<b>" + t[2] + "</b></button>";
      }).join("");
      if (note) html += '<p class="rfs-note">No exact matches. Showing results for <b>' + esc(note) + "</b>.</p>";
      html += group("Articles", r.a.slice(0, lim[0]).map(function (x) { return rowA(x.a, snips(x.a, toks, 1)[0]); }));
      html += group("Verses", r.v.slice(0, lim[1]).map(function (x) { return rowV(x.v); }));
      html += group("Topics &amp; categories", r.t.slice(0, lim[2]).map(rowT));
      if (st.f === "all") {
        var more = [];
        if (total[0] > lim[0]) more.push('<button type="button" class="rfs-more" data-f="a">All ' + plural(total[0], "article") + "</button>");
        if (total[1] > lim[1]) more.push('<button type="button" class="rfs-more" data-f="v">All ' + plural(total[1], "verse") + "</button>");
        if (more.length) html += '<div class="rfs-morerow">' + more.join("") + "</div>";
      }
      if (!sum) html = '<div class="rfs-empty"><b>Nothing found for “' + esc(st.q.trim()) + '”.</b><p>Try fewer or simpler words, a different spelling, or a scripture reference such as “John 1:1”.</p></div>';
    }
    st.items = items; ui.list.innerHTML = html;
    [].forEach.call(ui.list.querySelectorAll(".rfs-more"), function (b) { b.onclick = function () { st.f = b.dataset.f; render(); ui.input.focus(); }; });
    if (items.length) setActive(0, false); else { ui.input.removeAttribute("aria-activedescendant"); st.act = -1; }
    ui.list.scrollTop = 0;
  }

  /* ---------- triggers ---------- */
  build();
  btn.addEventListener("click", function () { if (isOpen()) close(true); else open(""); });
  ["pointerenter", "focus", "touchstart"].forEach(function (ev) { btn.addEventListener(ev, load, { passive: true, once: true }); });
  d.addEventListener("keydown", function (e) {
    var t = e.target, typing = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(""); }
    else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); open(""); }
  });
  var m = location.search.match(/[?&]q=([^&]*)/);
  if (m) open(decodeURIComponent(m[1].replace(/\+/g, " ")));
  window.RFSearch = { open: open, close: close };
})();
