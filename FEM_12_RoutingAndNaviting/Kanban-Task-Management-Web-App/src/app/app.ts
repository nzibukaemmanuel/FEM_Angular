import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);

  protected readonly isNavigating = signal(false);
  protected readonly navigationError = signal<string | null>(null);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => this.onRouterEvent(event));
  }

  protected onRouterEvent(event: unknown): void {
    if (event instanceof NavigationStart) {
      // Route change requested — start of the navigation lifecycle.
      this.isNavigating.set(true);
      this.navigationError.set(null);
    } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
      // Completed (NavigationEnd) or aborted, e.g. by a guard (NavigationCancel).
      this.isNavigating.set(false);
    } else if (event instanceof NavigationError) {
      // A guard/resolver/lazy-chunk load threw — surface it instead of leaving the UI stuck loading.
      this.isNavigating.set(false);
      this.navigationError.set('Something went wrong while loading that page.');
    }
  }

  protected dismissError(): void {
    this.navigationError.set(null);
  }
}
