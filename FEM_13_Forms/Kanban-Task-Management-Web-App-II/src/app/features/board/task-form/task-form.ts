import { Component, ElementRef, HostListener, effect, inject, input, output, signal, viewChild } from '@angular/core';
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

let nextFormInstanceId = 0;

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
  private readonly instanceId = `task-form-${nextFormInstanceId++}`;

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

  // Ids for aria-describedby/aria-labelledby — unique per instance so two forms on a page
  // (unlikely here, but a shared component shouldn't assume it's the only one) never collide.
  protected readonly statusLabelId = `${this.instanceId}-status-label`;
  protected readonly titleErrorId = `${this.instanceId}-title-error`;
  protected readonly descriptionErrorId = `${this.instanceId}-description-error`;
  protected readonly statusErrorId = `${this.instanceId}-status-error`;

  private readonly titleInputRef = viewChild<ElementRef<HTMLInputElement>>('titleInput');
  private readonly descriptionInputRef = viewChild<ElementRef<HTMLTextAreaElement>>('descriptionInput');
  private readonly dueDateInputRef = viewChild<ElementRef<HTMLInputElement>>('dueDateInput');
  private readonly statusField = viewChild(SelectField);

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

  // Covers the case canDeactivate can't: closing the tab, hard-refreshing, or typing a new URL
  // bypasses the Angular router entirely, so the guard never runs. This is the browser-level
  // backstop for the same "you'll lose your edits" warning.
  @HostListener('window:beforeunload', ['$event'])
  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.isDirty()) {
      event.preventDefault();
      event.returnValue = true;
    }
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
      this.focusFirstInvalidField();
      return;
    }
    const { title, description, status, dueDate } = this.form.getRawValue();
    this.save.emit({ title: title.trim(), description: description.trim(), status: status as Task['status'], dueDate });
    this.form.markAsPristine();
  }

  // Moves focus to the first invalid field, in visual top-to-bottom order, so keyboard and
  // screen-reader users land directly on the problem instead of having to hunt for it.
  private focusFirstInvalidField(): void {
    if (this.form.controls.title.invalid) {
      this.titleInputRef()?.nativeElement.focus();
    } else if (this.form.controls.status.invalid) {
      this.statusField()?.focus();
    } else if (this.form.controls.description.invalid) {
      this.descriptionInputRef()?.nativeElement.focus();
    } else if (this.form.controls.dueDate.invalid) {
      this.dueDateInputRef()?.nativeElement.focus();
    }
  }
}
