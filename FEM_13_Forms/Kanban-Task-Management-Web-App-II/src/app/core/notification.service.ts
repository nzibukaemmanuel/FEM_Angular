import { Injectable, signal } from '@angular/core';

export interface Notice {
  readonly message: string;
  readonly kind: 'success' | 'error';
}

const SUCCESS_AUTO_DISMISS_MS = 4000;

// App-wide "here's the outcome of what you just did" banner, backed by a single signal so any
// component can post one (task saved, save failed, ...) without owning display state itself.
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly current = signal<Notice | null>(null);
  readonly notice = this.current.asReadonly();

  private dismissTimer: ReturnType<typeof setTimeout> | undefined;

  // Success notices are informational and self-clear; errors stay until the user dismisses
  // them, since missing one could mean losing track of data that didn't actually save.
  success(message: string): void {
    this.show({ message, kind: 'success' }, SUCCESS_AUTO_DISMISS_MS);
  }

  error(message: string): void {
    this.show({ message, kind: 'error' }, null);
  }

  dismiss(): void {
    clearTimeout(this.dismissTimer);
    this.current.set(null);
  }

  private show(notice: Notice, autoDismissMs: number | null): void {
    clearTimeout(this.dismissTimer);
    this.current.set(notice);
    if (autoDismissMs !== null) {
      this.dismissTimer = setTimeout(() => this.current.set(null), autoDismissMs);
    }
  }
}
