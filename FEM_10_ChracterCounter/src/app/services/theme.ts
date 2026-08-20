import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly document = inject(DOCUMENT);

  private readonly _isLight = signal(false);
  readonly isLight = this._isLight.asReadonly();

  toggle(): void {
    this._isLight.update((isLight) => !isLight);
    this.document.body.classList.toggle('light-theme', this._isLight());
  }
}
