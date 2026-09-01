import { Component, input, output, signal } from '@angular/core';

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly username = input<string | null>(null);
  readonly loggedIn = output<string>();
  readonly loggedOut = output<void>();

  protected readonly usernameError = signal<string | null>(null);
  protected readonly passwordError = signal<string | null>(null);

  protected submit(username: string, password: string): void {
    const trimmedUsername = username.trim();
    const usernameValid = trimmedUsername.length >= MIN_USERNAME_LENGTH;
    const passwordValid = password.length >= MIN_PASSWORD_LENGTH;

    this.usernameError.set(
      usernameValid ? null : `Username must be at least ${MIN_USERNAME_LENGTH} characters.`,
    );
    this.passwordError.set(
      passwordValid ? null : `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );

    if (usernameValid && passwordValid) {
      this.loggedIn.emit(trimmedUsername);
    }
  }

  protected logout(): void {
    this.loggedOut.emit();
  }
}
