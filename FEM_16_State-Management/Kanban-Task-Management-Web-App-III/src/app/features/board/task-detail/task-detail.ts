import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/notification.service';
import { PreferencesService } from '../../../core/preferences.service';
import { TaskService } from '../task.service';

@Component({
  imports: [RouterLink],
  selector: 'app-task-detail',
  styleUrl: './task-detail.css',
  templateUrl: './task-detail.html',
})
export class TaskDetail {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly notificationService = inject(NotificationService);

  readonly boardId = input('');
  readonly taskId = input('');

  readonly task = computed(() => this.taskService.getTask(this.boardId(), this.taskId()));
  readonly completedSubtaskCount = computed(
    () => this.task()?.subtasks.filter((subtask) => subtask.completed).length ?? 0,
  );

  goToBoard(): void {
    this.router.navigate(['/boards', this.boardId()]);
  }

  deleteTask(): void {
    const task = this.task();
    if (!task) {
      return;
    }
    if (this.preferencesService.confirmBeforeDelete() && !confirm(`Delete "${task.title}"? This can't be undone.`)) {
      return;
    }
    this.taskService.deleteTask(this.boardId(), this.taskId());
    this.notificationService.success(`"${task.title}" was deleted.`);
    this.goToBoard();
  }
}
