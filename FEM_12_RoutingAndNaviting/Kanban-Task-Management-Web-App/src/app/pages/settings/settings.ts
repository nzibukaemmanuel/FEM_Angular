import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentWithUnsavedChanges } from '../../core/unsaved-changes.guard';

@Component({
  imports: [],
  selector: 'app-settings',
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
export class Settings implements ComponentWithUnsavedChanges {
  private readonly router = inject(Router);

  readonly displayName = signal('Ada');
  private readonly dirty = signal(false);

  onDisplayNameInput(value: string): void {
    this.displayName.set(value);
    this.dirty.set(true);
  }

  hasUnsavedChanges(): boolean {
    return this.dirty();
  }

  save(): void {
    this.dirty.set(false);
    this.router.navigate(['/boards']);
  }
}
