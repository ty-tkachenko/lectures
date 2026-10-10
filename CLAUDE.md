# Lectures

Persistent multi-media resource for teaching younger rocket-club members EE and RF fundamentals. Two series, each made of standalone modules — a newcomer can join at any module.

| Series | Path | Owner |
| --- | --- | --- |
| EE | `/ee/` | EE Design |
| RF | `/rf/` | RF & Antenna |

## Hosting

This repo is its own GitHub Pages project site, served at `https://ty-tkachenko.github.io/lectures/`. It is separate from the main site repo `ty-tkachenko/ty-tkachenko.github.io`.

Planned stack: Jekyll (GitHub Pages-native; no extra build tooling or CI), `baseurl: /lectures`. Framework choice is pending Tymur's final confirmation.

## Layout

Module folders are lowercase, hyphenated, and zero-padded: `/ee/<NN-slug>/` and `/rf/<NN-slug>/`.

Shared by both series:

- `/assets/widgets.js` — plain JS interactive calculators, no frameworks
- KaTeX for math
- `_data/glossary.yml` — one shared glossary (terms such as dB and impedance are defined once)

Each module has five layers:

1. **Reading page** — the durable reference
2. **Reveal.js slides** — generated from the same source
3. **Embedded video walkthrough**
4. **Interactive widgets**
5. **Practical** — a real case from Tymur's work (symptom, measurement, root cause, fix) plus a hands-on exercise

## Styling

The main site's stylesheet is `/css/style.css` in the website repo. Copy that file into this repo so lecture pages keep their own stylesheet. When the main site's CSS changes, re-copy it deliberately.

## Rules

- Lowercase URLs and paths only. GitHub Pages is case-sensitive.
- Links must respect the `/lectures` baseurl.
- Work only in this repo. Leave `ty-tkachenko/ty-tkachenko.github.io` unchanged.

## Series boundary

EE stops where a 50-ohm trace exists. Controlled impedance, matching, antennas, link budgets, NF cascades, and radio register maps are RF.

## RF series conventions

Placeholder for RF & Antenna. Fill this section in later.
