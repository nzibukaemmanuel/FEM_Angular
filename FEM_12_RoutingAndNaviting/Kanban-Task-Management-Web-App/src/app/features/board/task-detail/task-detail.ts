import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { BOARD_TASKS } from '../board-data';

@Component({
  imports: [],
  selector: 'app-task-detail',
  styleUrl: './task-detail.css',
  templateUrl: './task-detail.html',
})
export class TaskDetail {
  private readonly router = inject(Router);

  readonly boardId = input('');
  readonly taskId = input('');

  readonly task = computed(() => BOARD_TASKS[this.boardId()]?.find((task) => task.id === this.taskId()));

  goToBoard(): void {
    this.router.navigate(['/boards', this.boardId()]);
  }
}
