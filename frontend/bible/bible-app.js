/**
 * Bible Application Coordinator
 * Connects navigation, reader, search, bookmarks, daily verse, and offline modules.
 */

(function (window) {
  'use strict';

  // Global Bible state
  window.BibleState = {
    books: [],
    translation: 'kjv',
    parallel: false,
    activeView: 'reader', // 'reader' | 'search' | 'bookmarks' | 'offline'
    theme: localStorage.getItem('church_bible_theme') || 'dark'
  };

  // Toast Notification Helper
  window.showToast = function (message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  };

  class BibleApp {
    constructor() {
      this.books = [];
      this.currentBook = null;
      this.currentChapter = 1;
    }

    async init() {
      this.applyTheme(window.BibleState.theme);

      // Load books metadata
      await this.loadBooksMetadata();

      // Initialize Sub-Modules
      await window.BibleOffline.init();
      window.BibleOffline.onNetworkStatusChange((online) => this.updateNetworkStatus(online));

      window.BibleBookmarks.onChange(() => this.updateBookmarksBadge());

      window.BibleReader.init('reader-content', () => {
        this.updateBookmarksBadge();
      });

      window.BibleSearch.init((slug, chapter, verse) => {
        this.switchView('reader');
        window.BibleNavigation.goToPassage(slug, chapter, verse);
      });

      window.BibleDailyVerse.init('daily-verse-container', (slug, chapter, verse) => {
        this.switchView('reader');
        window.BibleNavigation.goToPassage(slug, chapter, verse);
      });

      // Initialize Navigation Controller
      window.BibleNavigation.init({
        books: this.books,
        defaultTranslation: window.BibleState.translation,
        onPassageChanged: (passage) => this.handlePassageChange(passage)
      });

      // Bind all UI controls
      this.bindUIEvents();
      this.updateBookmarksBadge();
      this.refreshOfflineStatus();

      // Initial Passage Render
      window.BibleNavigation.triggerChange();
    }

    async loadBooksMetadata() {
      try {
        const apiBase = window.API_BASE_URL || '';
        let res = await fetch(`${apiBase}/api/bible/books`);
        if (!res.ok) {
          res = await fetch(`${apiBase}/bible-data/books.json`);
        }
        if (!res.ok) throw new Error('Failed to load books.json');
        this.books = await res.json();
        window.BibleState.books = this.books;
      } catch (e) {
        console.error('[App] Failed to load books metadata:', e);
        window.BibleReader.showError('Failed to load canonical book index. Please ensure server is running.');
      }
    }

    applyTheme(theme) {
      window.BibleState.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('church_bible_theme', theme);
      const themeBtn = document.getElementById('btn-theme-toggle');
      if (themeBtn) {
        themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeBtn.title = theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
      }
    }

    toggleTheme() {
      const next = window.BibleState.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
    }

    updateNetworkStatus(online) {
      const pill = document.getElementById('status-pill');
      if (pill) {
        pill.className = `status-pill ${online ? 'online' : 'offline'}`;
        pill.innerHTML = online
          ? '<span class="status-dot">●</span> Online'
          : '<span class="status-dot">○</span> Offline Mode';
      }
    }

    updateBookmarksBadge() {
      const count = window.BibleBookmarks.getAll().length;
      const badge = document.getElementById('bookmarks-badge');
      if (badge) {
        badge.textContent = count;
      }
    }

    switchView(viewName) {
      window.BibleState.activeView = viewName;

      // Update View Tabs
      document.querySelectorAll('.btn-view-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-view') === viewName);
      });

      // Show/Hide Panels
      const readerPanel = document.getElementById('panel-reader');
      const searchPanel = document.getElementById('panel-search');
      const bookmarksPanel = document.getElementById('panel-bookmarks');
      const offlinePanel = document.getElementById('panel-offline');

      if (readerPanel) readerPanel.style.display = viewName === 'reader' ? 'block' : 'none';
      if (searchPanel) searchPanel.style.display = viewName === 'search' ? 'block' : 'none';
      if (bookmarksPanel) bookmarksPanel.style.display = viewName === 'bookmarks' ? 'block' : 'none';
      if (offlinePanel) offlinePanel.style.display = viewName === 'offline' ? 'block' : 'none';

      if (viewName === 'bookmarks') {
        this.renderBookmarksList();
      } else if (viewName === 'offline') {
        this.refreshOfflineStatus();
      } else if (viewName === 'search') {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }
    }

    populateBooksDropdown(testament = 'all') {
      const select = document.getElementById('select-book');
      if (!select) return;

      const filtered = window.BibleNavigation.getFilteredBooks(testament);
      const isTelugu = window.BibleState.translation === 'telugu';

      select.innerHTML = '';
      for (const b of filtered) {
        const opt = document.createElement('option');
        opt.value = b.slug;
        opt.textContent = isTelugu ? `${b.teluguName} (${b.name})` : `${b.name} (${b.teluguName})`;
        if (this.currentBook && b.id === this.currentBook.id) {
          opt.selected = true;
        }
        select.appendChild(opt);
      }
    }

    populateChaptersDropdown(chaptersCount, selectedChapter) {
      const select = document.getElementById('select-chapter');
      if (!select) return;

      select.innerHTML = '';
      for (let i = 1; i <= chaptersCount; i++) {
        const opt = document.createElement('option');
        opt.value = i.toString();
        opt.textContent = i.toString();
        if (i === selectedChapter) {
          opt.selected = true;
        }
        select.appendChild(opt);
      }
    }

    populateVersesDropdown(versesCount, selectedVerse = null) {
      const select = document.getElementById('select-verse');
      if (!select) return;

      const isTelugu = window.BibleState.translation === 'telugu';
      const allLabel = isTelugu ? 'అన్ని వాక్యాలు (All Verses)' : 'All Verses';

      select.innerHTML = `<option value="">${allLabel}</option>`;
      const selNum = selectedVerse ? parseInt(selectedVerse, 10) : null;

      for (let i = 1; i <= versesCount; i++) {
        const opt = document.createElement('option');
        opt.value = i.toString();
        opt.textContent = isTelugu ? `${i}`;
        if (selNum === i) {
          opt.selected = true;
        }
        select.appendChild(opt);
      }
    }

    async handlePassageChange({ book, chapter, translation, parallelMode, targetVerse, verseOnly = false }) {
      if (verseOnly && this.currentBook && this.currentBook.id === book.id && this.currentChapter === chapter) {
        window.BibleReader.highlightAndScrollVerse(targetVerse);
        const selectVerse = document.getElementById('select-verse');
        if (selectVerse) {
          selectVerse.value = targetVerse ? targetVerse.toString() : '';
        }
        return;
      }
      this.currentBook = book;
      this.currentChapter = chapter;
      window.BibleState.translation = translation;
      window.BibleState.parallel = parallelMode;

      // Update Header Lang Toggle
      document.querySelectorAll('.btn-toggle-lang').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === translation);
      });

      // Update Parallel Toggle
      const parallelBtn = document.getElementById('btn-toggle-parallel');
      if (parallelBtn) {
        parallelBtn.classList.toggle('active', parallelMode);
      }

      // Update Book & Chapter dropdowns
      this.populateBooksDropdown(window.BibleNavigation.testamentFilter);
      this.populateChaptersDropdown(book.chaptersCount, chapter);

      // Update Prev / Next Buttons state
      const isFirst = book.id === 1 && chapter === 1;
      const isLast = book.id === 66 && chapter === book.chaptersCount;
      document.querySelectorAll('.btn-prev-chapter').forEach(btn => btn.disabled = isFirst);
      document.querySelectorAll('.btn-next-chapter').forEach(btn => btn.disabled = isLast);

      // Refresh Daily Verse card for language change
      window.BibleDailyVerse.render();

      // Show Reader and fetch passage
      window.BibleReader.showLoading();

      try {
        const passageData = await this.fetchChapterData(translation, book, chapter, parallelMode);
        window.BibleReader.renderChapter({
          book: book,
          chapter: chapter,
          translation: translation,
          verses: passageData.verses,
          parallelTranslation: passageData.parallelTranslation,
          parallelVerses: passageData.parallelVerses,
          targetVerse: targetVerse
        });

        // Populate Verse Selector with exact chapter verse count
        this.populateVersesDropdown(passageData.verses.length, targetVerse);
      } catch (err) {
        console.error('[App] Failed to load passage:', err);
        window.BibleReader.showError(
          `Unable to load ${book.name} Chapter ${chapter} (${translation.toUpperCase()}). Please check your connection.`,
          () => window.BibleNavigation.triggerChange()
        );
      }
    }

    async fetchChapterData(translation, book, chapter, parallel) {
      const apiBase = window.API_BASE_URL || '';

      // 1. Try Online API first
      if (navigator.onLine) {
        try {
          const res = await fetch(`${apiBase}/api/bible/chapter?translation=${translation}&book=${book.slug}&chapter=${chapter}&parallel=${parallel}`);
          if (res.ok) {
            const data = await res.json();
            return data;
          }
        } catch (apiErr) {
          console.warn('[App] API fetch failed, falling back to cache:', apiErr);
        }
      }

      // 2. Offline Cache Fallback
      const fileName = translation === 'telugu' ? book.teluguFile : book.kjvFile;
      let bookData = await window.BibleOffline.getCachedBook(translation, fileName);

      if (!bookData) {
        // Try direct fetch of raw JSON in case service worker can answer
        const folder = translation === 'telugu' ? 'telugu' : 'kjv';
        const res = await fetch(`${apiBase}/bible-data/${folder}/${fileName}`);
        if (res.ok) {
          bookData = await res.json();
        }
      }

      if (!bookData || !bookData.chapters) {
        throw new Error('Scripture data not cached for offline reading');
      }

      const chapterData = bookData.chapters.find(c => parseInt(c.chapter, 10) === parseInt(chapter, 10));
      if (!chapterData) {
        throw new Error(`Chapter ${chapter} not found in book data`);
      }

      let parallelVerses = null;
      let parallelTranslation = null;

      if (parallel) {
        parallelTranslation = translation === 'kjv' ? 'telugu' : 'kjv';
        const otherFileName = parallelTranslation === 'telugu' ? book.teluguFile : book.kjvFile;
        const otherBookData = await window.BibleOffline.getCachedBook(parallelTranslation, otherFileName);
        if (otherBookData && otherBookData.chapters) {
          const otherCh = otherBookData.chapters.find(c => parseInt(c.chapter, 10) === parseInt(chapter, 10));
          if (otherCh) {
            parallelVerses = otherCh.verses;
          }
        }
      }

      return {
        verses: chapterData.verses,
        parallelTranslation,
        parallelVerses
      };
    }

    bindUIEvents() {
      // 1. Translation toggles
      document.querySelectorAll('.btn-toggle-lang').forEach(btn => {
        btn.addEventListener('click', () => {
          const lang = btn.getAttribute('data-lang');
          window.BibleNavigation.setTranslation(lang);
        });
      });

      // 2. Parallel toggle
      const parallelBtn = document.getElementById('btn-toggle-parallel');
      if (parallelBtn) {
        parallelBtn.addEventListener('click', () => {
          const next = !window.BibleState.parallel;
          window.BibleNavigation.setParallelMode(next);
        });
      }

      // 3. Theme toggle
      const themeBtn = document.getElementById('btn-theme-toggle');
      if (themeBtn) {
        themeBtn.addEventListener('click', () => this.toggleTheme());
      }

      // 4. Font Size adjustments
      const btnFontDec = document.getElementById('btn-font-decrease');
      const btnFontInc = document.getElementById('btn-font-increase');
      if (btnFontDec) {
        btnFontDec.addEventListener('click', () => {
          window.BibleReader.setFontSize(window.BibleReader.fontSize - 2);
        });
      }
      if (btnFontInc) {
        btnFontInc.addEventListener('click', () => {
          window.BibleReader.setFontSize(window.BibleReader.fontSize + 2);
        });
      }

      // 5. Testament pills
      document.querySelectorAll('.btn-testament-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.btn-testament-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const testament = btn.getAttribute('data-testament');
          window.BibleNavigation.testamentFilter = testament;
          this.populateBooksDropdown(testament);
        });
      });

      // 6. Book Selector
      const selectBook = document.getElementById('select-book');
      if (selectBook) {
        selectBook.addEventListener('change', (e) => {
          window.BibleNavigation.setBook(e.target.value);
        });
      }

      // 7. Chapter Selector
      const selectChapter = document.getElementById('select-chapter');
      if (selectChapter) {
        selectChapter.addEventListener('change', (e) => {
          window.BibleNavigation.setChapter(e.target.value);
        });
      }

      // 7b. Verse Selector
      const selectVerse = document.getElementById('select-verse');
      if (selectVerse) {
        selectVerse.addEventListener('change', (e) => {
          window.BibleNavigation.setVerse(e.target.value);
        });
      }

      // 8. Prev / Next Chapter Buttons
      document.querySelectorAll('.btn-prev-chapter').forEach(btn => {
        btn.addEventListener('click', () => window.BibleNavigation.prevChapter());
      });
      document.querySelectorAll('.btn-next-chapter').forEach(btn => {
        btn.addEventListener('click', () => window.BibleNavigation.nextChapter());
      });

      // 9. View Switcher Tabs
      document.querySelectorAll('.btn-view-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const view = tab.getAttribute('data-view');
          this.switchView(view);
        });
      });

      // 10. Search Input & Actions
      const searchInput = document.getElementById('search-input');
      const btnSearchSubmit = document.getElementById('btn-search-submit');
      const btnClearSearch = document.getElementById('btn-clear-search');
      const searchResultsContainer = document.getElementById('search-results-container');

      const triggerSearch = async () => {
        const q = searchInput.value.trim();
        if (!q) {
          window.BibleSearch.renderResults(searchResultsContainer, { empty: true }, window.BibleState.translation === 'telugu');
          return;
        }

        searchResultsContainer.innerHTML = `
          <div class="reader-loading-state">
            <div class="loading-spinner"></div>
            <p>Searching Scriptures...</p>
          </div>
        `;

        const testamentSelect = document.getElementById('select-search-testament');
        const testament = testamentSelect ? testamentSelect.value : 'all';

        const data = await window.BibleSearch.search({
          query: q,
          translation: window.BibleState.translation,
          testament: testament,
          booksList: this.books
        });

        window.BibleSearch.renderResults(searchResultsContainer, data, window.BibleState.translation === 'telugu');
      };

      if (btnSearchSubmit) {
        btnSearchSubmit.addEventListener('click', triggerSearch);
      }
      if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') triggerSearch();
        });
        searchInput.addEventListener('input', (e) => {
          if (btnClearSearch) {
            btnClearSearch.style.display = e.target.value ? 'block' : 'none';
          }
        });
      }
      if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
          searchInput.value = '';
          btnClearSearch.style.display = 'none';
          window.BibleSearch.renderResults(searchResultsContainer, { empty: true }, window.BibleState.translation === 'telugu');
        });
      }

      // 11. Clear all bookmarks button
      const btnClearAllBookmarks = document.getElementById('btn-clear-all-bookmarks');
      if (btnClearAllBookmarks) {
        btnClearAllBookmarks.addEventListener('click', () => {
          if (confirm('Are you sure you want to remove all saved bookmarks?')) {
            window.BibleBookmarks.clearAll();
            this.renderBookmarksList();
            this.updateBookmarksBadge();
            window.showToast('All bookmarks removed');
          }
        });
      }

      // 12. Offline Cache Download Buttons
      const btnDownloadKjv = document.getElementById('btn-cache-kjv');
      const btnDownloadTelugu = document.getElementById('btn-cache-telugu');

      if (btnDownloadKjv) {
        btnDownloadKjv.addEventListener('click', async () => {
          this.startOfflineDownload('kjv', btnDownloadKjv);
        });
      }
      if (btnDownloadTelugu) {
        btnDownloadTelugu.addEventListener('click', async () => {
          this.startOfflineDownload('telugu', btnDownloadTelugu);
        });
      }
    }

    async startOfflineDownload(translation, btnElement) {
      const progressContainer = document.getElementById(`progress-${translation}`);
      const progressBar = document.getElementById(`progress-bar-${translation}`);
      const progressText = document.getElementById(`progress-text-${translation}`);

      if (progressContainer) progressContainer.style.display = 'block';
      if (btnElement) btnElement.disabled = true;

      window.BibleOffline.onProgress((p) => {
        if (p.translation === translation) {
          if (progressBar) progressBar.style.width = `${p.percentage}%`;
          if (progressText) progressText.textContent = `Caching ${p.current} / ${p.total} books (${p.percentage}%)...`;
        }
      });

      await window.BibleOffline.downloadTranslationForOffline(translation, this.books);

      if (btnElement) {
        btnElement.disabled = false;
        btnElement.textContent = '✓ Fully Cached';
      }
      if (progressText) progressText.textContent = 'Completed 100%. Ready for offline reading!';
      window.showToast(`${translation.toUpperCase()} Bible successfully cached for offline use!`);
      this.refreshOfflineStatus();
    }

    async refreshOfflineStatus() {
      const status = await window.BibleOffline.getOfflineStatus(this.books);

      const kjvStatusEl = document.getElementById('offline-kjv-status');
      const teluguStatusEl = document.getElementById('offline-telugu-status');
      const btnKjv = document.getElementById('btn-cache-kjv');
      const btnTelugu = document.getElementById('btn-cache-telugu');

      if (kjvStatusEl) {
        kjvStatusEl.textContent = status.kjvReady
          ? '✓ 66 / 66 Books Available Offline'
          : `${status.kjvCount} / 66 Books Cached`;
      }
      if (teluguStatusEl) {
        teluguStatusEl.textContent = status.teluguReady
          ? '✓ 66 / 66 Books Available Offline'
          : `${status.teluguCount} / 66 Books Cached`;
      }
      if (btnKjv && status.kjvReady) btnKjv.textContent = '✓ Update Cache';
      if (btnTelugu && status.teluguReady) btnTelugu.textContent = '✓ Update Cache';
    }

    renderBookmarksList() {
      const container = document.getElementById('bookmarks-list-container');
      if (!container) return;

      const bookmarks = window.BibleBookmarks.getAll();
      const isTelugu = window.BibleState.translation === 'telugu';

      if (bookmarks.length === 0) {
        container.innerHTML = `
          <div class="search-empty-state">
            <span class="empty-icon">🔖</span>
            <h3>${isTelugu ? 'ఇంకా బుక్‌మార్క్‌లు లేవు' : 'No Bookmarks Saved Yet'}</h3>
            <p>${isTelugu
            ? 'మీకు ఇష్టమైన వాక్యాలను సేవ్ చేయడానికి చదివే సమయంలో వాక్యం పక్కన ఉన్న నక్షత్ర చిహ్నాన్ని (★) క్లిక్ చేయండి.'
            : 'Click the star icon (★) beside any verse while reading to save it to your personal bookmarks.'}
            </p>
          </div>
        `;
        return;
      }

      let html = `<div class="bookmarks-grid">`;
      for (const bm of bookmarks) {
        const displayRef = bm.translation === 'telugu' ? bm.referenceTe : bm.referenceEn;
        html += `
          <div class="bookmark-card" data-slug="${bm.bookSlug}" data-ch="${bm.chapter}" data-v="${bm.verse}">
            <div class="bookmark-meta">
              <span class="bookmark-ref">${displayRef}</span>
              <span class="bookmark-trans-tag">${bm.translation.toUpperCase()}</span>
            </div>
            <div class="bookmark-text ${bm.translation === 'telugu' ? 'telugu-font' : ''}">
              “${bm.text}”
            </div>
            <div class="bookmark-actions">
              <button class="btn-remove-bookmark" data-id="${bm.id}" title="Remove Bookmark">🗑️ Remove</button>
            </div>
          </div>
        `;
      }
      html += `</div>`;
      container.innerHTML = html;

      // Click to navigate
      container.querySelectorAll('.bookmark-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.classList.contains('btn-remove-bookmark')) return;
          const slug = card.getAttribute('data-slug');
          const ch = parseInt(card.getAttribute('data-ch'), 10);
          const v = parseInt(card.getAttribute('data-v'), 10);
          this.switchView('reader');
          window.BibleNavigation.goToPassage(slug, ch, v);
        });
      });

      // Remove single bookmark
      container.querySelectorAll('.btn-remove-bookmark').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          window.BibleBookmarks.removeBookmarkById(id);
          this.renderBookmarksList();
          this.updateBookmarksBadge();
          window.showToast('Bookmark removed');
        });
      });
    }
  }

  // Initialize on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    window.App = new BibleApp();
    window.App.init();
  });

})(window);
