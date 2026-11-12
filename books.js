(function () {
  'use strict';
  const root = document.getElementById('library-browser');
  const PAGE_SIZE = 8;
  const shelves = [['all', 'All books'], ['currently-reading', 'Currently reading'], ['read', 'Read'], ['reading-list', 'Reading list'], ['gist', 'The Gist']];
  const labels = Object.fromEntries(shelves);
  const defaults = { shelf: 'all', query: '', topic: '', summary: false, sort: 'shelf', view: 'list', page: 0 };
  let state = { ...defaults };
  let books = [];
  let topics = [];
  const find = selector => root.querySelector(selector);
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f’']/g, '').toLowerCase();
  const getTopics = book => [...new Set([book.topic, ...(Array.isArray(book.tags) ? book.tags : [])].filter(Boolean))];
  function pageUrl(book) {
    if (!book.page) return '';
    try {
      const url = new URL(book.page, document.baseURI);
      return url.origin === location.origin && /\.html$/.test(url.pathname) ? url.href : '';
    } catch { return ''; }
  }
  function readState() {
    const params = new URLSearchParams(location.search);
    state = { ...defaults, shelf: params.get('shelf') || 'all', query: params.get('q') || '', topic: params.get('topic') || '', summary: params.get('summary') === '1', sort: params.get('sort') || 'shelf', view: params.get('view') || 'list', page: Math.max(0, (Number(params.get('page')) || 1) - 1) };
    if (!Object.hasOwn(labels, state.shelf)) state.shelf = 'all';
    if (!topics.includes(state.topic)) state.topic = '';
    if (!['shelf', 'title', 'author', 'year'].includes(state.sort)) state.sort = 'shelf';
    if (!['list', 'grid'].includes(state.view)) state.view = 'list';
    if (!Number.isSafeInteger(state.page)) state.page = 0;
  }
  function writeState() {
    const params = new URLSearchParams();
    for (const [key, param] of [['shelf', 'shelf'], ['query', 'q'], ['topic', 'topic'], ['sort', 'sort'], ['view', 'view']]) {
      if (state[key] !== defaults[key]) params.set(param, state[key]);
    }
    if (state.summary) params.set('summary', '1');
    if (state.page) params.set('page', state.page + 1);
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
  }
  function render() {
    const terms = normalize(state.query).split(/\s+/).filter(Boolean);
    const filtered = books.filter(book => (state.shelf === 'all' || book.shelf === state.shelf) && (!state.topic || getTopics(book).includes(state.topic)) && (!state.summary || pageUrl(book)) && terms.every(term => normalize([book.title, book.author, ...getTopics(book)].join(' ')).includes(term)));
    filtered.sort((a, b) => {
      if (state.sort === 'title' || state.sort === 'author') return String(a[state.sort] || '').localeCompare(String(b[state.sort] || ''));
      if (state.sort === 'year') return (parseInt(b.published) || 0) - (parseInt(a.published) || 0);
      const shelfOrder = shelves.findIndex(s => s[0] === a.shelf) - shelves.findIndex(s => s[0] === b.shelf);
      if (shelfOrder) return shelfOrder;
      if (a.shelf === 'read') return String(b.date_finished || '').localeCompare(String(a.date_finished || ''));
      if (a.shelf === 'gist') return String(b.date_summarised || '').localeCompare(String(a.date_summarised || ''));
      return 0;
    });
    state.page = Math.min(state.page, Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1));
    const start = state.page * PAGE_SIZE;
    find('.jl-results').className = 'jl-results' + (state.view === 'grid' ? ' jl-grid' : '');
    find('.jl-results').innerHTML = filtered.slice(start, start + PAGE_SIZE).map(book => {
      const url = pageUrl(book);
      const title = url ? `<a class="jl-title" href="${escape(url)}">${escape(book.title)}</a>` : `<button type="button" class="jl-title" data-book="${book.id}" aria-haspopup="dialog">${escape(book.title)}</button>`;
      return `<li class="jl-book"><div class="jl-spine" aria-hidden="true">${escape(book.title.charAt(0))}</div><div>${title}<div class="jl-meta">${escape(book.author || 'Unknown author')}${book.published ? ' · ' + escape(book.published) : ''}${book.topic ? '<br>' + escape(book.topic) : ''}</div></div><div class="jl-status">${labels[book.shelf]}${url ? `<a class="jl-gist" href="${escape(url)}">Read summary →</a>` : ''}</div></li>`;
    }).join('') || '<li class="jl-empty">No matching books. Try another search or clear the filters.</li>';
    find('.jl-current').innerHTML = escape(labels[state.shelf]) + ` <span class="jl-small">${filtered.length}</span>`;
    find('.jl-range').textContent = filtered.length ? `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} books` : '0 books';
    find('.jl-prev').disabled = state.page === 0;
    find('.jl-next').disabled = start + PAGE_SIZE >= filtered.length;
    find('.jl-reset').hidden = !(state.query || state.topic || state.summary || state.shelf !== 'all');
    root.querySelectorAll('[data-shelf]').forEach(button => button.setAttribute('aria-pressed', button.dataset.shelf === state.shelf));
    root.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', button.dataset.view === state.view));
    find('input[type=search]').value = state.query;
    find('.jl-topic').value = state.topic;
    find('.jl-sort').value = state.sort;
    find('input[type=checkbox]').checked = state.summary;
  }
  function update(change) {
    Object.assign(state, { page: 0 }, change);
    render();
    writeState();
  }
  function showDetails(id) {
    const book = books.find(item => item.id === id);
    if (!book) return;
    const detail = find('.jl-detail');
    const rating = Number(book.rating);
    const paragraphs = [book.gist, book.my_notes, book.why].filter(Boolean);
    detail.innerHTML = `<button type="button" class="jl-close" autofocus>Close</button><div class="jl-eyebrow">${labels[book.shelf]}${book.topic ? ' · ' + escape(book.topic) : ''}</div><h2 id="book-detail-title">${escape(book.title)}</h2><div class="jl-meta">${escape(book.author)}${book.published ? ' · ' + escape(book.published) : ''}</div>${book.date_finished ? '<p>Finished: ' + escape(book.date_finished) + '</p>' : ''}${book.date_summarised ? '<p>Summarised: ' + escape(book.date_summarised) + '</p>' : ''}${Number.isInteger(rating) && rating >= 1 && rating <= 5 ? `<p aria-label="Rated ${rating} out of 5">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</p>` : ''}${paragraphs.map(text => '<p>' + escape(text) + '</p>').join('')}${getTopics(book).length ? '<ul class="jl-tags">' + getTopics(book).map(topic => '<li>' + escape(topic) + '</li>').join('') + '</ul>' : ''}${!pageUrl(book) ? '<p class="jl-small">No summary in the current collection.</p>' : ''}`;
    detail.showModal();
  }
  root.addEventListener('click', event => {
    const shelf = event.target.closest('[data-shelf]');
    const view = event.target.closest('[data-view]');
    const book = event.target.closest('[data-book]');
    if (shelf) update({ shelf: shelf.dataset.shelf });
    if (view) update({ view: view.dataset.view, page: state.page });
    if (book) showDetails(Number(book.dataset.book));
    if (event.target.closest('.jl-close')) find('.jl-detail').close();
    if (event.target.closest('.jl-prev')) update({ page: Math.max(0, state.page - 1) });
    if (event.target.closest('.jl-next')) update({ page: state.page + 1 });
    if (event.target.closest('.jl-reset')) update({ shelf: 'all', query: '', topic: '', summary: false });
  });
  find('input[type=search]').addEventListener('input', event => update({ query: event.target.value }));
  find('.jl-topic').addEventListener('change', event => update({ topic: event.target.value }));
  find('.jl-sort').addEventListener('change', event => update({ sort: event.target.value }));
  find('input[type=checkbox]').addEventListener('change', event => update({ summary: event.target.checked }));
  window.addEventListener('popstate', () => { readState(); render(); });
  fetch('books.json').then(response => {
    if (!response.ok) throw new Error('Could not load books');
    return response.json();
  }).then(data => {
    if (!Array.isArray(data)) throw new Error('Invalid book data');
    books = data.filter(book => book && typeof book.title === 'string' && shelves.some(s => s[0] !== 'all' && s[0] === book.shelf)).map((book, id) => ({ ...book, id }));
    topics = [...new Set(books.flatMap(getTopics))].sort((a, b) => a.localeCompare(b));
    find('.jl-shelves').innerHTML = shelves.map(([key, label]) => `<button type="button" class="jl-shelf" data-shelf="${key}" aria-pressed="false"><span>${label}</span><span>${key === 'all' ? books.length : books.filter(b => b.shelf === key).length}</span></button>`).join('');
    find('.jl-topic').innerHTML = '<option value="">All topics</option>' + topics.map(topic => `<option value="${escape(topic)}">${escape(topic)}</option>`).join('');
    find('.jl-total').textContent = books.length + ' books in the collection';
    find('#books-status').hidden = true;
    readState();
    render();
    writeState();
  }).catch(() => {
    find('#books-status').textContent = 'The shelves could not be loaded. Please refresh to try again.';
  });
})();
