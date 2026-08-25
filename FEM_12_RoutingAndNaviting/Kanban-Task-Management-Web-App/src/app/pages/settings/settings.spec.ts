import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Settings } from './settings';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates back to /boards on save', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.save();

    expect(navigateSpy).toHaveBeenCalledWith(['/boards']);
  });

  it('has no unsaved changes until the display name is edited', () => {
    expect(component.hasUnsavedChanges()).toBe(false);

    component.onDisplayNameInput('Grace');

    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('clears the unsaved-changes flag on save', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.onDisplayNameInput('Grace');
    expect(component.hasUnsavedChanges()).toBe(true);

    component.save();

    expect(component.hasUnsavedChanges()).toBe(false);
  });
});
