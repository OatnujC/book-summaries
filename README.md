# JT's Library

A private shelf of book summaries, written as essays. Plain HTML, CSS and JavaScript; no dependencies or build step. The home page fetches `books.json` and lists each book as a card (title, author, year published, date summarised, a one-line gist, tags and a link). Each essay lives in `books/` and shares the site’s typography with [JT's Almanac](https://github.com/OatnujC/almanac).

## GitHub Pages

In the repository’s **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save. All site files live at the repository root, with essays in `books/`. `.nojekyll` keeps the files served as static assets. Paths are relative, so the site works at a GitHub Pages repository URL.

This repository is private. GitHub Pages on a private repository needs GitHub Pro (or another paid plan that includes it). Visitors must be signed in to GitHub with access to the repo.

## How to add a book

1. Copy `books/_template.html` to `books/YYYY-MM-DD-slug.html`, using the date you summarised the book and a short slug from the title.
2. Fill in the title, author, year published, date summarised, one-line gist (in the meta description) and essay body. Do not repeat the top-level heading inside `.prose`: the layout already prints the `<h1>`. Use a separate `<p>` for each essay paragraph, and optional `<h2>` subheadings.
3. Add an object to `books.json`, keeping valid JSON (commas between objects, no trailing comma):

   ```json
   {
     "title": "Book title",
     "author": "Author name",
     "published": "2012",
     "date_summarised": "2026-11-12",
     "gist": "A one-line sense of the argument.",
     "page": "books/2026-11-12-book-title.html",
     "tags": ["careers", "work"]
   }
   ```

   Use `YYYY` for `published` and `YYYY-MM-DD` for `date_summarised`. The home page sorts the shelf by date summarised, newest first.
4. Preview the card and the essay, then commit both the essay page and `books.json` to `main`. GitHub Pages will serve the update without a build step.

## Local preview

From this directory, run `python3 -m http.server 8000` and open `http://localhost:8000`. Use an HTTP server: opening `index.html` as a local file can prevent `fetch` from loading the shelf.
