import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';

describe('Icon', () => {
  it('should render the requested icon', () => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', 'search');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('should switch icon markup when the name input changes', () => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', 'home');
    fixture.detectChanges();
    const homeSvg = fixture.nativeElement.querySelector('svg').outerHTML;

    fixture.componentRef.setInput('name', 'heart');
    fixture.detectChanges();
    const heartSvg = fixture.nativeElement.querySelector('svg').outerHTML;

    expect(homeSvg).not.toBe(heartSvg);
  });

  it('should render a filled variant when requested for icons that support it', () => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', 'heart');
    fixture.componentRef.setInput('filled', false);
    fixture.detectChanges();
    const outline = fixture.nativeElement.querySelector('svg').getAttribute('fill');

    fixture.componentRef.setInput('filled', true);
    fixture.detectChanges();
    const filled = fixture.nativeElement.querySelector('svg').getAttribute('fill');

    expect(outline).toBe('none');
    expect(filled).toBe('currentColor');
  });
});
