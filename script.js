(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme toggle: respects the system setting, remembers the choice */
  var toggle = document.getElementById("theme-toggle");
  function setTheme(t, save) {
    root.setAttribute("data-theme", t);
    var dark = t === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.textContent = dark ? "Light mode" : "Dark mode";
    if (save) { try { localStorage.setItem("theme", t); } catch (e) {} }
  }
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  setTheme(saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), false);
  toggle.addEventListener("click", function () {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });

  /* Skill filter */
  var chips = document.querySelectorAll(".chip");
  var items = document.querySelectorAll(".skill-list li");
  var count = document.getElementById("skill-count");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.dataset.filter, n = 0;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      items.forEach(function (li) {
        var show = f === "all" || li.dataset.cat === f;
        li.hidden = !show;
        if (show) n++;
      });
      count.textContent = "Showing " + n + " skill" + (n === 1 ? "" : "s") + ".";
    });
  });

  /* Project accordions */
  document.querySelectorAll(".acc").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      document.getElementById(btn.getAttribute("aria-controls")).hidden = open;
    });
  });

  /* Sparkles: user-triggered only, disabled when reduced motion is requested */
  var canvas = document.getElementById("sparkles");
  var ctx = canvas.getContext("2d");
  var status = document.getElementById("spark-status");
  var parts = [], running = false;
  function size() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  size(); window.addEventListener("resize", size);
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 1;
      ctx.globalAlpha = Math.max(p.life / 90, 0);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    });
    parts = parts.filter(function (p) { return p.life > 0; });
    if (parts.length) { requestAnimationFrame(frame); } else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  document.getElementById("spark-btn").addEventListener("click", function () {
    if (reduce) { status.textContent = "Sparkles are turned off because your device prefers reduced motion."; return; }
    var colors = ["#c026d3", "#ec4899", "#a855f7", "#f472b6"];
    for (var i = 0; i < 70; i++) {
      parts.push({ x: canvas.width / 2, y: canvas.height / 2, vx: (Math.random() - .5) * 8, vy: -Math.random() * 6,
        r: 2 + Math.random() * 4, life: 60 + Math.random() * 30, c: colors[i % 4] });
    }
    status.textContent = "Sparkles added.";
    if (!running) { running = true; requestAnimationFrame(frame); }
  });

  /* Contact form with accessible validation */
  var form = document.getElementById("contact-form");
  var fstatus = document.getElementById("form-status");
  var rules = {
    name: function (v) { return v.trim() ? "" : "Enter your name."; },
    email: function (v) {
      if (!v.trim()) return "Enter your email address.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter an email in the format name@example.com.";
    },
    msg: function (v) { return v.trim().length >= 10 ? "" : "Write a message of at least 10 characters."; }
  };
  function check(id) {
    var input = document.getElementById(id), err = document.getElementById(id + "-err");
    var m = rules[id](input.value);
    err.textContent = m; err.hidden = !m;
    input.setAttribute("aria-invalid", m ? "true" : "false");
    return !m;
  }
  Object.keys(rules).forEach(function (id) {
    document.getElementById(id).addEventListener("blur", function () { check(id); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = Object.keys(rules).filter(function (id) { return !check(id); });
    if (bad.length) {
      fstatus.textContent = "Your message was not sent. Please fix " + bad.length + " field" + (bad.length > 1 ? "s" : "") + ".";
      document.getElementById(bad[0]).focus();
      return;
    }
    form.reset();
    fstatus.textContent = "Thank you, your message was sent.";
    fstatus.focus();
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
