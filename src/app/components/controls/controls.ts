import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.html',
  styleUrl: './controls.css',
})
export class Controls {
  readonly excludeSpaces = input(false);
  readonly limitEnabled = input(false);
  readonly limitValue = input<number | null>(null);
  readonly readingTime = input('<1 minute');

  readonly excludeSpacesChange = output<boolean>();
  readonly limitEnabledChange = output<boolean>();
  readonly limitValueChange = output<number | null>();

  protected onExcludeSpacesChange(event: Event): void {
    this.excludeSpacesChange.emit((event.target as HTMLInputElement).checked);
  }

  protected onLimitEnabledChange(event: Event): void {
    this.limitEnabledChange.emit((event.target as HTMLInputElement).checked);
  }

  protected onLimitValueChange(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = parseInt(raw, 10);
    this.limitValueChange.emit(Number.isNaN(parsed) ? null : parsed);
  }

  protected onLabelKeydown(event: KeyboardEvent, checkbox: HTMLInputElement): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}
