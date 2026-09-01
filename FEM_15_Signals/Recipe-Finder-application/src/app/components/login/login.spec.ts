import { TestBed } from '@angular/core/testing';
import { Login } from './login';

describe('Login', () => {
  function setup() {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    return fixture;
  }

  it('should show the login form when logged out', () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('#login-username')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#login-password')).toBeTruthy();
  });

  it('should reject an empty submission and show both errors', () => {
    const fixture = setup();
    fixture.nativeElement.querySelector('.login-submit').click();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('.login-error');
    expect(errors.length).toBe(2);
  });

  it('should reject a username or password that is too short', () => {
    const fixture = setup();
    fixture.nativeElement.querySelector('#login-username').value = 'ab';
    fixture.nativeElement.querySelector('#login-password').value = '12345';
    fixture.nativeElement.querySelector('.login-submit').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.login-error').length).toBe(2);
    const emitted: string[] = [];
    fixture.componentInstance.loggedIn.subscribe((name) => emitted.push(name));
    expect(emitted).toEqual([]);
  });

  it('should emit loggedIn with the trimmed username once both fields are valid', () => {
    const fixture = setup();
    const emitted: string[] = [];
    fixture.componentInstance.loggedIn.subscribe((name) => emitted.push(name));

    fixture.nativeElement.querySelector('#login-username').value = '  Ama  ';
    fixture.nativeElement.querySelector('#login-password').value = 'secret123';
    fixture.nativeElement.querySelector('.login-submit').click();
    fixture.detectChanges();

    expect(emitted).toEqual(['Ama']);
    expect(fixture.nativeElement.querySelectorAll('.login-error').length).toBe(0);
  });

  it('should show a welcome message and emit loggedOut when already logged in', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.componentRef.setInput('username', 'Ama');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Welcome, Ama');

    const emitted: void[] = [];
    fixture.componentInstance.loggedOut.subscribe(() => emitted.push(undefined));
    fixture.nativeElement.querySelector('.login-submit').click();

    expect(emitted.length).toBe(1);
  });
});
