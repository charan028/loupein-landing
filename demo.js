/* LOUPEIN hero demo: one scene timeline over the drawn phone.
   Technique studied in SamGu-NRX/house-scanning-landing and re-derived here
   (no source copied): every animatable element gets one paused Web Animation
   spanning the whole timeline; a progress-bar animation is the shared clock.
   Play syncs every animation's startTime to the clock's; pause pins the
   clock's currentTime, then re-seeks the scene to it, so pause/seek/replay
   are exact. A shot never seeks onto a stage boundary (duration - 1),
   because the next screen crossfades in exactly there.
   Without JS the markup ships the final Surface still and inert buttons. */
(function () {
  "use strict";
  var root = document.querySelector("[data-demo]");
  if (!root || typeof Element.prototype.animate !== "function") return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

  var stages = [
    { name: "choose", duration: 3000,
      caption: "Stage 1 of 5 — Choose. The day's list; the dentist taps patient DEMO-007." },
    { name: "intent", duration: 4200,
      caption: "Stage 2 of 5 — Intent. Extraction, tooth #30, then Begin record review." },
    { name: "investigate", duration: 5600,
      caption: "Stage 3 of 5 — Investigate. The Guardian Investigator walks the record, tool by tool." },
    { name: "challenge", duration: 3600,
      caption: "Stage 4 of 5 — Challenge. The Skeptic's verdicts: two SURFACE, one VERIFY." },
    { name: "surface", duration: 4600,
      caption: "Stage 5 of 5 — Surface. Three records to review, each carrying its row id." }
  ];
  var TOTAL = 0;
  stages.forEach(function (s) { s.start = TOTAL; TOTAL += s.duration; });
  var byName = {};
  stages.forEach(function (s) { byName[s.name] = s; });
  var at = function (name, ms) { return byName[name].start + ms; };

  /* The hero cut: every stage in one pass, slightly quickened — about 18 s.
     One shot per stage, so a finished single stage can hand back to the cut
     without moving the frame. */
  var CUT = [
    { stage: 0, from: 0, to: 3000, rate: 1.15 },
    { stage: 1, from: 0, to: 4200, rate: 1.2 },
    { stage: 2, from: 0, to: 5600, rate: 1.25 },
    { stage: 3, from: 0, to: 3600, rate: 1.1 },
    { stage: 4, from: 0, to: 4600, rate: 1.1 }
  ];
  var whole = function (i) {
    return [{ stage: i, from: 0, to: stages[i].duration, rate: 1 }];
  };

  var q = function (sel) { return root.querySelector(sel); };
  var qa = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
  var play = q("[data-play]");
  var status = q("[data-demo-status]");
  var idleStatus = status.textContent;
  var buttons = qa("[data-stage-btn]");
  var bars = buttons.map(function (b) { return b.querySelector(".ch-bar"); });

  /* ---------- building the scene ---------- */
  var scene = [];

  // points: [scene ms, keyframe, easing to the next point]. Two points at the
  // same time make an instant change. fill:'both' pins the ends.
  function track(el, points) {
    var frames = [];
    if (points[0][0] > 0) frames.push(Object.assign({}, points[0][1], { offset: 0 }));
    points.forEach(function (p) {
      frames.push(Object.assign({}, p[1], { offset: p[0] / TOTAL, easing: p[2] || "linear" }));
    });
    var last = points[points.length - 1];
    if (last[0] < TOTAL) frames.push(Object.assign({}, last[1], { offset: 1 }));
    var a = el.animate(frames, { duration: TOTAL, fill: "both" });
    a.pause();
    scene.push(a);
  }

  // Visible from `from` to `to` (Infinity = to the end), with optional fades.
  function during(el, from, to, fadeIn, fadeOut) {
    var pts = [[0, { opacity: 0 }]];
    pts.push([from, { opacity: 0 }, EASE], [from + (fadeIn || 0), { opacity: 1 }]);
    if (isFinite(to)) pts.push([to, { opacity: 1 }, EASE], [to + (fadeOut || 0), { opacity: 0 }]);
    track(el, pts);
  }

  // Pop into place: hidden, then scale-settle at `t`.
  function land(el, t, from, dur) {
    track(el, [
      [0, { opacity: 0, transform: from }],
      [t, { opacity: 0, transform: from }, EASE],
      [t + dur, { opacity: 1, transform: "scale(1)" }]
    ]);
  }

  // A button press: quick dip and release around `t`.
  function press(el, t) {
    var rest = { transform: "scale(1)" };
    track(el, [[0, rest], [t, rest, EASE],
      [t + 120, { transform: "scale(0.965)" }, EASE], [t + 300, rest]]);
  }

  // Slide up and fade in at `t`.
  function arrive(el, t, dy, dur) {
    track(el, [
      [0, { opacity: 0, transform: "translate(0px," + dy + "px)" }],
      [t, { opacity: 0, transform: "translate(0px," + dy + "px)" }, EASE],
      [t + dur, { opacity: 1, transform: "translate(0px,0px)" }]
    ]);
  }

  // Type on: a stepped left-to-right clip reveal over the line's own box.
  var CLOSED = "inset(-4% 102% -4% -2%)";
  var OPEN = "inset(-4% -2% -4% -2%)";
  function typeOn(el, t, chars) {
    var dur = Math.max(280, chars * 13);
    track(el, [
      [0, { opacity: 0, clipPath: CLOSED }],
      [t, { opacity: 1, clipPath: CLOSED }, "steps(" + chars + ", end)"],
      [t + dur, { opacity: 1, clipPath: OPEN }]
    ]);
  }

  // The fingertip: lands just before each tap a person makes, presses, lifts.
  // Only stages 1–2 have human taps; automatic steps get no cursor.
  function touches(el, taps) {
    var place = function (x, y, s) {
      return "translate(" + x + "px," + y + "px) scale(" + s + ")";
    };
    var pts = [[0, { opacity: 0, transform: place(taps[0][1], taps[0][2], 1.15) }]];
    taps.forEach(function (tap, i) {
      var t = tap[0], x = tap[1], y = tap[2];
      var next = taps[i + 1] ? taps[i + 1][0] : Infinity;
      pts.push(
        [t - 180, { opacity: 0, transform: place(x, y, 1.15) }, EASE],
        [t - 40, { opacity: 0.9, transform: place(x, y, 1) }, EASE],
        [t + 80, { opacity: 0.9, transform: place(x, y, 0.85) }, EASE],
        [Math.min(t + 380, next - 220), { opacity: 0, transform: place(x, y, 1.1) }]
      );
    });
    track(el, pts);
  }

  function buildScene() {
    var scr = {};
    qa("[data-scr]").forEach(function (el) { scr[el.dataset.scr] = el; });

    // Screens crossfade at each stage boundary; later stages paint on top.
    during(scr.choose, 0, at("intent", 0), 0, 250);
    during(scr.intent, at("intent", 0), at("investigate", 0), 250, 250);
    during(scr.investigate, at("investigate", 0), at("challenge", 0), 250, 250);
    during(scr.challenge, at("challenge", 0), at("surface", 0), 250, 250);
    // The results sheet slides up over the dark screen.
    during(scr.surface, at("surface", 0), Infinity, 300);
    track(scr.surface, [
      [0, { transform: "translate(0px,48px)" }],
      [at("surface", 0), { transform: "translate(0px,48px)" }, EASE],
      [at("surface", 450), { transform: "translate(0px,0px)" }]
    ]);

    // Stage 1 · Choose: the DEMO-007 row highlights, then a person taps it.
    during(q("[data-choose-hl]"), at("choose", 1100), Infinity, 200);
    press(q("[data-choose-row]"), at("choose", 1700));

    // Stage 2 · Intent: the Extraction chip fills, tooth #30 selects, Begin presses.
    var chipTap = at("intent", 900);
    press(q("[data-intent-chip]"), chipTap);
    during(q("[data-chip-fill]"), chipTap, Infinity, 150);
    during(q("[data-chip-on]"), chipTap, Infinity, 150);
    track(q("[data-chip-off]"), [[0, { opacity: 1 }], [chipTap, { opacity: 1 }, EASE],
      [chipTap + 150, { opacity: 0 }]]);
    land(q("[data-tooth-sel]"), at("intent", 2100), "scale(0.4)", 300);
    during(q("[data-tooth-label]"), at("intent", 2250), Infinity, 200);
    press(q("[data-intent-begin]"), at("intent", 3400));

    // Stage 3 · Investigate: the Guardian's real trace lines type on, ~700 ms apart.
    // Wrapped lines type row by row, like a terminal.
    [
      ["1", 400, [34]],
      ["2", 1100, [24]],
      ["3", 1800, [27]],
      ["4", 2500, [25]],
      ["5", 3200, [30, 12]],
      ["6", 3900, [31, 8]]
    ].forEach(function (entry) {
      var rows = qa('[data-tr="' + entry[0] + '"] text');
      var t = at("investigate", entry[1]);
      typeOn(rows[0], t, 8); // agent label
      entry[2].forEach(function (chars, i) {
        t += i === 0 ? 140 : Math.max(280, entry[2][i - 1] * 13);
        typeOn(rows[i + 1], t, chars);
      });
    });

    // Stage 4 · Challenge: three verdicts land; the chips pop. No cursor: automatic.
    [500, 1500, 2500].forEach(function (t, i) {
      var row = q('[data-vd="' + (i + 1) + '"]');
      arrive(row, at("challenge", t), 14, 350);
      land(row.querySelector(".pop"), at("challenge", t + 120), "scale(0.6)", 300);
    });

    // Stage 5 · Surface: three cards stack in, each carrying its record id.
    [700, 1150, 1600].forEach(function (t, i) {
      arrive(q('[data-card="' + (i + 1) + '"]'), at("surface", t), 18, 400);
    });

    // Human taps: list row, Extraction chip, tooth #30 dot, Begin button.
    touches(q("[data-finger]"), [
      [at("choose", 1700), 138, 196],
      [at("intent", 900), 134, 119],
      [at("intent", 2100), 208, 236],
      [at("intent", 3400), 138, 564]
    ]);
  }

  /* ---------- the player ---------- */
  var program = CUT;
  var shot = 0;
  var clock = null;
  var generation = 0;
  var playing = false;
  var finished = false;
  var still = reduced.matches;
  var interacted = false;

  var current = function () { return program[shot]; };
  var shotStart = function (e) { return stages[e.stage].start + e.from; };
  var shotLength = function (e) { return (e.to - e.from) / e.rate; };
  // Never the boundary itself: the next screen swaps in exactly there.
  var shotLast = function (e) {
    return stages[e.stage].start + Math.min(e.to, stages[e.stage].duration - 1);
  };

  function seekScene(t) {
    scene.forEach(function (a) { a.pause(); a.currentTime = t; });
  }

  function sceneTime() {
    var e = current();
    if (still || finished) return shotLast(e);
    return Math.min(shotStart(e) + Number(clock.currentTime) * e.rate, shotLast(e));
  }

  function updateControls() {
    var control = playing ? "pause" : finished ? "replay" : "play";
    play.dataset.control = control;
    var verb = { pause: "Pause", replay: "Replay", play: "Play" }[control];
    play.setAttribute("aria-label", program === CUT
      ? verb + " the demo"
      : verb + " stage: " + stages[current().stage].name);
  }

  // Pause pins the clock (pause() lands next frame, so fix currentTime now),
  // then re-seeks the scene to it: no frame ever runs past the clock.
  function pause() {
    if (clock) {
      clock.pause();
      clock.currentTime = Number(clock.currentTime);
    }
    playing = false;
    if (scene.length) seekScene(sceneTime());
    updateControls();
  }

  function render() {
    generation += 1;
    playing = false;
    if (clock) clock.cancel();
    var e = current();
    var pos = e.stage;
    root.dataset.still = String(still);
    if (interacted && status.textContent !== stages[pos].caption) {
      status.textContent = stages[pos].caption;
    }
    buttons.forEach(function (b, i) {
      b.setAttribute("aria-pressed", String(i === pos));
    });
    var sequence = program === CUT;
    bars.forEach(function (bar, i) {
      bar.style.transform = "scaleX(" + (sequence && i < pos ? 1 : 0) + ")";
    });
    var span = stages[pos].duration;
    var fromX = still ? 1 : e.from / span;
    var toX = still ? 1 : e.to / span;
    clock = bars[pos].animate(
      [{ transform: "scaleX(" + fromX + ")" }, { transform: "scaleX(" + toX + ")" }],
      { duration: still ? 1 : shotLength(e), fill: "both" }
    );
    clock.pause();
    clock.currentTime = 0;
    seekScene(still || finished ? shotLast(e) : shotStart(e));
    var gen = generation;
    clock.finished.then(function () {
      if (gen !== generation || !playing) return;
      if (shot < program.length - 1) {
        shot += 1;
        render();
        start();
      } else {
        finished = true;
        playing = false;
        // A finished single stage hands back to the cut at the same frame,
        // so Watch-all is one Play away again.
        if (program !== CUT) {
          program = CUT;
          shot = pos;
        }
        render();
      }
    }).catch(function (err) {
      if (err.name !== "AbortError") throw err;
    });
    updateControls();
  }

  function start() {
    if (document.hidden || playing || still) return;
    var e = current();
    if (Number(clock.currentTime) >= shotLength(e)) clock.currentTime = 0;
    playing = true;
    finished = false;
    var startTime = document.timeline.currentTime - Number(clock.currentTime);
    clock.play();
    clock.startTime = startTime;
    var sceneStart = startTime - shotStart(e) / e.rate;
    scene.forEach(function (a) {
      a.playbackRate = e.rate;
      a.play();
      a.startTime = sceneStart;
    });
    updateControls();
  }

  // A stage button plays that stage in full; with reduced motion it shows the
  // stage's final still at once instead.
  function select(i) {
    interacted = true;
    pause();
    program = whole(i);
    shot = 0;
    finished = false;
    still = reduced.matches;
    render();
    if (!still) start();
  }

  play.addEventListener("click", function () {
    interacted = true;
    if (playing) { pause(); return; }
    if (reduced.matches) { select(stages.length - 1); return; }
    if (still) {
      program = CUT;
      shot = 0;
      still = false;
      finished = false;
      render();
    } else if (finished) {
      shot = 0;
      finished = false;
      render();
    }
    start();
  });

  buttons.forEach(function (b, i) {
    b.disabled = false;
    b.addEventListener("click", function () { select(i); });
  });
  play.disabled = false;

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && playing) pause();
  });
  var onReduce = function () {
    if (reduced.matches && (playing || !still)) {
      pause();
      still = true;
      finished = false;
      render();
    }
  };
  if (reduced.addEventListener) reduced.addEventListener("change", onReduce);

  buildScene();
  render();
})();
