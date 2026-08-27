import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/notification.service';
import { SelectField, SelectFieldOption } from '../../../shared/select-field/select-field';
import { Task } from '../board-data';
import { duplicateTitleValidator } from './duplicate-title.validator';

export interface TaskFormValue {
  title: string;
  description: string;
  status: Task['status'];
  dueDate: string;
}

const STATUS_OPTIONS: SelectFieldOption[] = [
  { value: '', label: 'Choose a status…' },
  { value: 'todo', label: 'To do' },
  { value: 'doing', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

// Presentational and reused by both the Add Task and Edit Task routes: it only knows how to
// render/validate a task's fields and emit the result — persistence and navigation stay with
// whichever page component hosts it.
@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, SelectField],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm {
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  readonly initialTask = input<Task | null>(null);
  readonly submitLabel = input('Save task');
  // Sibling task titles on the same board (excluding this task itself, when editing) — feeds
  // the duplicate-title check below.
  readonly existingTitles = input<string[]>([]);

  readonly save = output<TaskFormValue>();
  readonly cancel = output<void>();

  protected readonly statusOptions = STATUS_OPTIONS;
  // SelectField isn't a ControlValueAccessor, so its display value is driven by this signal
  // rather than formControlName; the "status" control below mirrors it purely so
  // Validators.required can participate in the form's overall validity/error display.
  protected readonly status = signal('');

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), duplicateTitleValidator(() => this.existingTitles())]],
    description: ['', [Validators.maxLength(500)]],
    status: ['', [Validators.required]],
    dueDate: [''],
  });

  constructor() {
    // Re-syncs whenever `initialTask` changes, not just once on init: the router reuses this
    // component instance across param changes (e.g. editing task A, then navigating straight to
    // editing task B on the same board), so a one-time read would leave stale form values.
    effect(() => {
      const task = this.initialTask();
      this.form.setValue({
        title: task?.title ?? '',
        description: task?.description ?? '',
        status: task?.status ?? '',
        dueDate: task?.dueDate ?? '',
      });
      this.form.markAsPristine();
      this.status.set(task?.status ?? '');
    });

    // Revalidates the title in isolation when the sibling-title list changes, without touching
    // the rest of the form (a plain form.setValue here would wipe in-progress edits).
    effect(() => {
      this.existingTitles();
      this.form.controls.title.updateValueAndValidity({ emitEvent: false });
    });
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  protected setStatus(value: string): void {
    this.status.set(value);
    this.form.controls.status.setValue(value);
    // setValue() alone doesn't mark a control dirty — that only happens automatically for
    // UI-driven changes via formControlName. Since this update comes from a programmatic call
    // (SelectField isn't a ControlValueAccessor), the dirty/touched flags need setting by hand.
    this.form.controls.status.markAsDirty();
    this.form.controls.status.markAsTouched();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.error('Please fix the highlighted fields before saving.');
      return;
    }
    const { title, description, status, dueDate } = this.form.getRawValue();
    this.save.emit({ title: title.trim(), description: description.trim(), status: status as Task['status'], dueDate });
    this.form.markAsPristine();
  }
}
