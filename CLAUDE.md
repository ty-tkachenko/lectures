# Lectures

Persistent multi-media resource for teaching younger rocket-club members EE and RF fundamentals. Two series of standalone modules. A newcomer can join at any module.

| Series | Path | Owner |
| --- | --- | --- |
| EE | `/ee/` | EE Design |
| RF | `/rf/` | RF & Antenna |

## Hosting

This repo is its own GitHub Pages project site: `https://ty-tkachenko.github.io/lectures/`.

It is separate from the main site repo `ty-tkachenko/ty-tkachenko.github.io`. Work only in this repo.

Stack: Jekyll, the GitHub Pages gem only (no other plugins, no Actions, no CI). `_config.yml` sets `baseurl: /lectures`, `url: https://ty-tkachenko.github.io`, and kramdown.

**Publishing.** Everyone pushes to `main`. That branch is the working copy, so a lesson can land before it is ready to show. The public site is served from the `published` branch. Tymur updates it by merging `main` into `published` when a batch of content is ready. Until that merge, the live site stays on the last published snapshot. Pages should build `published` at the repository root (`/`). Do not point Pages at `main`.

## Preview locally

`Gemfile` pins `github-pages` 232. `Gemfile.lock` is committed, so `bundle install` resolves the same set everywhere. `webrick` is included because Ruby 3 does not ship the server `jekyll serve` uses.

From the repo root:

```
bundle install
bundle exec jekyll serve
```

Open <http://localhost:4000/lectures/>. The `/lectures` prefix is `baseurl`. `http://localhost:4000/` alone will not show the site.

