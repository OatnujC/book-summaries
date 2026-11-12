# JT's Library

A searchable reading library and a place for book summaries, written as essays. Plain HTML, CSS and JavaScript; no dependencies or build step. The home page fetches `books.json` and lets you browse all books or one of four shelves, search titles/authors/topics, filter by topic or summary availability, sort, and switch between list and grid views. Results are paginated eight books at a time. Essays live in `books/` and share the site’s typography with [JT's Almanac](https://github.com/OatnujC/almanac). The live site is at [oatnujc.github.io/book-summaries](https://oatnujc.github.io/book-summaries/).

## The shelves

The sidebar lists All books followed by these shelves:

1. **Currently reading** — books on the desk.
2. **Read** — finished books, with the date finished, a star rating from 1 to 5, a line of my own thoughts, and a link to the summary if one exists.
3. **Reading list** — books I mean to read, with a note on why they appealed or who recommended them.
4. **The Gist** — books I am only having summarised, rather than reading myself.

A book with a `page` field links to its essay. Other titles open a keyboard-accessible detail dialog with any notes, reason for reading, rating and dates. Search and filter selections are stored in the URL, so views can be bookmarked or shared and browser Back restores the library after visiting an essay. The summary filter works across every shelf and checks for an essay link, independently of The Gist shelf.

## GitHub Pages

In the repository’s **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/ (root)**, then save. All site files live at the repository root, with essays in `books/`. `.nojekyll` keeps the files served as static assets. Paths are relative, so the site works at the GitHub Pages repository URL.

## How to add a book

Add an object to `books.json`, keeping valid JSON (commas between objects, no trailing comma). Set `shelf` to one of `currently-reading`, `read`, `reading-list` or `gist`. Title, author and year published are enough for a book with no summary:

```json
{
  "title": "Book title",
  "author": "Author name",
  "published": "2012",
  "shelf": "currently-reading"
}
```

Optional fields, used by particular shelves:

- `why` — a short note for the reading list (why it appealed, or who recommended it).
- `date_finished` — `YYYY-MM-DD`, for the Read shelf.
- `rating` — an integer from 1 to 5, for the Read shelf.
- `my_notes` — one line of my own thoughts, for the Read shelf.
- `date_summarised` — `YYYY-MM-DD`, for The Gist.
- `gist` — a one-line sense of the argument, for The Gist.
- `tags` — an array of short labels, shown on the card.
- `topic` — a broad category such as `Fantasy`, `History` or `Technology`, shown in the list. Both this field and `tags` appear in the topic filter and are searchable. Both are optional; new categories are picked up automatically.
- `page` — a path such as `books/2026-11-12-book-title.html`. Omit this until a summary essay exists; the card will then link itself.

The Read shelf is sorted by date finished, newest first; The Gist by date summarised, newest first. The other shelves keep the order of `books.json`.

## How a book moves between shelves

Change the `shelf` value and add or remove the fields that belong to the new shelf, then commit `books.json` to `main`.

- Starting a book from the reading list: set `shelf` to `currently-reading`. You can leave `why` in the file; only the reading list displays it.
- Finishing a book: set `shelf` to `read` and add `date_finished`, plus `rating` and `my_notes` when you have them.
- Asking for a summary rather than reading it: set `shelf` to `gist` and add `date_summarised` and `gist`.
- Adding a summary to a book already on a shelf: write the essay (see below), set `page` to that file, and commit both.

## How to add a summary essay

1. Copy `books/_template.html` to `books/YYYY-MM-DD-slug.html`, using the date you summarised the book and a short slug from the title.
2. Fill in the title, author, year published, date summarised, one-line gist (in the meta description) and essay body. Do not repeat the top-level heading inside `.prose`: the layout already prints the `<h1>`. Use a separate `<p>` for each essay paragraph, and optional `<h2>` subheadings.
3. Point the book’s `page` field at the new file, and set `shelf` to `gist` (or leave it on `read` if you finished the book yourself and still want the essay linked from that shelf).
4. Preview the card and the essay, then commit the essay page and `books.json` to `main`. GitHub Pages will serve the update without a build step.

## Local preview

From this directory, run `python3 -m http.server 8000` and open `http://localhost:8000`. Use an HTTP server: opening `index.html` as a local file can prevent `fetch` from loading the shelves.
