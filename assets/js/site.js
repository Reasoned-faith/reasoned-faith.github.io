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

  /* Mobile menu (search lives in assets/js/search.js) */
  $("#mb").onclick = function () { $("#nav").classList.toggle("open"); };
  /* Close the mobile menu when a link inside it is tapped */
  $$("#nav a").forEach(function (a) {
    a.addEventListener("click", function () { $("#nav").classList.remove("open"); });
  });

  /* Share panel on article pages */
  var sb = $("#sharebar");
  if (sb) {
    var url = sb.dataset.url, panel = $("#sharepanel"), openB = $("#sb-open"), nat = $("#sp-native");
    var setOpen = function (o) { panel.hidden = !o; openB.setAttribute("aria-expanded", o ? "true" : "false"); };
    openB.onclick = function (e) { e.stopPropagation(); setOpen(panel.hidden); };
    $("#sp-close").onclick = function () { setOpen(false); };
    d.addEventListener("click", function (e) { if (!panel.hidden && !sb.contains(e.target)) setOpen(false); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    $$("[data-copy]").forEach(function (btn) {
      var lab = btn.querySelector("span"), orig = lab.textContent;
      btn.onclick = function () {
        var done = function () { lab.textContent = "Copied!"; setTimeout(function () { lab.textContent = orig; }, 1800); };
        var fb = function () {
          var t = d.createElement("textarea"); t.value = url; t.style.position = "fixed"; t.style.opacity = "0";
          d.body.appendChild(t); t.select();
          try { d.execCommand("copy"); done(); } catch (e) {}
          d.body.removeChild(t);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, fb); else fb();
      };
    });
    if (nat && navigator.share) {
      nat.hidden = false;
      nat.onclick = function () { navigator.share({ title: d.title, url: url }).catch(function () {}); };
    }
  }

  var grid = $("#articles");
  if (!grid) return;

  /* ---------- Home page ---------- */
  var PER = 5, shown = PER;
  var cards = $$("#articles .card"), more = $("#more"), less = $("#less");
  var sections = ["latest", "vd", "vm"].map(function (id) { return $("#" + id); });
  var catpage = $("#catpage");

  function render() {
    cards.forEach(function (c, i) { c.classList.toggle("hid", i >= shown); });
    more.style.display = shown >= cards.length ? "none" : "";
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
    var relBox = $("#rel-topics"); if (relBox) relBox.style.display = "none";
    if (!link) { render(); return; }

    $("#cp-title").textContent = link.textContent;
    $("#cp-desc").textContent = link.dataset.d || "";
    var inCat = cards.filter(function (c) { return c.dataset.cat === cat; });
    var subs = {};
    inCat.forEach(function (c) { if (c.dataset.sub) subs[c.dataset.sub] = c.dataset.subname; });
    /* Related Topics: the most used tags in this category */
    if (relBox) {
      var tc = {}, tl = $("#rel-list"); tl.innerHTML = "";
      inCat.forEach(function (c) { (c.dataset.tags || "").split(",").forEach(function (t) { t = t.trim(); if (t) tc[t] = (tc[t] || 0) + 1; }); });
      var tk = Object.keys(tc).sort(function (a, b) { return tc[b] - tc[a] || a.localeCompare(b); }).slice(0, 6);
      tk.forEach(function (t) {
        var a = d.createElement("a"); a.className = "topic"; a.href = "#"; a.innerHTML = "<b></b><span></span>";
        a.firstChild.textContent = t; a.lastChild.textContent = tc[t] + " article" + (tc[t] > 1 ? "s" : "");
        a.onclick = function (e) { e.preventDefault(); openSearch(t); };
        tl.appendChild(a);
      });
      relBox.style.display = tk.length ? "" : "none";
    }
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

  function openSearch(v) { if (window.RFSearch) window.RFSearch.open(v); }
  $$("[data-q]").forEach(function (t) {
    t.onclick = function (e) { e.preventDefault(); openSearch(t.dataset.q); };
  });
  $$("[data-home]").forEach(function (a) {
    a.onclick = function (e) {
      e.preventDefault(); shown = PER; window.scrollTo(0, 0);
      if (location.hash) location.hash = ""; else route();
    };
  });
  window.addEventListener("hashchange", route);

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
