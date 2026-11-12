(function () {
  const SHELVES = ["currently-reading", "read", "reading-list", "gist"];
  const status = document.getElementById("books-status");

  function formatDate(iso) {
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

  function ratingHtml(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 5) return "";
    var stars = "";
    for (var i = 1; i <= 5; i++) {
      stars += i <= n ? "<span>★</span>" : "<span class=\"empty\">☆</span>";
    }
    return "<p class=\"rating\" aria-label=\"Rated " + n + " out of 5\">" + stars + "</p>";
  }

  function sortForShelf(shelf, books) {
    var copy = books.slice();
    if (shelf === "read") {
      copy.sort(function (a, b) {
        return String(b.date_finished || "").localeCompare(String(a.date_finished || ""));
      });
    } else if (shelf === "gist") {
      copy.sort(function (a, b) {
        return String(b.date_summarised || "").localeCompare(String(a.date_summarised || ""));
      });
    }
    return copy;
  }

  function cardHtml(book, shelf) {
    var title = book.page
      ? "<h3><a href=\"" + escapeHtml(book.page) + "\">" + escapeHtml(book.title) + "</a></h3>"
      : "<h3>" + escapeHtml(book.title) + "</h3>";

    var eyebrowBits = [escapeHtml(book.author || "Unknown author")];
    if (shelf === "read" && book.date_finished) {
      eyebrowBits.push("finished <time datetime=\"" + escapeHtml(book.date_finished) + "\">" + escapeHtml(formatDate(book.date_finished)) + "</time>");
    }
    if (shelf === "gist" && book.date_summarised) {
      eyebrowBits.push("summarised <time datetime=\"" + escapeHtml(book.date_summarised) + "\">" + escapeHtml(formatDate(book.date_summarised)) + "</time>");
    }

    var body = "";
    if (shelf === "read") {
      body += ratingHtml(book.rating);
      if (book.my_notes) body += "<p class=\"notes\">" + escapeHtml(book.my_notes) + "</p>";
    }
    if (shelf === "reading-list" && book.why) {
      body += "<p class=\"why\">" + escapeHtml(book.why) + "</p>";
    }
    if (shelf === "gist" && book.gist) {
      body += "<p class=\"gist\">" + escapeHtml(book.gist) + "</p>";
    }
    if (Array.isArray(book.tags) && book.tags.length) {
      body += "<ul class=\"tags\">" + book.tags.map(function (t) {
        return "<li>" + escapeHtml(t) + "</li>";
      }).join("") + "</ul>";
    }

    return "<article class=\"entry-card\">" +
      "<p class=\"year\">" + escapeHtml(book.published || "") + "</p>" +
      "<div>" +
        "<p class=\"eyebrow\">" + eyebrowBits.join(" · ") + "</p>" +
        title +
        body +
      "</div>" +
    "</article>";
  }

  function renderShelf(shelf, books) {
    var list = document.querySelector('[data-shelf="' + shelf + '"]');
    var empty = document.querySelector('[data-empty-for="' + shelf + '"]');
    var countEl = document.querySelector('[data-count-for="' + shelf + '"]');
    if (!list) return;

    list.innerHTML = "";
    var items = sortForShelf(shelf, books);
    if (!items.length) {
      if (empty) empty.hidden = false;
      if (countEl) countEl.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    items.forEach(function (book) {
      var li = document.createElement("li");
      li.innerHTML = cardHtml(book, shelf);
      list.appendChild(li);
    });
    if (countEl) {
      countEl.hidden = false;
      countEl.textContent = String(items.length).padStart(2, "0");
    }
  }

  function render(books) {
    var grouped = {};
    SHELVES.forEach(function (shelf) { grouped[shelf] = []; });
    (books || []).forEach(function (book) {
      var shelf = book.shelf;
      if (SHELVES.indexOf(shelf) === -1) return;
      grouped[shelf].push(book);
    });
    SHELVES.forEach(function (shelf) {
      renderShelf(shelf, grouped[shelf]);
    });
    if (status) status.hidden = true;
  }

  fetch("books.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load books.json");
      return res.json();
    })
    .then(render)
    .catch(function () {
      if (status) status.textContent = "The shelves could not be loaded. Please try again shortly.";
    });
})();
