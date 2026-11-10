# How to add articles and categories

## How the site is organised

```
_articles/                              <- ALL articles live here (folders = categories)
  islamic-dilemma/
    a-quranic-variant.html
  christian-theology/
    how-many-powers-created-the-world.html
    trinity/                            <- sub-category
      the-incarnation-how-god-became-man.html

articles/                               <- the category PAGES (one tiny index.html each)
  islamic-dilemma/index.html
  christian-theology/index.html
  christian-theology/trinity/index.html
```

The folder name and file name become the web address:

`_articles/islamic-dilemma/a-quranic-variant.html`  →  `https://reasoned-faith.github.io/articles/islamic-dilemma/a-quranic-variant/`

Rules for names: lowercase, words joined with dashes, **no spaces**, no capital letters.

---

## A. Add a new ARTICLE to an existing category (2 steps)

1. Copy `_templates/article-template.html` into `_articles/<category>/` and rename it, e.g. `_articles/islamic-dilemma/my-new-article.html`.
2. Change `title`, `excerpt`, `date` and `tags` at the top, write the article in HTML under the second `---`, then commit.

That is all. The article appears by itself on the home page, in **All articles**, in its category page, in the sidebar, in **Tags** and in search. You never edit `index.html`.

On the GitHub website: **Add file → Create new file**, type the full path in the name box (typing `/` makes folders), paste the article, **Commit changes**. The site updates in about a minute.

### The top of every article

```
---
title: "Jesus as God in the New Testament"
excerpt: "Tracing the earliest Christian confession through the texts."
date: 2026-11-10
tags: [Jesus, Christology]
---
```

`date` decides the order (newest first). `tags` are optional. `author:` is optional (defaults to Anthony William).
Markdown (`.md`) files also work, but HTML is the standard here.

### Link from one article to another

Use the clean address, with a slash at the end:

```
<a href="/articles/christian-theology/trinity/the-incarnation-how-god-became-man/">The Incarnation</a>
```

---

## B. Add a new CATEGORY (3 steps)

Example: a category called **Church Fathers**.

1. **Make the folder with a first article:** `_articles/church-fathers/ignatius-on-the-eucharist.html` (use the article template).
2. **Make the category page:** copy `_templates/category-index.html` to `articles/church-fathers/index.html` and edit the top:

```
---
layout: category
title: Church Fathers
description: What the earliest Christian writers taught.
order: 60
---
```

3. Commit both files.

The category now has its own address `/articles/church-fathers/`, its button in the bar under the header, and (unless you hide it) its box in the sidebar.

* `title` = the name shown on the site. `description` = the sentence under the heading.
* `order` = position in the bar (smaller number = further left).
* Add `sidebar: false` to keep it out of the sidebar boxes (the button in the bar stays).

## C. Add a SUB-category (same idea, one level deeper)

Example: **Eucharist** inside Church Fathers.

1. Articles go in `_articles/church-fathers/eucharist/`.
2. Copy the category template to `articles/church-fathers/eucharist/index.html` and give it a `title`.

Its address is `/articles/church-fathers/eucharist/`. The parent category page automatically shows a button for it.

---

## Move or rename an article

If an article was already shared with someone, add the old address to its top so old links keep working:

```
redirect_from:
  - /articles/old-category/old-name/
```

## Other things you can edit

| What | Where |
|---|---|
| Site name, author, contact, footer verse | `_config.yml` |
| Daily verses (change every 5 minutes) | `_data/verses.yml` |
| Topics offered in search | `_data/topics.yml` |
| Colours and fonts | top of `assets/css/style.css` (the `:root` block) |
