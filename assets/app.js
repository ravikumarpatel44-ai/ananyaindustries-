/* ============================================================
   Aanya Industries — interaction layer (clean build)
   Scroll progress · reveal choreography · stat counters ·
   header state · footer wordmark.
   Progressive enhancement; respects reduced-motion.
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(cls) { var n = document.createElement("div"); n.className = cls; return n; }

  /* ---------- scroll progress ---------- */
  var progress = el("progress");
  document.body.appendChild(progress);

  /* ---------- mark home (transparent header over hero) ---------- */
  if (document.querySelector(".hero")) document.body.classList.add("home");

  /* ---------- mobile navigation ---------- */
  (function () {
    var hdr = document.querySelector("header");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector("nav");
    if (!hdr || !toggle || !nav) return;
    function close() {
      hdr.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    function open() {
      hdr.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      hdr.classList.contains("nav-open") ? close() : open();
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    document.addEventListener("click", function (e) {
      if (hdr.classList.contains("nav-open") && !nav.contains(e.target) && !toggle.contains(e.target)) close();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) close(); });
  })();


  /* ---------- scroll progress + header state + reveal ---------- */
  var header = document.querySelector("header");
  var armed = [];
  var ticking = false;
  function revealInView() {
    if (!armed.length) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    armed = armed.filter(function (n) {
      if (n.getBoundingClientRect().top < vh * 0.88) { n.classList.add("is-in"); return false; }
      return true;
    });
  }
  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (header) header.classList.toggle("scrolled", y > 40);
    revealInView();
    ticking = false;
  }
  function requestScroll() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScroll();

  /* ---------- intro choreography (hero / page-hero) ---------- */
  var introTargets = document.querySelectorAll(".hero, .page-hero");
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      introTargets.forEach(function (t) { t.classList.add("is-in"); });
    });
  });

  /* ---------- scroll reveal with per-group stagger ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(
    ".sec-head, .mat-card, .step, .feature, .stat, .value, .member, .split > div, " +
    ".story-img, .form-card, .contact-info, .plant, .cta-inner, .lead, .certs, .bento-cell"
  ));
  if (!reduce) {
    var vhArm = window.innerHeight || document.documentElement.clientHeight;
    // arm ONLY elements below the fold — nothing already on screen is ever hidden
    armed = revealEls.filter(function (n) { return n.getBoundingClientRect().top > vhArm * 0.88; });
    var byParent = new Map();
    armed.forEach(function (n) {
      n.classList.add("reveal-armed");
      var p = n.parentNode;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(n);
    });
    byParent.forEach(function (list) {
      list.forEach(function (n, i) { n.style.transitionDelay = Math.min(i * 80, 400) + "ms"; });
    });
    revealInView();                              // reveal anything already in view
    window.addEventListener("load", revealInView); // re-check after images shift layout
  }
  // reduced-motion: nothing armed → all content visible

  /* ---------- animated stat counters ---------- */
  function animateCount(node) {
    var raw = node.getAttribute("data-final") || node.textContent.trim();
    node.setAttribute("data-final", raw);
    var m = raw.match(/^([\d.,]+)/);
    if (!m) return;
    var numStr = m[1].replace(/,/g, "");
    var target = parseFloat(numStr);
    if (isNaN(target)) return;
    var suffix = raw.slice(m[1].length);
    var decimals = (numStr.split(".")[1] || "").length;
    if (reduce) { node.textContent = raw; return; }
    var dur = 1500, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else node.textContent = raw;
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll(".stat b");
  if (counters.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (n) { cio.observe(n); });
    }
  }

  /* ---------- WhatsApp floating CTA ---------- */
  (function () {
    var WA_NUMBER = "919898802694";  // ← set the business WhatsApp number (country code + number, digits only)
    var WA_MSG = "Hi Aanya Industries, I'd like to enquire about lead scrap.";
    function waIcon(s) {
      return '<svg viewBox="0 0 448 512" width="' + s + '" height="' + s + '" fill="currentColor" aria-hidden="true">' +
        '<path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l119.7-31.4c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-71 18.6L52 358.7l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>';
    }
    var closeSvg = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var link = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(WA_MSG);

    var w = document.createElement("div");
    w.className = "wa-widget";
    w.innerHTML =
      '<div class="wa-panel" role="dialog" aria-label="Chat on WhatsApp">' +
        '<div class="wa-head">' +
          '<span class="wa-avatar">' + waIcon(26) + '</span>' +
          '<div><h4>Start a Conversation</h4><p>Hi! Click below to chat with our team on <b>WhatsApp</b>.</p></div>' +
        '</div>' +
        '<div class="wa-body">' +
          '<p class="wa-note">The team typically replies in a few minutes.</p>' +
          '<a class="wa-contact" href="' + link + '" target="_blank" rel="noopener">' +
            '<span class="wa-ic">' + waIcon(24) + '</span>' +
            '<span class="wa-meta"><b>WhatsApp</b><small>Aanya Industries · Trade desk</small></span>' +
            '<span class="wa-go">' + waIcon(20) + '</span>' +
          '</a>' +
        '</div>' +
      '</div>' +
      '<button class="wa-fab" type="button" aria-label="Chat on WhatsApp" aria-expanded="false">' +
        '<span class="ico-wa">' + waIcon(32) + '</span><span class="ico-close">' + closeSvg + '</span>' +
      '</button>';
    document.body.appendChild(w);

    var fab = w.querySelector(".wa-fab");
    fab.addEventListener("click", function () {
      var open = w.classList.toggle("open");
      fab.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!w.contains(e.target)) w.classList.remove("open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") w.classList.remove("open");
    });
  })();
})();
