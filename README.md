# Lectures

Course site for the rocket-club EE and RF series. Built with Jekyll. The public site is <https://ty-tkachenko.github.io/lectures/>.

How the repo is organized is in `CLAUDE.md`.

## Publishing

Push work to `main`. GitHub Pages serves the `published` branch, not `main`. Tymur merges `main` into `published` when content is ready to go live.

## Preview locally

Requires Ruby 3 or newer. On Windows, install [RubyInstaller with Devkit](https://rubyinstaller.org/). WSL works too (`sudo apt install ruby-full build-essential` in Ubuntu).

From the repo root:

```
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000/lectures/>. `Gemfile` pins the `github-pages` gem and adds `webrick` for Ruby 3. `Gemfile.lock` is committed, so leave it in the commit if Bundler updates it.
