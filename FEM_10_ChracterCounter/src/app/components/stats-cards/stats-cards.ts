import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-stats-cards',
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.css',
})
export class StatsCards {
  readonly totalCharacters = input(0);
  readonly wordCount = input(0);
  readonly lineCount = input(0);
  readonly overLimit = input(false);

  protected readonly paddedLineCount = computed(() => {
    const text = String(this.lineCount());
    return text.length < 2 ? `0${text}` : text;
  });
}
