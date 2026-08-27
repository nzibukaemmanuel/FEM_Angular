import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  let fixture: ComponentFixture<TaskForm>;
  let component: TaskForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function titleInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="text"]');
  }

  function submitForm(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts blank and pristine when no initial task is given', () => {
    expect(titleInput().value).toBe('');
    expect(component.isDirty()).toBe(false);
  });

  it('prefills from the initial task and stays pristine', () => {
    fixture.componentRef.setInput('initialTask', { id: 't1', title: 'Write docs', status: 'doing' });
    fixture.detectChanges();

    expect(titleInput().value).toBe('Write docs');
    expect(component.isDirty()).toBe(false);
  });

  it('becomes dirty once the title is edited', () => {
    titleInput().value = 'New title';
    titleInput().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.isDirty()).toBe(true);
  });

  it('rejects an empty title and shows a validation message instead of emitting save', () => {
    const emitted: unknown[] = [];
    component.save.subscribe((value) => emitted.push(value));

    submitForm();

    expect(emitted).toEqual([]);
    expect(fixture.nativeElement.querySelector('.field-error')?.textContent).toContain('required');
  });

  it('emits the trimmed title and current status on valid submit', () => {
    const emitted: unknown[] = [];
    component.save.subscribe((value) => emitted.push(value));

    titleInput().value = '  Ship it  ';
    titleInput().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    submitForm();

    expect(emitted).toEqual([{ title: 'Ship it', status: 'todo' }]);
  });

  it('emits cancel when the cancel button is clicked', () => {
    const emitted: unknown[] = [];
    component.cancel.subscribe(() => emitted.push(true));

    (fixture.nativeElement.querySelector('.task-form__actions button[type="button"]') as HTMLButtonElement).click();

    expect(emitted).toEqual([true]);
  });
});
