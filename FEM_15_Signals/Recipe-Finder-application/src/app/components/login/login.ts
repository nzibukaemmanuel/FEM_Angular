import { Component, input, output, signal } from '@angular/core';

const VALID_USERNAME = 'NZIBUKA';
const VALID_PASSWORD = 'MANNAZ789@';
const INVALID_CREDENTIALS_MESSAGE = 'Incorrect username or password.';

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
  protected readonly showPassword = signal(false);

  protected submit(username: string, password: string): void {
    const trimmedUsername = username.trim();
    const usernameProvided = trimmedUsername.length > 0;
    const passwordProvided = password.length > 0;

    if (!usernameProvided || !passwordProvided) {
      const usernameMessage = usernameProvided ? null : 'Username is required.';
      const passwordMessage = passwordProvided ? null : 'Password is required.';
      this.usernameError.set(usernameMessage);
      this.passwordError.set(passwordMessage);
      this.loginFailed.emit([usernameMessage, passwordMessage].filter(Boolean).join(' '));
      return;
    }

    if (trimmedUsername !== VALID_USERNAME || password !== VALID_PASSWORD) {
      this.usernameError.set(INVALID_CREDENTIALS_MESSAGE);
      this.passwordError.set(INVALID_CREDENTIALS_MESSAGE);
      this.loginFailed.emit(INVALID_CREDENTIALS_MESSAGE);
      return;
    }

    this.usernameError.set(null);
    this.passwordError.set(null);
    this.loggedIn.emit(trimmedUsername);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected logout(): void {
    this.loggedOut.emit();
  }
}
