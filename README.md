# Reasoned Faith

Theology and apologetics website by Anthony William, built for **GitHub Pages** (Jekyll).
Every address is clean: no `.html` and no `#` anywhere.

| Page | Address |
|---|---|
| Home | `/` |
| All articles | `/articles/` |
| A category | `/articles/islamic-dilemma/` |
| A sub-category | `/articles/christian-theology/trinity/` |
| An article | `/articles/islamic-dilemma/a-quranic-variant/` |
| Tags / Contact | `/tags/` · `/contact/` |

## Put it online
1. Create a GitHub repository and upload everything in this folder (keep the folder structure).
2. Repository **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`.
3. If the site address is `https://USER.github.io/REPO/`, set `baseurl: "/REPO"` in `_config.yml`.

## Files
- `_articles/` : **the articles** (HTML or Markdown). Folders = categories. See `HOW-TO-POST-ARTICLES.md`.
- `articles/<category>/index.html` : one tiny file per category (gives the category its page and menu button)
- `index.html`, `articles/index.html`, `tags/index.html`, `contact/index.html`, `404.html`, `search.json`: pages
- `_layouts/`, `_includes/`: page templates
- `assets/css/style.css`, `assets/js/`: design and behaviour
- `_data/verses.yml`, `_data/topics.yml`: daily verses and search topics
- `_templates/`: copy-and-fill templates for a new article and a new category
