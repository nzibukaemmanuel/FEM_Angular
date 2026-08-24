import { Injectable, computed, signal } from '@angular/core';
import { LetterStat } from '../models/letter-stat.model';

const AVG_READING_WPM = 200;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const DEFAULT_TEXT =
  'Design is the silent ambassador of your brand. Simplicity is key to effective ' +
  'communication, creating clarity in every interaction. A great design transforms complex ' +
  'ideas into elegant solutions, making them easy to understand. It blends aesthetics and ' +
  'functionality seamlessly.';
const COLLAPSED_ROW_COUNT = 6;

@Injectable({ providedIn: 'root' })
export class TextCounter {
  private readonly _text = signal(DEFAULT_TEXT);
  private readonly _excludeSpaces = signal(false);
  private readonly _limitEnabled = signal(false);
  private readonly _limitValue = signal<number | null>(null);
  private readonly _densityExpanded = signal(false);

  readonly text = this._text.asReadonly();
  readonly excludeSpaces = this._excludeSpaces.asReadonly();
  readonly limitEnabled = this._limitEnabled.asReadonly();
  readonly limitValue = this._limitValue.asReadonly();
  readonly densityExpanded = this._densityExpanded.asReadonly();

  readonly totalCharacters = computed(() => this.countCharacters(this._text()));

  readonly wordCount = computed(() => {
    const trimmed = this._text().trim();
    return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  });

  readonly lineCount = computed(() => {
    const text = this._text();
    return text === '' ? 0 : text.split('\n').length;
  });

  readonly readingTime = computed(() => {
    const minutes = this.wordCount() / AVG_READING_WPM;
    if (minutes < 1) {
      return '<1 minute';
    }
    const rounded = Math.round(minutes);
    return `${rounded} minute${rounded === 1 ? '' : 's'}`;
  });

  private readonly activeLimit = computed(() => {
    const limit = this._limitValue();
    return this._limitEnabled() && limit !== null && limit > 0 ? limit : null;
  });

  readonly overLimit = computed(() => {
    const limit = this.activeLimit();
    return limit !== null && this.totalCharacters() >= limit;
  });

  private readonly letterCounts = computed(() => {
    const counts: Partial<Record<string, number>> = {};
    let total = 0;
    for (const char of this._text().toLowerCase()) {
      if (/[a-z]/.test(char)) {
        counts[char] = (counts[char] ?? 0) + 1;
        total += 1;
      }
    }
    return { counts, total };
  });

  readonly letterDensity = computed<LetterStat[]>(() => {
    const { counts, total } = this.letterCounts();
    const maxCount = Object.values(counts).reduce((highest, count) => Math.max(highest ?? 0, count ?? 0), 0);

    return ALPHABET.map((letter) => {
      const count = counts[letter] ?? 0;
      return {
        letter,
        count,
        percent: total ? (count / total) * 100 : 0,
        barPercent: maxCount ? (count / maxCount) * 100 : 0,
      };
    });
  });

  readonly letteredCharacterCount = computed(() => this.letterCounts().total);

  readonly canExpandDensity = computed(() => this.letteredCharacterCount() > COLLAPSED_ROW_COUNT);

  readonly visibleDensity = computed(() => {
    const density = this.letterDensity();
    return this._densityExpanded() || !this.canExpandDensity()
      ? density
      : density.slice(0, COLLAPSED_ROW_COUNT);
  });

  setText(text: string): void {
    this._text.set(this.enforceLimit(text));
  }

  enforceLimit(text: string): string {
    const limit = this.activeLimit();
    return limit !== null ? this.truncateToLimit(text, limit) : text;
  }

  setExcludeSpaces(exclude: boolean): void {
    this._excludeSpaces.set(exclude);
    this.reapplyLimit();
  }

  setLimitEnabled(enabled: boolean): void {
    this._limitEnabled.set(enabled);
    this.reapplyLimit();
  }

  setLimitValue(limit: number | null): void {
    this._limitValue.set(limit);
    this.reapplyLimit();
  }

  toggleDensityExpanded(): void {
    this._densityExpanded.update((expanded) => !expanded);
  }

  private reapplyLimit(): void {
    const limit = this.activeLimit();
    if (limit === null) {
      return;
    }
    this._text.update((text) =>
      this.countCharacters(text) > limit ? this.truncateToLimit(text, limit) : text,
    );
  }

  private countCharacters(text: string): number {
    return this._excludeSpaces() ? text.replace(/\s/g, '').length : text.length;
  }

  private truncateToLimit(text: string, limit: number): string {
    if (!this._excludeSpaces()) {
      return text.slice(0, limit);
    }
    let nonSpaceCount = 0;
    for (let i = 0; i < text.length; i += 1) {
      if (!/\s/.test(text[i])) {
        nonSpaceCount += 1;
        if (nonSpaceCount === limit) {
          return text.slice(0, i + 1);
        }
      }
    }
    return text;
  }
}
