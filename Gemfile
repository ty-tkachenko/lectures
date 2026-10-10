source "https://rubygems.org"

# Pin the GitHub Pages gem. Gemfile.lock records the exact versions
# `bundle install` will use, including on Windows.
# Do not add plugins this gem does not allow.
gem "github-pages", "232", group: :jekyll_plugins

group :development do
  # Ruby 3 does not ship webrick. `jekyll serve` needs it.
  gem "webrick", "~> 1.8"
end
