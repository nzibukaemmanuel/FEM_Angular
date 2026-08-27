import { Component, computed, inject, input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentWithUnsavedChanges } from '../../../core/unsaved-changes.guard';
import { TaskForm, TaskFormValue } from '../task-form/task-form';
import { TaskService } from '../task.service';

@Component({
  imports: [TaskForm],
  selector: 'app-edit-task',
  styleUrl: './edit-task.css',
  templateUrl: './edit-task.html',
})
export class EditTask implements ComponentWithUnsavedChanges {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  readonly boardId = input('');
  readonly taskId = input('');

  readonly task = computed(() => this.taskService.getTask(this.boardId(), this.taskId()));

  private readonly taskForm = viewChild(TaskForm);

  hasUnsavedChanges(): boolean {
    return this.taskForm()?.isDirty() ?? false;
  }

  onSave(value: TaskFormValue): void {
    this.taskService.updateTask(this.boardId(), this.taskId(), value);
    this.goToTask();
  }

  onCancel(): void {
    this.goToTask();
  }

  private goToTask(): void {
    this.router.navigate(['/boards', this.boardId(), 'tasks', this.taskId()]);
  }
}
