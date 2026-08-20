import { Component, input, output } from '@angular/core';
import { LetterStat } from '../../models/letter-stat.model';

@Component({
  selector: 'app-letter-density',
  templateUrl: './letter-density.html',
  styleUrl: './letter-density.css',
})
export class LetterDensity {
  readonly rows = input.required<LetterStat[]>();
  readonly expanded = input(false);
  readonly canExpand = input(false);

  readonly toggle = output<void>();

  protected onToggle(): void {
    this.toggle.emit();
  }
}
