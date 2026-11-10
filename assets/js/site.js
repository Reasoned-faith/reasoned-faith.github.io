/* Reasoned Faith — theme, menu, share panel, "more articles", daily verse. No libraries needed. */
(function () {
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var base = root.getAttribute("data-base") || "/";

  /* Theme toggle (remembered in the browser) */
  var themeBtn = $("#theme");
  if (themeBtn) themeBtn.onclick = function () {
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

  /* ---------- Home + category pages: show 6 articles, "More articles" reveals 6 more ---------- */
  var grid = $("#articles");
  var more = $("#more"), less = $("#less");
  if (grid && more && less) {
    var PER = 6, shown = PER;
    var cards = $$("#articles .card");
    var render = function () {
      cards.forEach(function (c, i) { c.classList.toggle("hid", i >= shown); });
      more.style.display = shown >= cards.length ? "none" : "";
      less.style.display = shown > PER ? "" : "none";
    };
    more.onclick = function () { shown = Math.min(shown + PER, cards.length); render(); };
    less.onclick = function () { shown = PER; render(); grid.scrollIntoView({ behavior: "smooth", block: "start" }); };
    render();
  }

  /* ---------- Daily verse (changes every 5 minutes; only on pages that have a verse bar) ---------- */
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
