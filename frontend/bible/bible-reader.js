/**
 * Bible Reader Module
 * Renders Scripture verses, handles single and parallel views, verse bookmarks, and copying.
 */

(function (window) {
  'use strict';

  class BibleReader {
    constructor() {
      this.container = null;
      this.currentChapterData = null;
      this.fontSize = parseInt(localStorage.getItem('church_bible_font_size') || '18', 10);
      this.highlightedVerse = null;
      this.onBookmarkToggled = null;
    }

    init(containerId, onBookmarkToggled) {
      this.container = document.getElementById(containerId);
      this.onBookmarkToggled = onBookmarkToggled;
      this.applyFontSize();
    }

    setFontSize(size) {
      this.fontSize = Math.min(30, Math.max(14, size));
      localStorage.setItem('church_bible_font_size', this.fontSize.toString());
      this.applyFontSize();
    }

    applyFontSize() {
      if (this.container) {
        this.container.style.setProperty('--bible-verse-font-size', `${this.fontSize}px`);
      }
    }

    showLoading() {
      if (!this.container) return;
      this.container.innerHTML = `
        <div class="reader-loading-state">
          <div class="loading-spinner"></div>
          <p>Loading Scripture passage...</p>
        </div>
      `;
    }

    showError(message, retryCallback) {
      if (!this.container) return;
      this.container.innerHTML = `
        <div class="reader-error-state">
          <span class="error-icon">⚠️</span>
          <h3>Unable to Load Chapter</h3>
          <p class="error-message">${message}</p>
          ${retryCallback ? '<button id="btn-reader-retry" class="btn-retry">🔄 Try Again</button>' : ''}
        </div>
      `;
      const btn = this.container.querySelector('#btn-reader-retry');
      if (btn && retryCallback) {
        btn.addEventListener('click', retryCallback);
      }
    }

    renderChapter({ book, chapter, translation, verses, parallelTranslation, parallelVerses, targetVerse = null }) {
      if (!this.container) return;

      this.currentChapterData = { book, chapter, translation, verses, parallelTranslation, parallelVerses };
      this.highlightedVerse = targetVerse;

      const isTelugu = translation === 'telugu';
      const hasParallel = Boolean(parallelTranslation && parallelVerses && parallelVerses.length > 0);

      const headingMain = isTelugu ? book.teluguName : book.name;
      const headingAlt = isTelugu ? book.name : book.teluguName;
      const chapterLabel = isTelugu ? `అధ్యాయము ${chapter}` : `Chapter ${chapter}`;

      let html = `
        <div class="chapter-header">
          <div class="chapter-title-group">
            <h2 class="chapter-heading ${isTelugu ? 'telugu-font' : ''}">${headingMain} ${chapter}</h2>
            <span class="chapter-subheading">${headingAlt} • ${chapterLabel}</span>
          </div>
          <div class="chapter-meta-badges">
            <span class="badge-translation">${translation.toUpperCase()}</span>
            ${hasParallel ? `<span class="badge-parallel">+ ${parallelTranslation.toUpperCase()}</span>` : ''}
            <span class="badge-verse-count">${verses.length} ${isTelugu ? 'వాక్యములు' : 'verses'}</span>
          </div>
        </div>
      `;

      if (hasParallel) {
        // PARALLEL BILINGUAL VIEW
        const primaryLabel = translation === 'telugu' ? 'పరిశుద్ధ గ్రంథము (Telugu)' : 'King James Version (English)';
        const parallelLabel = parallelTranslation === 'telugu' ? 'పరిశుద్ధ గ్రంథము (Telugu)' : 'King James Version (English)';

        html += `
          <div class="parallel-header-row">
            <span></span>
            <span class="parallel-col-header">${primaryLabel}</span>
            <span class="parallel-col-header">${parallelLabel}</span>
          </div>
          <div class="verses-parallel-container">
        `;
        for (let i = 0; i < verses.length; i++) {
          const v = verses[i];
          const pv = parallelVerses[i] || { text: '' };
          const vNum = v.verse;
          const isTarget = targetVerse && parseInt(vNum, 10) === parseInt(targetVerse, 10);
          const isBookmarked = window.BibleBookmarks.isBookmarked(book.slug, chapter, vNum, translation);

          html += `
            <div class="verse-row parallel-row ${isTarget ? 'verse-highlighted' : ''}" id="verse-${vNum}" data-verse="${vNum}">
              <div class="verse-number-col">
                <span class="verse-number">${vNum}</span>
                <button class="btn-verse-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                  data-v="${vNum}" title="Bookmark Verse">★</button>
                <button class="btn-verse-copy" data-v="${vNum}" title="Copy Verse">📋</button>
              </div>
              <div class="verse-text-col ${isTelugu ? 'telugu-font' : ''}">
                <span class="verse-col-label">${translation.toUpperCase()}</span>
                <span class="verse-text">${v.text}</span>
              </div>
              <div class="verse-text-col ${parallelTranslation === 'telugu' ? 'telugu-font' : ''}">
                <span class="verse-col-label">${parallelTranslation.toUpperCase()}</span>
                <span class="verse-text">${pv.text}</span>
              </div>
            </div>
          `;
        }
        html += `</div>`;
      } else {
        // SINGLE TRANSLATION VIEW
        html += `<div class="verses-single-container ${isTelugu ? 'telugu-font' : ''}">`;
        for (const v of verses) {
          const vNum = v.verse;
          const isTarget = targetVerse && parseInt(vNum, 10) === parseInt(targetVerse, 10);
          const isBookmarked = window.BibleBookmarks.isBookmarked(book.slug, chapter, vNum, translation);

          html += `
            <div class="verse-item ${isTarget ? 'verse-highlighted' : ''}" id="verse-${vNum}" data-verse="${vNum}">
              <span class="verse-number">${vNum}</span>
              <span class="verse-text">${v.text}</span>
              <div class="verse-actions-bar">
                <button class="btn-verse-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                  data-v="${vNum}" title="Bookmark Verse">★</button>
                <button class="btn-verse-copy" data-v="${vNum}" title="Copy Verse">📋</button>
              </div>
            </div>
          `;
        }
        html += `</div>`;
      }

      this.container.innerHTML = html;

      // Event Listeners for Bookmark & Copy
      this.bindVerseActions(book, chapter, translation, verses);

      // Scroll to target verse if specified
      if (targetVerse) {
        setTimeout(() => {
          const el = document.getElementById(`verse-${targetVerse}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }

    highlightAndScrollVerse(verseNum) {
      if (!this.container) return;

      // Remove existing highlight
      this.container.querySelectorAll('.verse-highlighted').forEach(el => {
        el.classList.remove('verse-highlighted');
      });

      this.highlightedVerse = verseNum ? parseInt(verseNum, 10) : null;

      if (this.highlightedVerse) {
        const el = document.getElementById(`verse-${this.highlightedVerse}`);
        if (el) {
          el.classList.add('verse-highlighted');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        const chapterHeader = this.container.querySelector('.chapter-header');
        if (chapterHeader) {
          chapterHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    bindVerseActions(book, chapter, translation, verses) {
      // Bookmark buttons
      this.container.querySelectorAll('.btn-verse-bookmark').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const vNum = btn.getAttribute('data-v');
          const verseObj = verses.find(v => String(v.verse) === String(vNum));
          if (!verseObj) return;

          const res = window.BibleBookmarks.toggleBookmark({
            bookId: book.id,
            bookSlug: book.slug,
            bookName: book.name,
            teluguBookName: book.teluguName,
            chapter: chapter,
            verse: vNum,
            text: verseObj.text,
            translation: translation
          });

          if (res.bookmarked) {
            btn.classList.add('bookmarked');
            if (window.showToast) window.showToast(`Bookmark saved: ${book.name} ${chapter}:${vNum}`);
          } else {
            btn.classList.remove('bookmarked');
            if (window.showToast) window.showToast(`Bookmark removed: ${book.name} ${chapter}:${vNum}`);
          }

          if (this.onBookmarkToggled) {
            this.onBookmarkToggled();
          }
        });
      });

      // Copy buttons
      this.container.querySelectorAll('.btn-verse-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const vNum = btn.getAttribute('data-v');
          const verseObj = verses.find(v => String(v.verse) === String(vNum));
          if (!verseObj) return;

          const isTelugu = translation === 'telugu';
          const ref = isTelugu ? `${book.teluguName} ${chapter}:${vNum}` : `${book.name} ${chapter}:${vNum}`;
          const copyText = `“${verseObj.text}” — ${ref} (${translation.toUpperCase()})`;

          navigator.clipboard.writeText(copyText).then(() => {
            btn.textContent = '✓';
            if (window.showToast) window.showToast(`Copied ${ref} to clipboard`);
            setTimeout(() => { btn.textContent = '📋'; }, 1500);
          });
        });
      });
    }
  }

  window.BibleReader = new BibleReader();
})(window);
