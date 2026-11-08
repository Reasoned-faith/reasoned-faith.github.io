# How to post an article

Articles are plain **HTML files** kept in the `articles/` folder. The folders ARE the categories.

```
articles/
  christian-theology/              <- category (folder name)
    how-many-powers-created-the-world.html
    trinity/                       <- sub-category (folder inside a category)
      the-trinity-in-scripture.html
  islamic-dilemma/
  bible-study/
  catholicism/
```

## Add an article (3 steps)

1. **Pick the folder.** Put the file in `articles/<category>/` (or `articles/<category>/<subcategory>/`).
2. **Copy the template.** Copy `_templates/article-template.html` into that folder and rename it, e.g. `jesus-as-god.html` (lowercase, dashes, no spaces).
3. **Write and commit.** Change the title, excerpt, date and tags at the top, write your article in HTML under the `---` line, then commit and push to GitHub. The site updates in about a minute.

The article automatically appears in **Latest Articles**, in its category page, in the category bar, in search, and in **Tags**. You never edit `index.html`.

## The top of every article (front matter)

```
---
title: "Jesus as God in the New Testament"
excerpt: "Tracing the earliest Christian confession through the texts."
date: 2026-11-08
tags: [Jesus, Christology]
---
```

Keep the three dashes. `date` decides the order (newest first). `tags` are optional.

## Add a new category or sub-category

Just create a new folder and put an article in it, e.g. `articles/church-fathers/`. It appears in the bar automatically, named after the folder ("Church fathers").
For a nicer name and a description, add it to `_data/categories.yml`:

```
church-fathers:
  name: Church Fathers
  description: What the earliest Christian writers taught.
```

## Handy HTML

```
<h2>Heading</h2>   <h3>Smaller heading</h3>   <p>Paragraph</p>
<ul><li>List item</li></ul>
<a href="/articles/christian-theology/trinity/the-trinity-in-scripture.html">Link to another article</a>
<blockquote>Verse or quote <cite>John 1:1</cite></blockquote>
```

## Other things you can edit

| What | Where |
|---|---|
| Site name, author, contact, footer verse | `_config.yml` |
| Three featured topics | `_data/topics.yml` |
| Colours and fonts | top of `assets/css/style.css` (the `:root` block) |
