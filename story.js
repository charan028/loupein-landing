/* LOUPEIN presentation site.
   Without JS the page ships its final states: chips and chapters stay
   inert (disabled in markup) and section 3 renders the Surface lens. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  function setStage(stage) {
    if (!figure) return;
    figure.dataset.stage = stage;
    if (caption && CAPTIONS[stage]) caption.textContent = CAPTIONS[stage];
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.dataset.stage === stage));
    });
  }

  chips.forEach(function (chip) {
    chip.disabled = false;
    chip.addEventListener("click", function () {
      setStage(chip.dataset.stage);
    });
  });
  if (figure) setStage("intent");

  /* ---------- hero: chapter buttons over the device frame ----------
     Today the chapters swap drawn stills. When the real ~20 s screen
     recording lands, drop a <video muted playsinline poster="..."> inside
     [data-video-slot]; the branch below then seeks chapters instead.
     Chapter start times (seconds) for that future recording: */
  var CHAPTER_TIMES = {
    "still-trace": 0,
    "still-cards": 5,
    "still-evidence": 9,
    "still-chat": 13,
    "still-voice": 17
  };

  var stillUse = document.getElementById("still-use");
  var video = document.querySelector("[data-video-slot] video");
  var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter"));

  function setChapter(button) {
    var id = button.dataset.still;
    if (video) {
      video.currentTime = CHAPTER_TIMES[id] || 0;
      video.play();
    } else if (stillUse) {
      stillUse.setAttribute("href", "#" + id);
    }
    chapters.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b === button));
    });
  }

  chapters.forEach(function (button) {
    button.disabled = false;
    button.addEventListener("click", function () {
      setChapter(button);
    });
  });

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
