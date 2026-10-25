/**
 * Bible Daily Verse Component
 * Loads and displays the daily scripture passage with navigation to full chapter.
 */

(function (window) {
  'use strict';

  class BibleDailyVerse {
    constructor() {
      this.currentData = null;
      this.container = null;
    }

    async init(containerId, onNavigateToPassage) {
      this.container = document.getElementById(containerId);
      this.onNavigate = onNavigateToPassage;
      await this.loadDailyVerse();
    }

    async loadDailyVerse() {
      try {
        const apiBase = window.API_BASE_URL || '';
        let res = await fetch(${apiBase}/api/bible/daily-verse);
        if (!res.ok) throw new Error('API request failed');
        this.currentData = await res.json();
      } catch (err) {
        console.warn('[DailyVerse] API fetch failed, loading from local daily-verses.json:', err);
        try {
          const apiBase = window.API_BASE_URL || '';
          const res = await fetch(${apiBase}/bible-data/daily-verses.json);
          const allVerses = await res.json();
          const now = new Date();
          const start = new Date(now.getFullYear(), 0, 0);
          const diff = now - start;
          const dayOfYear = Math.min(allVerses.length, Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24))));
          this.currentData = allVerses[dayOfYear - 1] || allVerses[0];
        } catch (e2) {
          console.error('[DailyVerse] Fallback failed:', e2);
        }
      }

      this.render();
    }

    render() {
      if (!this.container || !this.currentData) return;

      const activeTranslation = window.BibleState ? window.BibleState.translation : 'kjv';
      const isTelugu = activeTranslation === 'telugu';

      const ref = isTelugu ? this.currentData.referenceTe : this.currentData.referenceEn;
      const text = isTelugu ? this.currentData.teluguText : this.currentData.kjvText;
      const altRef = isTelugu ? this.currentData.referenceEn : this.currentData.referenceTe;

      this.container.innerHTML = `
        <div class="daily-verse-card">
          <div class="daily-verse-badge">
            <span class="badge-icon">✨</span>
            <span class="badge-text">${isTelugu ? 'ఈ దినపు వాక్యము' : 'Verse of the Day'}</span>
            <span class="badge-date">${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
          <blockquote class="daily-verse-text ${isTelugu ? 'telugu-font' : ''}">
            “${text}”
          </blockquote>
          <div class="daily-verse-meta">
            <div class="verse-reference-group">
              <span class="daily-verse-ref">${ref}</span>
              <span class="daily-verse-alt-ref">(${altRef})</span>
            </div>
            <div class="daily-verse-actions">
              <button class="btn-daily-action" id="btn-read-chapter" title="Read Full Chapter">
                📖 ${isTelugu ? 'పూర్తి అధ్యాయం చదవండి' : 'Read Full Chapter'}
              </button>
              <button class="btn-daily-action btn-copy-daily" id="btn-copy-daily" title="Copy Verse">
                📋
              </button>
            </div>
          </div>
        </div>
      `;

      const readBtn = this.container.querySelector('#btn-read-chapter');
      if (readBtn) {
        readBtn.addEventListener('click', () => {
          if (this.onNavigate) {
            this.onNavigate(this.currentData.bookSlug, this.currentData.chapter, this.currentData.verse);
          }
        });
      }

      const copyBtn = this.container.querySelector('#btn-copy-daily');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const shareText = `“${text}” — ${ref}`;
          navigator.clipboard.writeText(shareText).then(() => {
            copyBtn.textContent = '✓ Copied';
            setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
          });
        });
      }
    }
  }

  window.BibleDailyVerse = new BibleDailyVerse();
})(window);
