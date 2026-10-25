/**
 * Bible Navigation Controller
 * Handles book, chapter, testament, and translation switching with URL hash sync.
 */

(function (window) {
  'use strict';

  class BibleNavigation {
    constructor() {
      this.books = [];
      this.currentBook = null;
      this.currentChapter = 1;
      this.currentTranslation = 'kjv';
      this.parallelMode = false;
      this.targetVerse = null;
      this.testamentFilter = 'all';
      this.onPassageChanged = null;
    }

    init({ books, defaultTranslation = 'kjv', onPassageChanged }) {
      this.books = books;
      this.currentTranslation = defaultTranslation;
      this.onPassageChanged = onPassageChanged;

      this.bindHashRouter();
      this.parseInitialHash();
    }

    parseInitialHash() {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash) {
        const parts = hash.split('/');
        // format: [translation]/[bookSlug]/[chapter]/[verse]
        // or: [bookSlug]/[chapter]
        let trans = this.currentTranslation;
        let slug = 'genesis';
        let ch = 1;
        let v = null;

        if (parts[0] === 'kjv' || parts[0] === 'telugu') {
          trans = parts[0];
          slug = parts[1] || 'genesis';
          ch = parseInt(parts[2] || '1', 10);
          v = parts[3] ? parseInt(parts[3], 10) : null;
        } else if (parts[0]) {
          slug = parts[0];
          ch = parseInt(parts[1] || '1', 10);
          v = parts[2] ? parseInt(parts[2], 10) : null;
        }

        const foundBook = this.books.find(b => b.slug === slug.toLowerCase() || b.name.toLowerCase() === slug.toLowerCase());
        if (foundBook) {
          this.currentBook = foundBook;
          this.currentTranslation = trans;
          this.currentChapter = Math.min(foundBook.chaptersCount, Math.max(1, isNaN(ch) ? 1 : ch));
          this.targetVerse = v;
          return;
        }
      }

      // Default
      this.currentBook = this.books[0] || null;
      this.currentChapter = 1;
      this.targetVerse = null;
    }

    bindHashRouter() {
      window.addEventListener('hashchange', () => {
        const prevTrans = this.currentTranslation;
        const prevSlug = this.currentBook ? this.currentBook.slug : '';
        const prevCh = this.currentChapter;

        this.parseInitialHash();

        if (
          this.currentTranslation !== prevTrans ||
          (this.currentBook && this.currentBook.slug !== prevSlug) ||
          this.currentChapter !== prevCh ||
          this.targetVerse
        ) {
          this.triggerChange();
        }
      });
    }

    updateHash(replace = false) {
      if (!this.currentBook) return;
      let hash = `#${this.currentTranslation}/${this.currentBook.slug}/${this.currentChapter}`;
      if (this.targetVerse) {
        hash += `/${this.targetVerse}`;
      }
      if (replace) {
        window.history.replaceState(null, '', hash);
      } else {
        window.location.hash = hash;
      }
    }

    setTranslation(trans) {
      if (trans !== 'kjv' && trans !== 'telugu') return;
      this.currentTranslation = trans;
      this.updateHash();
      this.triggerChange();
    }

    setParallelMode(enabled) {
      this.parallelMode = Boolean(enabled);
      this.triggerChange();
    }

    setBook(bookSlug) {
      const b = this.books.find(item => item.slug === bookSlug || item.name.toLowerCase() === bookSlug.toLowerCase());
      if (b) {
        this.currentBook = b;
        this.currentChapter = 1;
        this.targetVerse = null;
        this.updateHash();
        this.triggerChange();
      }
    }

    setChapter(chNum) {
      const ch = parseInt(chNum, 10);
      if (this.currentBook && ch >= 1 && ch <= this.currentBook.chaptersCount) {
        this.currentChapter = ch;
        this.targetVerse = null;
        this.updateHash();
        this.triggerChange();
      }
    }

    goToPassage(bookSlug, chapter, verse = null) {
      const b = this.books.find(item => item.slug === bookSlug || item.name.toLowerCase() === bookSlug.toLowerCase());
      if (b) {
        this.currentBook = b;
        this.currentChapter = Math.min(b.chaptersCount, Math.max(1, parseInt(chapter, 10)));
        this.targetVerse = verse ? parseInt(verse, 10) : null;
        this.updateHash();
        this.triggerChange();
      }
    }

    nextChapter() {
      if (!this.currentBook) return;
      if (this.currentChapter < this.currentBook.chaptersCount) {
        this.setChapter(this.currentChapter + 1);
      } else {
        // Move to first chapter of next book
        const currentIndex = this.books.findIndex(b => b.id === this.currentBook.id);
        if (currentIndex < this.books.length - 1) {
          const nextBook = this.books[currentIndex + 1];
          this.currentBook = nextBook;
          this.currentChapter = 1;
          this.targetVerse = null;
          this.updateHash();
          this.triggerChange();
        }
      }
    }

    prevChapter() {
      if (!this.currentBook) return;
      if (this.currentChapter > 1) {
        this.setChapter(this.currentChapter - 1);
      } else {
        // Move to last chapter of previous book
        const currentIndex = this.books.findIndex(b => b.id === this.currentBook.id);
        if (currentIndex > 0) {
          const prevBook = this.books[currentIndex - 1];
          this.currentBook = prevBook;
          this.currentChapter = prevBook.chaptersCount;
          this.targetVerse = null;
          this.updateHash();
          this.triggerChange();
        }
      }
    }

    triggerChange() {
      if (this.onPassageChanged && this.currentBook) {
        this.onPassageChanged({
          book: this.currentBook,
          chapter: this.currentChapter,
          translation: this.currentTranslation,
          parallelMode: this.parallelMode,
          targetVerse: this.targetVerse
        });
      }
    }

    getFilteredBooks(testament) {
      if (testament === 'OT') return this.books.filter(b => b.testament === 'OT');
      if (testament === 'NT') return this.books.filter(b => b.testament === 'NT');
      return this.books;
    }
  }

  window.BibleNavigation = new BibleNavigation();
})(window);
