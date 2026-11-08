/* Reasoned Faith — theme, search, categories, "more articles". No libraries needed. */
(function () {
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var base = root.getAttribute("data-base") || "/";

  /* Theme toggle (remembered in the browser) */
  $("#theme").onclick = function () {
    var cur = root.getAttribute("data-theme");
    var dark = cur ? cur === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  };

  /* Mobile menu + search toggle */
  $("#mb").onclick = function () { $("#nav").classList.toggle("open"); };
  $("#st").onclick = function () {
    var s = $("#search"); s.classList.toggle("open");
    if (s.classList.contains("open")) $("#q").focus();
  };

  var q = $("#q"), grid = $("#articles");

  /* On article / tag pages the search sends the reader to the home page */
  if (!grid) {
    q.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && q.value.trim()) location.href = base + "?q=" + encodeURIComponent(q.value.trim());
    });
    return;
  }

  /* ---------- Home page ---------- */
  var PER = 5, shown = PER, term = "";
  var cards = $$("#articles .card"), more = $("#more"), less = $("#less");
  var sections = ["latest", "side", "vd", "vm"].map(function (id) { return $("#" + id); });
  var catpage = $("#catpage");

  function render() {
    var idx = 0;
    cards.forEach(function (c) {
      var ok = !term || c.dataset.s.toLowerCase().indexOf(term) > -1;
      c.classList.toggle("hid", !(ok && (term || idx < shown)));
      if (ok) idx++;
    });
    $("#more-row").style.display = term ? "none" : "";
    more.style.display = shown >= idx ? "none" : "";
    less.style.display = shown > PER ? "" : "none";
  }
  more.onclick = function () { shown = Math.min(shown + PER, cards.length); render(); };
  less.onclick = function () { shown = PER; render(); grid.scrollIntoView({ behavior: "smooth", block: "start" }); };

  function chip(box, text, href, on) {
    var a = d.createElement("a");
    a.className = "chip" + (on ? " on" : ""); a.href = href; a.textContent = text;
    box.appendChild(a);
  }

  /* #category and #category/subcategory open a category page */
  function route() {
    var parts = decodeURIComponent(location.hash.slice(1)).split("/");
    var cat = parts[0], sub = parts[1] || "";
    var link = cat ? $('#cats a[data-c="' + cat + '"]') : null;
    $$("#cats a").forEach(function (a) { a.classList.toggle("on", link ? a === link : !a.dataset.c); });
    sections.forEach(function (s) { s.style.display = link ? "none" : ""; });
    catpage.style.display = link ? "" : "none";
    if (!link) { render(); return; }

    $("#cp-title").textContent = link.textContent;
    $("#cp-desc").textContent = link.dataset.d || "";
    var inCat = cards.filter(function (c) { return c.dataset.cat === cat; });
    var subs = {};
    inCat.forEach(function (c) { if (c.dataset.sub) subs[c.dataset.sub] = c.dataset.subname; });
    var chips = $("#cp-subs"); chips.innerHTML = "";
    if (Object.keys(subs).length) {
      chip(chips, "All", "#" + cat, !sub);
      Object.keys(subs).forEach(function (s) { chip(chips, subs[s], "#" + cat + "/" + s, s === sub); });
    }
    var out = $("#cp-grid"); out.innerHTML = "";
    var list = inCat.filter(function (c) { return !sub || c.dataset.sub === sub; });
    list.forEach(function (c) { var x = c.cloneNode(true); x.classList.remove("hid"); out.appendChild(x); });
    if (!list.length) {
      var p = d.createElement("p"); p.className = "cp-empty";
      p.textContent = "No articles in this category yet."; out.appendChild(p);
    }
    window.scrollTo(0, 0);
  }

  function setTerm(v) {
    term = v.toLowerCase().trim(); q.value = v;
    if (location.hash) location.hash = ""; else render();
  }
  q.addEventListener("input", function () { setTerm(q.value); });
  $$("[data-q]").forEach(function (t) {
    t.onclick = function (e) { e.preventDefault(); setTerm(t.dataset.q); window.scrollTo({ top: 0, behavior: "smooth" }); };
  });
  $$("[data-home]").forEach(function (a) {
    a.onclick = function (e) { e.preventDefault(); shown = PER; setTerm(""); window.scrollTo(0, 0); };
  });
  window.addEventListener("hashchange", route);

  var m = location.search.match(/[?&]q=([^&]*)/);
  if (m) { term = decodeURIComponent(m[1].replace(/\+/g, " ")).toLowerCase().trim(); q.value = term; }
  route();

  var VV=(window.VERSES||[]);
  function pickVerse(){var n=new Date(),day=Math.floor((n.getTime()-n.getTimezoneOffset()*60000)/864e5),slot=Math.floor((n.getHours()*60+n.getMinutes())/5);return VV[(slot+day*7)%VV.length]}
  function showVerse(fade){
    if(!VV.length)return;var v=pickVerse();
    document.querySelectorAll(".verse-bar").forEach(function(b){
      var t=b.querySelector(".vb-text"),r=b.querySelector(".vb-ref");
      if(t.textContent===v.text)return;
      var set=function(){t.textContent=v.text;r.textContent=v.ref;t.style.opacity=1;r.style.opacity=1};
      if(fade){t.style.opacity=0;r.style.opacity=0;setTimeout(set,350)}else set();
    });
  }
  showVerse(false);
  (function tick(){var n=new Date(),ms=300000-((n.getMinutes()%5)*60000+n.getSeconds()*1000+n.getMilliseconds());setTimeout(function(){showVerse(true);tick()},ms+50)})();
})();
