/**
 * Bible Bookmarks Manager
 * Handles local persistence of favorite verses without requiring user accounts.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'church_bible_bookmarks_v1';

  class BibleBookmarksManager {
    constructor() {
      this.bookmarks = this.load();
      this.listeners = [];
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.warn('[Bookmarks] Failed to load bookmarks from localStorage:', e);
        return [];
      }
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookmarks));
        this.notify();
      } catch (e) {
        console.error('[Bookmarks] Failed to save bookmarks:', e);
      }
    }

    onChange(cb) {
      this.listeners.push(cb);
    }

    notify() {
      for (const cb of this.listeners) {
        try { cb(this.bookmarks); } catch (e) { console.error(e); }
      }
    }

    makeKey(bookSlug, chapter, verse, translation) {
      return `${translation}:${bookSlug}:${chapter}:${verse}`;
    }

    isBookmarked(bookSlug, chapter, verse, translation) {
      const key = this.makeKey(bookSlug, chapter, verse, translation);
      return this.bookmarks.some(b => b.key === key);
    }

    toggleBookmark(verseData) {
      const key = this.makeKey(
        verseData.bookSlug,
        verseData.chapter,
        verseData.verse,
        verseData.translation
      );

      const existingIndex = this.bookmarks.findIndex(b => b.key === key);
      if (existingIndex !== -1) {
        this.bookmarks.splice(existingIndex, 1);
        this.save();
        return { action: 'removed', bookmarked: false };
      } else {
        const newBookmark = {
          key: key,
          id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          bookId: verseData.bookId,
          bookSlug: verseData.bookSlug,
          bookName: verseData.bookName,
          teluguBookName: verseData.teluguBookName,
          chapter: verseData.chapter,
          verse: verseData.verse,
          referenceEn: `${verseData.bookName} ${verseData.chapter}:${verseData.verse}`,
          referenceTe: `${verseData.teluguBookName} ${verseData.chapter}:${verseData.verse}`,
          text: verseData.text,
          translation: verseData.translation,
          savedAt: new Date().toISOString()
        };
        this.bookmarks.unshift(newBookmark);
        this.save();
        return { action: 'added', bookmarked: true, bookmark: newBookmark };
      }
    }

    removeBookmarkById(id) {
      const idx = this.bookmarks.findIndex(b => b.id === id);
      if (idx !== -1) {
        this.bookmarks.splice(idx, 1);
        this.save();
        return true;
      }
      return false;
    }

    clearAll() {
      this.bookmarks = [];
      this.save();
    }

    getAll() {
      return [...this.bookmarks];
    }
  }

  window.BibleBookmarks = new BibleBookmarksManager();
})(window);
