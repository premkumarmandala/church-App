/**
 * Bible Search Module
 * Implements full-text Scripture search, reference detection, online & offline fallback, and highlighting.
 */

(function (window) {
  'use strict';

  class BibleSearch {
    constructor() {
      this.currentQuery = '';
      this.lastResults = [];
      this.onNavigate = null;
    }

    init(onNavigate) {
      this.onNavigate = onNavigate;
    }

    // Detect if user typed a direct scripture reference, e.g. "John 3:16" or "Genesis 1" or "కీర్తనలు 23"
    parseReference(query, booksList) {
      if (!query || !booksList) return null;
      const clean = query.trim();

      // Pattern: [Book Name] [Chapter]:[Verse] or [Book Name] [Chapter]
      const match = clean.match(/^([1-3]?\s?[A-Za-z\u0C00-\u0C7F]+)\s+(\d+)(?::(\d+))?$/);
      if (!match) return null;

      const rawBook = match[1].trim().toLowerCase();
      const ch = parseInt(match[2], 10);
      const v = match[3] ? parseInt(match[3], 10) : 1;

      const matchedBook = booksList.find(b => 
        b.name.toLowerCase() === rawBook ||
        b.slug === rawBook ||
        b.teluguName.toLowerCase() === rawBook ||
        b.name.toLowerCase().replace(/\s+/g, '') === rawBook.replace(/\s+/g, '')
      );

      if (matchedBook && ch >= 1 && ch <= matchedBook.chaptersCount) {
        return {
          bookSlug: matchedBook.slug,
          chapter: ch,
          verse: v,
          bookName: matchedBook.name,
          teluguBookName: matchedBook.teluguName
        };
      }
      return null;
    }

    async search({ query, translation, testament = 'all', booksList }) {
      this.currentQuery = (query || '').trim();
      if (!this.currentQuery) {
        return { query: '', total: 0, results: [], empty: true };
      }

      // Check direct reference
      const refMatch = this.parseReference(this.currentQuery, booksList);

      // Try Online API search first
      if (navigator.onLine) {
        try {
          const apiBase = window.API_BASE_URL || '';
          const params = new URLSearchParams({
            q: this.currentQuery,
            translation: translation,
            testament: testament,
            limit: '50'
          });
          const res = await fetch(`${apiBase}/api/bible/search?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            data.referenceMatch = refMatch;
            this.lastResults = data.results;
            return data;
          }
        } catch (netErr) {
          console.warn('[Search] API request failed, trying offline cache search:', netErr);
        }
      }

      // Fallback: Offline client search across cached books in Cache API
      return await this.searchOffline({ query: this.currentQuery, translation, testament, booksList, refMatch });
    }

    async searchOffline({ query, translation, testament, booksList, refMatch }) {
      const cleanQ = query.toLowerCase();
      const results = [];
      const targetBooks = (booksList || []).filter(b => {
        if (testament !== 'all' && b.testament.toLowerCase() !== testament.toLowerCase()) return false;
        return true;
      });

      for (const b of targetBooks) {
        const fileName = translation === 'telugu' ? b.teluguFile : b.kjvFile;
        const cachedData = await window.BibleOffline.getCachedBook(translation, fileName);
        if (!cachedData || !cachedData.chapters) continue;

        for (const ch of cachedData.chapters) {
          const chNum = ch.chapter;
          for (const v of ch.verses) {
            const text = v.text || '';
            const matchIndex = text.toLowerCase().indexOf(cleanQ);
            if (matchIndex !== -1) {
              results.push({
                bookId: b.id,
                bookSlug: b.slug,
                bookName: b.name,
                teluguBookName: b.teluguName,
                chapter: parseInt(chNum, 10),
                verse: parseInt(v.verse, 10),
                referenceEn: `${b.name} ${chNum}:${v.verse}`,
                referenceTe: `${b.teluguName} ${chNum}:${v.verse}`,
                text: text,
                translation: translation
              });
              if (results.length >= 50) break;
            }
          }
          if (results.length >= 50) break;
        }
        if (results.length >= 50) break;
      }

      this.lastResults = results;
      return {
        query,
        translation,
        testament,
        total: results.length,
        offline: true,
        referenceMatch: refMatch,
        results
      };
    }

    highlight(text, query) {
      if (!query || !text) return text;
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    renderResults(container, searchData, isTelugu) {
      if (!container) return;

      if (!searchData || searchData.empty) {
        container.innerHTML = `
          <div class="search-empty-state">
            <span class="empty-icon">🔍</span>
            <h3>${isTelugu ? 'పరిశుద్ధ గ్రంథంలో వెతకండి' : 'Search the Holy Scriptures'}</h3>
            <p>${isTelugu ? 'పదం, వాక్యము లేదా అధ్యాయం సంఖ్యను నమోదు చేయండి (ఉదా: ప్రేమ, నిత్యజీవము, యోహాను 3:16).' : 'Enter a word, phrase, or passage reference (e.g., love, salvation, John 3:16).'}</p>
          </div>
        `;
        return;
      }

      if (searchData.total === 0) {
        container.innerHTML = `
          <div class="search-empty-state not-found">
            <span class="empty-icon">📖</span>
            <h3>${isTelugu ? 'ఫలితాలు కనుగొనబడలేదు' : 'No Verses Found'}</h3>
            <p>${isTelugu 
              ? `"${searchData.query}" కొరకు ఏ వాక్యములు దొరకలేదు. దయచేసి వేరే పదం లేదా సరైన అక్షరక్రమంతో ప్రయత్నించండి.`
              : `No verses found matching "${searchData.query}" in the selected translation. Try searching for a different keyword or check spelling.`}
            </p>
          </div>
        `;
        return;
      }

      let html = '';

      // Direct Reference Suggestion
      if (searchData.referenceMatch) {
        const ref = searchData.referenceMatch;
        const refText = isTelugu ? `${ref.teluguBookName} ${ref.chapter}:${ref.verse}` : `${ref.bookName} ${ref.chapter}:${ref.verse}`;
        html += `
          <div class="direct-ref-card">
            <div class="direct-ref-info">
              <span class="direct-ref-tag">📍 ${isTelugu ? 'ఖచ్చితమైన అధ్యాయం' : 'Exact Scripture Reference'}</span>
              <h4>${refText}</h4>
            </div>
            <button class="btn-jump-ref" data-slug="${ref.bookSlug}" data-ch="${ref.chapter}" data-v="${ref.verse}">
              ${isTelugu ? 'నేరుగా వెళ్ళండి' : 'Jump Directly'} ➔
            </button>
          </div>
        `;
      }

      html += `
        <div class="search-summary-bar">
          <span>${isTelugu ? 'కనుగొనబడిన వాక్యాలు:' : 'Matching Verses:'} <strong>${searchData.total}</strong></span>
          ${searchData.offline ? `<span class="badge-offline-search">⚡ ${isTelugu ? 'ఆఫ్‌లైన్ శోధన' : 'Offline Cached Search'}</span>` : ''}
        </div>
        <div class="search-results-list">
      `;

      for (const res of searchData.results) {
        const displayRef = isTelugu ? res.referenceTe : res.referenceEn;
        const highlightedText = this.highlight(res.text, searchData.query);

        html += `
          <div class="search-result-item" data-slug="${res.bookSlug}" data-ch="${res.chapter}" data-v="${res.verse}">
            <div class="result-header">
              <span class="result-reference">${displayRef}</span>
              <span class="result-version-badge">${res.translation.toUpperCase()}</span>
            </div>
            <div class="result-body ${res.translation === 'telugu' ? 'telugu-font' : ''}">
              ${highlightedText}
            </div>
          </div>
        `;
      }

      html += `</div>`;
      container.innerHTML = html;

      // Event delegation for clicks
      container.querySelectorAll('.search-result-item, .btn-jump-ref').forEach(el => {
        el.addEventListener('click', () => {
          const slug = el.getAttribute('data-slug');
          const ch = parseInt(el.getAttribute('data-ch'), 10);
          const v = parseInt(el.getAttribute('data-v'), 10);
          if (this.onNavigate) {
            this.onNavigate(slug, ch, v);
          }
        });
      });
    }
  }

  window.BibleSearch = new BibleSearch();
})(window);
