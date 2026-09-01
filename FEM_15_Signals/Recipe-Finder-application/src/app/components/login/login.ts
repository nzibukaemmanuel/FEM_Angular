import { Component, input, output, signal } from '@angular/core';

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly username = input<string | null>(null);
  readonly loggedIn = output<string>();
  readonly loggedOut = output<void>();
  readonly loginFailed = output<string>();

  protected readonly usernameError = signal<string | null>(null);
  protected readonly passwordError = signal<string | null>(null);

  protected submit(username: string, password: string): void {
    const trimmedUsername = username.trim();
    const usernameValid = trimmedUsername.length >= MIN_USERNAME_LENGTH;
    const passwordValid = password.length >= MIN_PASSWORD_LENGTH;

    const usernameMessage = usernameValid
      ? null
      : `Username must be at least ${MIN_USERNAME_LENGTH} characters.`;
    const passwordMessage = passwordValid
      ? null
      : `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

    this.usernameError.set(usernameMessage);
    this.passwordError.set(passwordMessage);

    if (usernameValid && passwordValid) {
      this.loggedIn.emit(trimmedUsername);
      return;
    }

    this.loginFailed.emit([usernameMessage, passwordMessage].filter(Boolean).join(' '));
  }

  protected logout(): void {
    this.loggedOut.emit();
  }
}
