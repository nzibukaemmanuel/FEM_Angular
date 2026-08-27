import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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

  readonly boardId = input('');
  readonly taskId = input('');

  readonly task = computed(() => this.taskService.getTask(this.boardId(), this.taskId()));

  goToBoard(): void {
    this.router.navigate(['/boards', this.boardId()]);
  }
}
