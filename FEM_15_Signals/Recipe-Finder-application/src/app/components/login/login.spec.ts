import { TestBed } from '@angular/core/testing';
import { Login } from './login';

describe('Login', () => {
  function setup() {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    return fixture;
  }

  function fillAndSubmit(fixture: ReturnType<typeof setup>, username: string, password: string) {
    fixture.nativeElement.querySelector('#login-username').value = username;
    fixture.nativeElement.querySelector('#login-password').value = password;
    fixture.nativeElement.querySelector('.login-submit').click();
    fixture.detectChanges();
  }

  it('should show the login form when logged out', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('#login-username')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#login-password')).toBeTruthy();
  });

  it('should mark both fields as required', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('#login-username').required).toBe(true);
    expect(fixture.nativeElement.querySelector('#login-password').required).toBe(true);
  });

  it('should reject an empty submission and show both required errors', () => {
    const fixture = setup();
    fixture.nativeElement.querySelector('.login-submit').click();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('.login-error');
    expect(errors.length).toBe(2);
    expect(errors[0].textContent).toContain('required');
    expect(errors[1].textContent).toContain('required');
  });

  it('should reject a username/password combo that does not match the valid credentials', () => {
    const fixture = setup();
    const emitted: string[] = [];
    fixture.componentInstance.loggedIn.subscribe((name) => emitted.push(name));
    const failed: string[] = [];
    fixture.componentInstance.loginFailed.subscribe((message) => failed.push(message));

    fillAndSubmit(fixture, 'wrong-user', 'wrong-pass');

    expect(emitted).toEqual([]);
    expect(failed).toEqual(['Incorrect username or password.']);
    expect(fixture.nativeElement.querySelectorAll('.login-error').length).toBe(2);
  });

  it('should reject the correct username with the wrong password', () => {
    const fixture = setup();
    const emitted: string[] = [];
    fixture.componentInstance.loggedIn.subscribe((name) => emitted.push(name));

    fillAndSubmit(fixture, 'NZIBUKA', 'wrong-pass');

    expect(emitted).toEqual([]);
  });

  it('should emit loggedIn only for the exact valid credentials', () => {
    const fixture = setup();
    const emitted: string[] = [];
    fixture.componentInstance.loggedIn.subscribe((name) => emitted.push(name));

    fillAndSubmit(fixture, '  NZIBUKA  ', 'MANNAZ789@');

    expect(emitted).toEqual(['NZIBUKA']);
    expect(fixture.nativeElement.querySelectorAll('.login-error').length).toBe(0);
  });

  it('should toggle password visibility', () => {
    const fixture = setup();
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('#login-password');
    expect(passwordInput.type).toBe('password');

    fixture.nativeElement.querySelector('.password-toggle').click();
    fixture.detectChanges();
    expect(passwordInput.type).toBe('text');

    fixture.nativeElement.querySelector('.password-toggle').click();
    fixture.detectChanges();
    expect(passwordInput.type).toBe('password');
  });

  it('should show a welcome message and emit loggedOut when already logged in', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.componentRef.setInput('username', 'NZIBUKA');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Welcome, NZIBUKA');

    const emitted: void[] = [];
    fixture.componentInstance.loggedOut.subscribe(() => emitted.push(undefined));
    fixture.nativeElement.querySelector('.login-submit').click();

    expect(emitted.length).toBe(1);
  });
});
