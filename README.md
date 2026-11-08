# Reasoned Faith

Theology and apologetics website by Anthony William, built for **GitHub Pages** (Jekyll, no plugins).

## Put it online
1. Create a GitHub repository and upload everything in this folder.
2. Repository **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`.
3. If the site address is `https://USER.github.io/REPO/`, set `baseurl: "/REPO"` in `_config.yml`.

## Files
- `index.html`, `tags.html`, `404.html`: pages
- `_layouts/`, `_includes/`: page templates (header, footer, article layout)
- `assets/css/style.css`, `assets/js/site.js`: design and behaviour
- `_data/`: category names and featured topics
- `articles/`: the articles (HTML), folders = categories
- `HOW-TO-POST-ARTICLES.md`: how to add an article

## Preview on your computer (optional)
`bundle install` then `bundle exec jekyll serve` and open http://localhost:4000
