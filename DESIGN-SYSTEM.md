# Design System

Direction: **"Studio paper."** A calm, editorial, light interface that feels like a well-lit studio — warm paper surfaces, ink-black type, one electric accent. The desk illustration carries the walnut and black of the real setup; the UI stays quiet so the work is the loudest thing on the page. The Selected Work section is the one deliberate dark "screening room" band, for contrast and focus.

## Colour

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F5F3EF` | page background (60%) |
| `--paper-2` | `#ECE9E3` | raised panels, wall in illustration |
| `--card` | `#FFFFFF` | cards, inputs |
| `--ink` | `#111111` | headings, primary text, primary buttons (30%) |
| `--ink-2` | `#3B3A37` | body text |
| `--muted` | `#7A766F` | secondary text, captions |
| `--line` | `#E2DED6` | hairlines, borders |
| `--accent` | `#2F45FF` | links, focus rings, live dots, active states (10%) |
| `--accent-soft` | `#E6E9FF` | accent backgrounds |
| `--walnut` | `#7B4A2D` | illustration + tiny details only |
| `--night` | `#0D0D0F` | Selected Work band |
| `--success` `#1F9D55`, `--danger` `#D93A2B`, `--warn` `#C98A12` |

Rules: one accent per view. No gradients on UI chrome. Elevation = 1px `--line` border first, soft shadow (`0 1px 2px rgb(0 0 0/.04), 0 8px 24px -12px rgb(0 0 0/.12)`) only for floating elements.

## Typography

| Role | Font | Size (desktop / mobile) | Weight | Tracking | Line height |
|---|---|---|---|---|---|
| Display | Geist Sans | clamp(3rem, 8vw, 7.5rem) | 600 | -0.045em | 0.95 |
| Display accent | Instrument Serif *italic* | same as display | 400 | -0.02em | 0.95 |
| H2 (section) | Geist Sans | clamp(2.25rem, 5vw, 4.25rem) | 600 | -0.04em | 1.0 |
| H3 | Geist Sans | 1.5rem | 600 | -0.02em | 1.2 |
| Body L | Geist Sans | 1.125rem | 400 | -0.01em | 1.6 |
| Body | Geist Sans | 1rem | 400 | 0 | 1.6 |
| Eyebrow / meta | Geist Mono | 0.75rem uppercase | 500 | 0.08em | 1.4 |

Max line length 64ch for prose. Never more than two weights on screen besides mono.

## Spacing & layout
- 4/8pt scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.
- Container: `max-w-[1320px]`, gutters 20px (mobile) / 40px (desktop).
- Section padding: 128px desktop / 88px mobile.
- 12-column grid on desktop; single column under 768px.
- Radius: 6 (inputs, chips), 14 (cards), 999 (pills).

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` (expo-out) | entrances |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | transitions between states |
| `--dur-fast` | 180ms | hover, press |
| `--dur-base` | 420ms | UI state |
| `--dur-slow` | 900ms | section reveals |

Patterns:
- **Reveal**: lines of headings rise 110% from a mask with 60ms stagger; paragraphs fade + 24px rise.
- **Scrub**: pinned sections (Projects, Globe) are tied 1:1 to scroll with `scrub: 1` for weight.
- **Hover**: buttons shift label upward (text roll), magnetic pull ≤ 6px.
- Only `transform`, `opacity`, `filter`, `clip-path` animate.
- `prefers-reduced-motion`: disable pin/scrub, parallax, preloader; reveals become 200ms opacity.

## Components
- **Button** — primary (ink bg, paper text), secondary (1px line, ink text), link (accent underline grows). Height 48 (lg) / 40 (md). Verb-first labels ("View work", "Download CV", "Send message").
- **Chip** — mono 12px, 1px line, radius 999.
- **Eyebrow** — mono uppercase with a 6px accent dot.
- **Card** — white, 1px line, 14 radius; hover lifts 2px and border darkens.
- **Inputs** — visible labels always, 48px height, focus ring 2px accent offset 2px; errors under field in danger colour, never blaming copy.
- **Cursor** — 8px ink dot + 36px ring; over interactive desk items the ring grows and shows a mono label ("Turn on", "Open"). Hidden on touch.

## Illustration rules (desk + login)
- Flat 2D landscape, front elevation with a visible desk-top plane; no outlines thicker than 1.5px; shading via 2–3 tonal steps, not gradients, except light effects.
- Palette: desk `#151517`, metal `#1B1B1E`, walnut `#7B4A2D/#8C5634/#5E361F`, oak `#B8875B`, wall `#ECE9E3`, floor `#E3DFD8`.
- Devices are unbranded.
- Light from the lamp: warm white `#FFF6E0` cone + pool, additive feel on dark desk.

## Voice
Confident, plain, specific. "I build full-stack web and mobile products" — not "passionate ninja". Numbers over adjectives.
