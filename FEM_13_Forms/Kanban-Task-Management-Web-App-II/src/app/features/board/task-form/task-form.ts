import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectField, SelectFieldOption } from '../../../shared/select-field/select-field';
import { Task } from '../board-data';

export interface TaskFormValue {
  title: string;
  description: string;
  status: Task['status'];
  dueDate: string;
}

const STATUS_OPTIONS: SelectFieldOption[] = [
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

  readonly initialTask = input<Task | null>(null);
  readonly submitLabel = input('Save task');

  readonly save = output<TaskFormValue>();
  readonly cancel = output<void>();

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly status = signal<Task['status']>('todo');
  private lastSavedStatus: Task['status'] = 'todo';

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.maxLength(500)]],
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
        dueDate: task?.dueDate ?? '',
      });
      this.form.markAsPristine();
      this.status.set(task?.status ?? 'todo');
      this.lastSavedStatus = task?.status ?? 'todo';
    });
  }

  isDirty(): boolean {
    return this.form.dirty || this.status() !== this.lastSavedStatus;
  }

  protected setStatus(value: string): void {
    this.status.set(value as Task['status']);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, description, dueDate } = this.form.getRawValue();
    this.save.emit({ title: title.trim(), description: description.trim(), status: this.status(), dueDate });
    this.form.markAsPristine();
    this.lastSavedStatus = this.status();
  }
}
