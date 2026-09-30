/* LOUPEIN presentation site.
   Without JS the page ships its final states: chips and stage buttons stay
   inert (disabled in markup), section 3 renders the Surface lens, and the
   record wall's draw-in masks sit fully open. The hero player is demo.js. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canAnimate = typeof Element.prototype.animate === "function";
  var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

  /* ---------- section 3: stage chips over the record wall ---------- */
  var figure = document.getElementById("stage-figure");
  var caption = document.querySelector("[data-caption]");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  var CAPTIONS = {
    intent: "The dentist states intent. Nothing has been read yet.",
    investigate: "Ten hops, chosen by the Guardian, ending on a contradiction.",
    challenge: "The Skeptic's verdicts: two SURFACE, one VERIFY. The rest dim.",
    surface: "Three cards survive. Everything else stays quiet."
  };

  /* Wall stage animations. Reduced motion (or no WAAPI) skips them: the CSS
     lens transitions already show each stage's final state instantly. */
  var wallAnims = [];
  function cancelWall() {
    wallAnims.forEach(function (a) { a.cancel(); });
    wallAnims = [];
  }
  function run(el, frames, opts) {
    opts.fill = "both";
    wallAnims.push(el.animate(frames, opts));
  }

  // Draw a dashed line without losing its dashes: the mask copy of the line
  // gets the dashoffset animation; the visible line just appears through it.
  function drawMask(sel, delay, duration) {
    var mask = figure.querySelector(sel);
    var length = mask.getTotalLength();
    mask.style.strokeDasharray = String(length);
    run(mask, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
      { duration: duration, delay: delay, easing: "ease-in-out" });
  }

  function animateWall(stage) {
    cancelWall();
    if (reduce || !canAnimate || !figure) return;
    if (stage === "investigate") {
      // Numbered hops pop in sequence while the path draws under them.
      var hops = figure.querySelectorAll("[data-hops] > *");
      Array.prototype.forEach.call(hops, function (hop, i) {
        run(hop, [
          { opacity: 0, transform: "scale(0.5)" },
          { opacity: 1, transform: "scale(1)" }
        ], { duration: 280, delay: i * 120, easing: EASE });
      });
      drawMask("[data-draw-mask]", 0, 1450);
      // The contradiction tie draws last, then pulses once — two beats, rests solid.
      var extras = figure.querySelector("[data-tie-extras]");
      run(extras, [{ opacity: 0 }, { opacity: 1 }],
        { duration: 300, delay: 1500, easing: EASE });
      drawMask("[data-tie-mask]", 1550, 450);
      var tie = figure.querySelector("[data-tie]");
      run(tie, [
        { opacity: 1 }, { opacity: 0.3 }, { opacity: 1 },
        { opacity: 0.3 }, { opacity: 1 }
      ], { duration: 900, delay: 2050, easing: "ease-in-out" });
    } else if (stage === "challenge") {
      // Dimming settles record by record; verdict tags pop with a scale-settle.
      var dims = figure.querySelectorAll(".ov-dim rect");
      Array.prototype.forEach.call(dims, function (rect, i) {
        run(rect, [{ opacity: 0 }, { opacity: 1 }],
          { duration: 240, delay: i * 80, easing: EASE });
      });
      var tags = figure.querySelectorAll(".ov-tags .tag");
      Array.prototype.forEach.call(tags, function (tag, i) {
        run(tag, [
          { opacity: 0, transform: "scale(0.6)" },
          { opacity: 1, transform: "scale(1.12)", offset: 0.5 },
          { opacity: 1, transform: "scale(1)" }
        ], { duration: 300, delay: 400 + i * 110, easing: EASE });
      });
    }
  }

  function setStage(stage) {
    if (!figure) return;
    figure.dataset.stage = stage;
    if (caption && CAPTIONS[stage]) caption.textContent = CAPTIONS[stage];
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.dataset.stage === stage));
    });
    animateWall(stage);
  }

  chips.forEach(function (chip) {
    chip.disabled = false;
    chip.addEventListener("click", function () {
      setStage(chip.dataset.stage);
    });
  });
  if (figure) setStage("intent");

  /* ---------- entrances: once, on first viewport entry ---------- */
  var revealed = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealed.forEach(function (el) { el.classList.add("seen"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("seen");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealed.forEach(function (el) { io.observe(el); });
  }
})();
