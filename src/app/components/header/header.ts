import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly isLightTheme = input(false);
  readonly themeToggle = output<void>();

  protected onThemeToggle(): void {
    this.themeToggle.emit();
  }
}
