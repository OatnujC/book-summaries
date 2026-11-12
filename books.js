(function () {
  const status = document.getElementById("books-status");
  const list = document.getElementById("books-list");
  const empty = document.getElementById("empty-list");
  const countEl = document.getElementById("book-count");

  function formatSummarised(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(books) {
    const sorted = books.slice().sort(function (a, b) {
      return String(b.date_summarised || "").localeCompare(String(a.date_summarised || ""));
    });
    list.innerHTML = "";
    if (!sorted.length) {
      status.hidden = true;
      empty.hidden = false;
      return;
    }
    sorted.forEach(function (book) {
      const li = document.createElement("li");
      const tags = Array.isArray(book.tags) ? book.tags : [];
      const tagsHtml = tags.length
        ? "<ul class=\"tags\">" + tags.map(function (t) { return "<li>" + escapeHtml(t) + "</li>"; }).join("") + "</ul>"
        : "";
      const summarised = book.date_summarised
        ? " · summarised <time datetime=\"" + escapeHtml(book.date_summarised) + "\">" + escapeHtml(formatSummarised(book.date_summarised)) + "</time>"
        : "";
      li.innerHTML =
        "<article class=\"entry-card\">" +
          "<p class=\"year\">" + escapeHtml(book.published || "") + "</p>" +
          "<div>" +
            "<p class=\"eyebrow\">" + escapeHtml(book.author || "Unknown author") + summarised + "</p>" +
            "<h3><a href=\"" + escapeHtml(book.page) + "\">" + escapeHtml(book.title) + "</a></h3>" +
            (book.gist ? "<p class=\"gist\">" + escapeHtml(book.gist) + "</p>" : "") +
            tagsHtml +
          "</div>" +
        "</article>";
      list.appendChild(li);
    });
    countEl.hidden = false;
    countEl.textContent = String(sorted.length).padStart(2, "0");
    status.hidden = true;
  }

  fetch("books.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load books.json");
      return res.json();
    })
    .then(render)
    .catch(function () {
      status.textContent = "The shelf could not be loaded. Please try again shortly.";
    });
})();
