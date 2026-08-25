import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../core/auth.service';

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Present only when authGuard bounced the user here — lets the template explain *why*
  // they landed on the login page instead of the page they asked for.
  readonly returnUrl = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('returnUrl'))),
    { initialValue: this.route.snapshot.queryParamMap.get('returnUrl') },
  );

  login(): void {
    this.auth.login();
    this.router.navigateByUrl(this.returnUrl() ?? '/settings');
  }
}