**Windows.** Install [RubyInstaller](https://rubyinstaller.org/) with Devkit (Ruby 3.x, MSYS2 toolchain) so native gems can compile, and install Git for Windows. Then run the two commands above in PowerShell or Command Prompt from the repo. Do not pass `--without development`, or `webrick` will be skipped and `jekyll serve` will fail.

**WSL.** In Ubuntu, `sudo apt install ruby-full build-essential`, then the same `bundle install` and `bundle exec jekyll serve`. Browse from Windows at <http://localhost:4000/lectures/>.

## How a module is taught

Write for a wide range: almost no exposure, then people who want to go further.

1. Plain language first: what it is, and why it matters on a rocket.
2. Then the math. Define every symbol and its unit. Work every formula as a numeric example with the steps, not only the final number.
3. Then a **Go deeper** box for the optional material.

Also:

- Open every module with a **motivating question** (front matter `question:`). The layout prints it under the title, before the prerequisite box. One question, plain language, the reason a rocket-club member would care. The rest of the module answers it.
- Define each term the first time it appears and link it to `/glossary/#<id>`. Add the term to `_data/glossary.yml` if it is missing.
- Then a **What you should already know** box (front matter `prereqs`, with a link to where to learn it).
- End of the lesson: a **Key takeaways** box.
- Figures for anything spatial (SVG, with a `<title>`, a `<desc>`, and a figcaption).
- Check-yourself questions run from basic recall to a design problem. The question stays visible. The answer is behind "Show the answer".

## Layout

Module folders are lowercase, hyphenated, and zero-padded: `/ee/<NN-slug>/` and `/rf/<NN-slug>/`.

Shared:

- `/assets/widgets.js` — plain JS, no frameworks. See the widget API below.
- KaTeX from a CDN. Author math as `$$...$$` (inline or a display block). Kramdown parses that so `_` inside math is not emphasis. GitHub Pages forces the MathJax engine, which emits `\(...\)` and `\[...\]` for KaTeX auto-render. A `\(...\)` written in the Markdown source is an escaped parenthesis, so the backslash is removed; the layout repairs leftover parenthetical TeX in the browser. Prefer `$$`.
- `_data/glossary.yml` — one definition for terms such as dB and impedance.

Each module has five layers:

1. **Reading page** — `index.md`, the durable reference. `layout: module`.
2. **Slides** — `slides.html` (`layout: reveal`) loads raw `slides.md` with Reveal.js from a CDN.
3. **Video** — front matter `video:`. Empty shows "Video coming soon".
4. **Widgets** — a `<div class="widget" data-widget="name">` where the idea needs a knob.
5. **Practical** — a separate video-first page. See below.

## Practicals

A practical is a **video of Tymur** walking through a design or taking a measurement. It is not only a writeup.

- Own page, `layout: practical`, linked from the module.
- Front matter `practical_type`: `design-walkthrough`, `case-study`, or `lab-measurement`.
- `practical_video:` is the recording URL. Until it is set, the page shows a large **Recording coming soon** placeholder.
- Optional `chapters:` list of `time`, `seconds`, and `title`.
- `status: draft` shows **Draft — Tymur to review.**
- Under the video, a written companion that is useful with the sound off: what you will see, the key numbers and formulas, what to look for on the scope or thermal camera, and the takeaways.
- The hands-on student exercise stays a section of the reading page. It is not the practical.

For Tymur, a shot list lives in `ee/<slug>/_recording-outline.md` (or the same name under `rf/`). A leading `_` keeps Jekyll from publishing it. About 8–15 minutes, with rough durations. Do not invent measurements in the outline or on the page.

`design-walkthrough` sections when you have the material: requirements, topology and part selection (with why), key calculations, schematic, layout, bench results, what I'd change. Leave schematic, layout, and bench results as placeholders until they exist. A practical may walk through the Vehicle Camera Unit (VCU, project HORUS/EYE), including a decision id and a coupon test, when that design is the example. The reading module stays general EE. Use only numbers from the source note, and label derived arithmetic as derived. Do not invent measurements.

`case-study` sections: symptom, what was measured, root cause, fix, takeaway.

## Front matter

Module page:

```yaml
title: "Power Conversion: Linear vs Switching"
series: ee          # ee or rf
module: 5           # number
level: intro        # intro, intermediate, ...
question: "Why does a 3.3 V flight computer get hot on a higher pack voltage?"
video:              # optional URL; omit or leave empty for the placeholder
prereqs:
  - text: "Ohm's law (V = IR)"
    url: "https://example.com/ohms-law"   # or a /glossary/#id path
widgets:
  - ldo-dissipation
practicals:
  - title: "Short name"
    practical_type: design-walkthrough
    url: /ee/05-power-conversion/practical-rf-supply.html
```

Practical page: `title`, `series`, `module`, `practical_type`, `practical_video`, `chapters`, `status`, `reading` (link back to the module).

Series index pages list a module only when `ee/<slug>/index.md` or `rf/<slug>/index.md` exists. Deeper files (practicals, widget demos) are not modules. Missing `title`, `module`, or `level` must not break that list. Pages already under `rf/` may not match this schema yet. Do not rewrite their front matter. RF will update it.

## Widgets

Hook:

```html
<div class="widget" data-widget="ldo-dissipation" data-prompt="Raise Vin to 12 V and watch the heat."></div>
```

`LectureWidgets` in `assets/widgets.js`:

| Helper | Use |
| --- | --- |
| `register(name, fn)` / `mountAll(root)` | Add a widget. `fn` receives the `.widget` element. |
| `mountSlider(parent, {label, min, max, step, value, format, onInput})` | Returns `{read}`. |
| `lineChart(host, {xDomain, yDomain, xLabel, series, hLines, vLines, regions, markers, ariaLabel})` | SVG chart. `series[].points` is `[x, y]`. `regions` are hatched x-ranges. Second series is dashed. |
| `stackedBar(host, {segments, caption, ariaLabel})` | `segments` are `{label, value}`. |
| `linearScale(d0, d1, r0, r1)` | Data value to pixel. |
| `polar(cx, cy, radius, angleRad)` | Point on a circle. For a later Smith chart. |
| `svgEl(tag, attrs)` / `el(tag, attrs, text)` | DOM helpers. |
| `calc.ldo`, `calc.junction`, `calc.buckCcm`, `calc.buckDcm`, `calc.ripple`, `calc.buckPower` | The regulator formulas. |
| `sig` / `fixed` / `clamp` | Number formatting. |

Built-in names: `ldo-dissipation`, `buck-converter`, `ldo-vs-buck`. Put a 2–3 sentence "try this" in `data-prompt`.

## Styling

`css/style.css` is a copy of `/css/style.css` from `ty-tkachenko/ty-tkachenko.github.io`. Re-copy it on purpose when that file changes. Lecture-only rules go in `css/lectures.css`. Do not link across sites.

## Rules

- Lowercase URLs and paths only. GitHub Pages is case-sensitive. Case-only renames need a two-step `git mv`.
- Links must respect the `/lectures` baseurl. Use `relative_url`.
- Work only in this repo. Leave `ty-tkachenko/ty-tkachenko.github.io` unchanged.

## Series boundary

EE stops where a 50-ohm trace exists. Controlled impedance, matching, antennas, link budgets, noise-figure cascades, and radio register maps are RF.

## EE series plan

General EE. YJSP is allowed only as an example or a practical (a worked supply, a schematic walkthrough, a layout walkthrough). It is not the theme of the series or of a module. Do not name the series after it, and do not organize a module around the project's architecture.

`/ee/` is a hand-written outline of the twelve modules below. Unpublished rows say "coming soon" and are not links. When a reading page exists, replace that row with a link. The home page still auto-lists whatever `index.md` files exist.

Each row opens with the motivating question in `question:`.

| # | Folder | Title | Opens with |
| --- | --- | --- | --- |
| 01 | `ee/01-circuit-fundamentals/` | Circuit Fundamentals | Why does a circuit draw current, and what does a battery voltage actually promise? |
| 02 | `ee/02-capacitors-inductors/` | Capacitors and Inductors in Circuits | Why does a rail dip when a radio keys up, and what stores the energy that fills the dip? |
| 03 | `ee/03-diodes-transistors/` | Diodes and Transistors | How do you block a backwards battery, or switch a load, without a mechanical relay? |
| 04 | `ee/04-op-amps/` | Op Amps and Analog Building Blocks | How do you turn a tiny sensor voltage into a signal a flight computer can trust? |
| 05 | `ee/05-power-conversion/` | Power Conversion: Linear vs Switching | Why does a 3.3 V flight computer get hot when it runs from a higher pack voltage, and when should the regulator switch instead of throwing the spare volts away as heat? |
| 06 | `ee/06-batteries-power-systems/` | Batteries and Power Systems | How long will the pack last, and what changes as the cells sag from full to empty? |
| 07 | `ee/07-signals-sampling-adcs/` | Signals, Sampling and ADCs | When you sample a sensor, what did the conversion throw away? |
| 08 | `ee/08-digital-logic/` | Digital Logic and Interfaces | How do chips on one board agree on a bit, and what fails when the wires get longer? |
| 09 | `ee/09-real-components/` | Real Components (why parts aren't ideal, datasheets, sourcing) | Why doesn't the part on the board match the ideal symbol? |
| 10 | `ee/10-schematic-to-board/` | From Schematic to Working Board | What has to happen between a finished schematic and a board that powers on? |
| 11 | `ee/11-reading-a-schematic/` | Reading a Real Schematic (guided walkthrough) | Can you read a real schematic and say what each block is doing? |
| 12 | `ee/12-reading-a-layout/` | Reading a Real Layout (guided walkthrough) | Can you look at a real layout and see where the current actually flows? |

Module 05 is the one that is written. Modules 11 and 12 are guided walkthroughs of a real drawing and a real board. If the specimen is a YJSP board, the lesson is still the skill of reading it.

## How to add a module

1. Create `/ee/NN-slug/index.md` (or `/rf/...`) with the module front matter, including `question:`, and `layout: module`. Use the folder name from the EE plan when the module is one of those twelve.
2. Add `slides.html` and a raw `slides.md` beside it.
3. Add glossary terms, figures, and widget divs as the lesson needs them.
4. Add a practical page if there is a recording, plus a `_recording-outline.md` for Tymur.
5. On `/ee/`, change that module's "coming soon" row into a link. Do not link a module that has no reading page. The home page picks up `ee/<slug>/index.md` and `rf/<slug>/index.md` on its own.

## RF series conventions

Placeholder for RF & Antenna. Fill this section in later.
