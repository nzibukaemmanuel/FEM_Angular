import { TestBed } from '@angular/core/testing';
import { Toast } from './toast';

describe('Toast', () => {
  it('should render nothing when there is no message', () => {
    const fixture = TestBed.createComponent(Toast);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.toast')).toBeFalsy();
  });

  it('should render the message with the correct type class', () => {
    const fixture = TestBed.createComponent(Toast);
    fixture.componentRef.setInput('toast', { type: 'error', text: 'Something went wrong' });
    fixture.detectChanges();

    const toastEl: HTMLElement = fixture.nativeElement.querySelector('.toast');
    expect(toastEl).toBeTruthy();
    expect(toastEl.classList.contains('toast-error')).toBe(true);
    expect(toastEl.textContent).toContain('Something went wrong');
  });

  it('should emit dismissed when the close button is clicked', () => {
    const fixture = TestBed.createComponent(Toast);
    fixture.componentRef.setInput('toast', { type: 'success', text: 'Done!' });
    fixture.detectChanges();

    const emitted: void[] = [];
    fixture.componentInstance.dismissed.subscribe(() => emitted.push(undefined));
    fixture.nativeElement.querySelector('.toast-close').click();

    expect(emitted.length).toBe(1);
  });
});
