import { Component, computed, inject, input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentWithUnsavedChanges } from '../../../core/unsaved-changes.guard';
import { NotificationService } from '../../../core/notification.service';
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
  private readonly notificationService = inject(NotificationService);

  readonly boardId = input('');

  readonly existingTitles = computed(() => this.taskService.otherTitles(this.boardId(), null));

  private readonly taskForm = viewChild(TaskForm);

  hasUnsavedChanges(): boolean {
    return this.taskForm()?.isDirty() ?? false;
  }

  onSave(value: TaskFormValue): void {
    this.taskService.addTask(this.boardId(), value);
    this.notificationService.success(`"${value.title}" was added.`);
    this.goToBoard();
  }

  onCancel(): void {
    this.goToBoard();
  }

  private goToBoard(): void {
    this.router.navigate(['/boards', this.boardId()]);
  }
}
