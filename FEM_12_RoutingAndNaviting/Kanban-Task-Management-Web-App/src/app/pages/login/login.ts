import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  login(): void {
    this.auth.login();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/settings';
    this.router.navigateByUrl(returnUrl);
  }
}
