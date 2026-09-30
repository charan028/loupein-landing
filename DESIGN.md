# LOUPEIN — presentation site design & honesty ledger

One page, three acts in sequence: the story (judges), the presentable centerpiece (demo), the product close (pitch). Static: `index.html` + `style.css` + `story.js`, inline SVG, no framework, no WebGL.

## Direction

Every explanatory visual is **one canonical drawing**: the patient's record as a to-scale timeline wall (2019→2026) holding the demo records as drawn cards — `MED-018 Warfarin (active)`, `ALG-007 penicillin allergy`, `COND-007A atrial fibrillation`, `NOTE-009 medication-change note`, `CONV-007 visit transcript`, `IMG-001 radiograph`, dental events. Defined once (`#record-wall` in `index.html`), shown through three lenses:

1. **At rest** — what the chart holds; the dentist would have to go looking.
2. **Investigated** — the Guardian's tool path drawn over it as numbered hops, ending on the lit `MED-018 ↔ CONV-007` contradiction ("the patient said they stopped it").
3. **Challenged** — candidates dim as the Skeptic dismisses; only evidence-backed cards survive. Silence is drawn as a valid outcome, not an empty state.

## Sections

1. **Hero** — LOUPEIN wordmark (LOUPE + teal IN), tagline *"Before you begin, let the record challenge the plan."* Device frame playing a ~20 s real screen-recording cut of the DEMO-007 run (muted, `playsinline`, poster, chaptered). Synthetic-data notice always visible.
2. **The problem** — record wall at rest. Three sentences, no more.
3. **The investigation** — record wall + staged path overlay. Step chips *Intent → Investigate → Challenge → Surface* swap highlights; keyboard-operable; reduced motion shows each stage's final still.
4. **The challenge** — Jev's typed judgments as a code panel (lines ≤ 38 chars, token contrast ≥ 5.5:1): six Noul checks and `decision: SURFACE`. Sentence: silence is a result.
5. **What the dentist sees** — the full recording; step buttons seek chapters: Live trace / Cards / Evidence / Case chat / Voice.
6. **How it works** — one architecture strip: Next.js → FastAPI → LangGraph → Gemini (investigation + vision) + TypeSafe Jev (decisions) → Supabase. Under it, the honesty notes.
7. **Close** — Agents + Commercializable framing; links: live app · repo · demo video.

## Materials, light and motion

- One light, upper-left. Hard-offset shadows inside the animated record wall (repainted per stage); `feDropShadow`/blur only on static art (rasterizes once).
- Palette continues the app: stone base, teal accent (LOUPEIN brand), amber = record to review, blue = item to verify, violet = uncertain. Display face: a grotesk (self-hosted, OFL); body: Instrument Sans or system fallback.
- Entrances play once, when a section first enters the viewport. `prefers-reduced-motion` renders final states immediately. Interaction moves ≈ 300 ms.
- Mobile-first; wide figures scroll inside their own container; the page never scrolls horizontally.

## Honesty ledger

| Visual | Source | Limit |
| --- | --- | --- |
| Screen recording | The real app (LOUPEIN repo, `main`), a live DEMO-007 run | Synthetic data throughout; the run shown is one real, unscripted agent run |
| Record wall drawing | Hand-drawn SVG; record ids/values from `db/seed.sql` | A drawing, not a screenshot; simplifies field detail |
| Trace steps in copy | An actual persisted `agent_event` trace | One run of several; paths differ run to run (that is the point) |
| Jev panel values | A real TypeSafe response (Noul 0.97, Choice SURFACE) | One call's values, shown as example |
| Architecture strip | The repo's actual stack | No deployment claims beyond what is linked |

Until the recording exists, the device frame shows a poster still and chapters act on stage stills — noted in-page.

## Fixed floors

Keyboard operability for every interactive element; visible focus; reduced-motion parity; text contrast ≥ 4.5:1 (code tokens ≥ 5.5:1); code panels fit 320 px at 11 px without wrapping; no external requests except self-hosted assets.
