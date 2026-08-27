import { Component, inject, input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentWithUnsavedChanges } from '../../../core/unsaved-changes.guard';
import { TaskForm, TaskFormValue } from '../task-form/task-form';
import { TaskService } from '../task.service';

@Component({
  imports: [TaskForm],
  selector: 'app-add-task',
  styleUrl: './add-task.css',
  templateUrl: './add-task.html',
})
export class AddTask implements ComponentWithUnsavedChanges {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  readonly boardId = input('');

  private readonly taskForm = viewChild(TaskForm);

  hasUnsavedChanges(): boolean {
    return this.taskForm()?.isDirty() ?? false;
  }

  onSave(value: TaskFormValue): void {
    this.taskService.addTask(this.boardId(), value);
    this.goToBoard();
  }

  onCancel(): void {
    this.goToBoard();
  }

  private goToBoard(): void {
    this.router.navigate(['/boards', this.boardId()]);
  }
}
