# Lectures

Course site for the EE and RF series. Built with Jekyll. The public site is <https://ty-tkachenko.github.io/lectures/>. The site title is Fundamentals.

How the repo is organized is in `CLAUDE.md`.

## Publishing

Push work to `main`. GitHub Pages serves `main` from the repository root, at <https://ty-tkachenko.github.io/lectures/>. There is no separate publish branch.

## Preview locally

Requires Ruby 3 or newer. On Windows, install [RubyInstaller with Devkit](https://rubyinstaller.org/). WSL works too (`sudo apt install ruby-full build-essential` in Ubuntu).

From the repo root:

```
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000/lectures/>. `Gemfile` pins the `github-pages` gem and adds `webrick` for Ruby 3. `Gemfile.lock` is committed, so leave it in the commit if Bundler updates it.
