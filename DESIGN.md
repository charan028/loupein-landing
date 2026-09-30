# LOUPEIN — presentation site design & honesty ledger

One page, three acts in sequence: the story (judges), the presentable centerpiece (demo), the product close (pitch). Static: `index.html` + `style.css` + `demo.js` + `story.js` + `assets/fonts/`, inline SVG, no framework, no WebGL.

## Direction

Every explanatory visual is **one canonical drawing**: the patient's record as a to-scale timeline wall (2019→2026) holding the demo records as drawn cards — `MED-018 Warfarin (active)`, `ALG-007 penicillin allergy`, `COND-007A atrial fibrillation`, `NOTE-009 medication-change note`, `CONV-007 visit transcript`, `IMG-001 radiograph`, dental events. Defined once (`#record-wall` in `index.html`), shown through three lenses:

1. **At rest** — what the chart holds; the dentist would have to go looking.
2. **Investigated** — the Guardian's tool path drawn over it as numbered hops, ending on the lit `MED-018 ↔ CONV-007` contradiction ("the patient said they stopped it").
3. **Challenged** — candidates dim as the Skeptic dismisses; only evidence-backed cards survive. Silence is drawn as a valid outcome, not an empty state.

## Sections

1. **Hero** — LOUPEIN wordmark (LOUPE + teal IN), tagline *"Before you begin, let the record challenge the plan."* The drawn phone is a **player**: an ~18 s cut across five stages (Choose → Intent → Investigate → Challenge → Surface), with stage buttons that replay one stage in full. Synthetic-data notice always visible.
2. **The problem** — record wall at rest. Three sentences, no more.
3. **The investigation** — record wall + staged path overlay. Step chips *Intent → Investigate → Challenge → Surface* swap highlights; keyboard-operable; reduced motion shows each stage's final still.
4. **The challenge** — Jev's typed judgments as a code panel (lines ≤ 38 chars, token contrast ≥ 5.5:1): six Noul checks and `decision: SURFACE`. Sentence: silence is a result.
5. **What the dentist sees** — the five product surfaces: Live trace / Cards / Evidence / Case chat / Voice; the hero demo plays the first three.
6. **How it works** — one architecture strip: Next.js → FastAPI → LangGraph → Gemini (investigation + vision) + TypeSafe Jev (decisions) → Supabase. Under it, the honesty notes.
7. **Close** — Agents + Commercializable framing; links: live app · repo · demo video.

## Materials, light and motion

- One light, upper-left. Hard-offset shadows inside the animated record wall (repainted per stage); `feDropShadow`/blur only on static art (rasterizes once).
- Palette continues the app: stone base, teal accent (LOUPEIN brand), amber = record to review, blue = item to verify, violet = uncertain. Display face: Familjen Grotesk (self-hosted, OFL); body: Instrument Sans (self-hosted, OFL); system stack as fallback, `font-display: swap`.
- Entrances play once, when a section first enters the viewport. `prefers-reduced-motion` renders final states immediately. Interaction moves ≈ 300 ms. No infinite animations anywhere.
- Mobile-first; wide figures scroll inside their own container; the page never scrolls horizontally.

## The timeline engine (`demo.js`)

The hero phone is one scene timeline, not a video. Mechanics (studied in
SamGu-NRX/house-scanning-landing to learn the technique, then re-derived —
that repo has no license, so **no source was copied**):

- Five stages (Choose 3.0 s, Intent 4.2 s, Investigate 5.6 s, Challenge 3.6 s,
  Surface 4.6 s) laid end to end on a 21 s master timeline. Every animatable
  element in the drawn screens gets one paused WAAPI animation (`fill: both`)
  spanning the whole timeline, keyed by scene time.
- A progress-bar animation inside the active stage button is the shared clock.
  Play sets every scene animation's `startTime` from the clock's, at the shot's
  `playbackRate`; pause pins the clock's `currentTime`, then re-seeks the scene
  to it — pause, seek and replay are exact, never drifting.
- The Play button runs an ~18 s cut (each stage slightly quickened); a stage
  button plays that one stage in full at rate 1, and hands back to the whole-
  demo cut when it ends. A shot never seeks onto a stage boundary
  (`duration − 1`), because the next screen crossfades in exactly there.
- The fingertip cursor appears only for taps a person makes (stages 1–2);
  automatic agent steps get none. Trace lines type on via stepped clip-path
  reveals; the record wall's dashed paths draw through mask copies whose
  `stroke-dashoffset` animates, so the dash pattern survives the draw-in.
- `prefers-reduced-motion`: no playback; Play and the stage buttons show final
  stills instantly. Without JS the markup ships the final Surface still and
  the wall's masks sit fully open — the finished frame, inert controls.

## Honesty ledger

Dev-facing provenance only — this table does not appear on the public page. A
pitch page sells; a disclosure table reads as a confession. The one line that
belongs in front of judges stays in the page footer: *"LOUPEIN is a hackathon
prototype. Synthetic data only. Not a medical device."* Everything below is
for the next person editing this site, and for the repo README/DESIGN docs.

| Visual | Source | Limit |
| --- | --- | --- |
| Hero demo animation | Hand-drawn SVG player; stages and trace lines mirror a real persisted DEMO-007 run | A drawn re-enactment, not a screen recording; timings are authored |
| Timeline engine | Own code (`demo.js`); scene-timeline technique studied in SamGu-NRX/house-scanning-landing | Mechanics re-derived, no source copied (that repo carries no license) |
| Fonts | Familjen Grotesk & Instrument Sans, downloaded from the same repo's `assets/fonts/`, licensed SIL OFL; notices kept beside the files in `assets/fonts/` | Latin subsets only; self-hosted, no runtime fetch |
| Record wall drawing | Hand-drawn SVG; record ids/values from `db/seed.sql` | A drawing, not a screenshot; simplifies field detail |
| Trace steps in copy | An actual persisted `agent_event` trace | One run of several; paths differ run to run (that is the point) |
| Jev panel values | A real TypeSafe response (Noul 0.97, Choice SURFACE) | One call's values, shown as example |
| Architecture strip | The repo's actual stack | No deployment claims beyond what is linked |

## Fixed floors

Keyboard operability for every interactive element; visible focus; reduced-motion parity; text contrast ≥ 4.5:1 (code tokens ≥ 5.5:1); code panels fit 320 px at 11 px without wrapping; no external requests except self-hosted assets.
