# Hardware Engineering Fundamentals

Interactive electronics and RF notes for the avionics team. Each module is one web page with explanations, simulations you can play with, worked examples from our own hardware, a lecture video, a lab video, and design exercises.

- **[EE Fundamentals](EE/)**: circuits through to building and debugging real boards.
- **[RF & High-Speed Design](RF/)**: from transmission lines to the telemetry link.

Open [`index.html`](index.html) to browse.

## Viewing it locally

Everything is plain HTML, CSS and JavaScript with no build step. Opening `index.html` directly works, but a local server is better, because it also makes the "Go deeper" links to the advanced theory pages in `../theory/` resolve. Run this from the folder that contains both `lectures/` and `theory/`:

```bash
py -m http.server 8123
```

Then open <http://localhost:8123/lectures/>.

Math rendering (KaTeX) loads from a CDN. Offline, the pages still work, with the math shown as raw LaTeX. There are no web fonts.

## Layout

```
index.html              landing page (built from assets/course.js)
assets/
  course.js             module list, statuses and video links: edit this to publish a module
  site.css              all styling
  site.js               header, sidebar, videos, exercise answer checks, prev/next links
  plot.js               small canvas toolkit for the interactive figures
EE/NN_Name/index.html   one page per module
RF/NN_Name/index.html
```

## Adding videos

Paste a YouTube link (or a path to an `.mp4` in the repo) into `COURSE.videos` at the bottom of [`assets/course.js`](assets/course.js):

```js
ee01: {lecture: 'https://youtu.be/…', lab: 'https://youtu.be/…'},
```

Until a link is set, each video slot shows the planned outline written in the page, which also works as a recording plan. Timestamps in the outline (`<li data-t="6:00">`) become clickable chapters once the video exists. The small ▶ links beside section headings (`<a class="vjump" data-t="6:00">`) jump the lecture video to that point.

## Writing a module

Copy an existing module folder (EE 1 is the reference) and keep the same structure:

1. Set `data-module="ee02"` on `<html>` to match the id in `course.js`, and set that entry's `status` to `'ready'`.
2. The **hero** has the title, a short lede, a "What's covered" list, `<div class="resources" data-auto>` (filled in automatically), and the lecture video slot.
3. Each **section** is `<section class="sec" id="…" data-short="Sidebar label"><h2>…</h2>`. The sidebar and section numbers are generated. Use `data-nonum` for end matter (exercises, bench, summary).
4. Building blocks:
   - Math: `\( inline \)` and `$$ display $$` (KaTeX). Wrap display equations in `<div class="eq">`.
   - Interactive figure: `<div class="widget wide"><div class="wh"><span class="tag">Interactive</span><b>Title</b></div><div class="wb wcols">controls | canvas</div><div class="try">…</div></div>`, drawn with `Plot.widget` (static) or `Plot.animate` (animated) from `plot.js`.
   - Worked example: `<div class="example"><span class="xk">Worked example</span>…</div>`
   - Notes: `<div class="note rocket|myth|rule|tip|warn"><span class="ni">…</span><div><span class="nt">Title</span>…</div></div>`
5. **Design exercises** are problems with checked answers. Short ones sit inside a section, collapsed by default:

   ```html
   <details class="exercise">
     <summary><span class="ek">Design exercise</span><span class="et">Title</span></summary>
     <div class="eb"><p>Scenario…</p> <div class="check" …>…</div></div>
   </details>
   ```

   Bigger multi-step ones go at the end of the page in `<div class="chal">`. Each numeric part is a check:

   ```html
   <div class="check" data-ans="2.46" data-tol="2%" data-unit="A">
     <p>(b) Firing current?</p>
     <div class="miss" data-val="1.23"><p>Feedback for a common wrong answer.</p></div>
     <div class="hint">Optional hint, shown after a wrong answer.</div>
     <div class="solution"><p>Worked solution.</p></div>
   </div>
   ```

   `data-tol` is relative (`2%`) or absolute (`0.1`). Answers accept SI prefixes (`4.7k`, `2.5m`).
6. End with **At the bench** (lab video slot plus a `<div class="lab">` procedure), a **Summary & cheat sheet**, optional **Go deeper** links (`<a data-deep="matching_theory.html#refl">`), and `<nav class="pager"></nav>`.

Draw every figure with the theme colours from `Plot.col` (or CSS variables in SVG) so the figures match the page.
