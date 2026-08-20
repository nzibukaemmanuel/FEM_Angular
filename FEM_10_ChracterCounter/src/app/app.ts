import { Component, inject } from '@angular/core';
import { Controls } from './components/controls/controls';
import { Header } from './components/header/header';
import { LetterDensity } from './components/letter-density/letter-density';
import { StatsCards } from './components/stats-cards/stats-cards';
import { TextEditor } from './components/text-editor/text-editor';
import { TextCounter } from './services/text-counter';
import { Theme } from './services/theme';

@Component({
  selector: 'app-root',
  imports: [Header, TextEditor, Controls, StatsCards, LetterDensity],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly counter = inject(TextCounter);
  private readonly theme = inject(Theme);

  protected readonly text = this.counter.text;
  protected readonly excludeSpaces = this.counter.excludeSpaces;
  protected readonly limitEnabled = this.counter.limitEnabled;
  protected readonly limitValue = this.counter.limitValue;
  protected readonly readingTime = this.counter.readingTime;
  protected readonly totalCharacters = this.counter.totalCharacters;
  protected readonly wordCount = this.counter.wordCount;
  protected readonly lineCount = this.counter.lineCount;
  protected readonly overLimit = this.counter.overLimit;
  protected readonly visibleDensity = this.counter.visibleDensity;
  protected readonly densityExpanded = this.counter.densityExpanded;
  protected readonly canExpandDensity = this.counter.canExpandDensity;
  protected readonly isLightTheme = this.theme.isLight;

  protected onTextChange(text: string): void {
    this.counter.setText(text);
  }

  protected onExcludeSpacesChange(exclude: boolean): void {
    this.counter.setExcludeSpaces(exclude);
  }

  protected onLimitEnabledChange(enabled: boolean): void {
    this.counter.setLimitEnabled(enabled);
  }

  protected onLimitValueChange(limit: number | null): void {
    this.counter.setLimitValue(limit);
  }

  protected onToggleDensity(): void {
    this.counter.toggleDensityExpanded();
  }

  protected onThemeToggle(): void {
    this.theme.toggle();
  }
}
