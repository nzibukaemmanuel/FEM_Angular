import { Injectable, signal } from '@angular/core';
import { BOARD_TASKS, Task } from './board-data';

let nextTaskSuffix = 0;

// BOARD_TASKS is the seed/fixture data (also relied on by specs); this service owns the live,
// writable copy so Add/Edit Task forms have somewhere to persist changes without mutating the
// shared const or breaking existing computed()-based reads.
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly boardTasks = signal<Record<string, Task[]>>(structuredClone(BOARD_TASKS));

  getTasks(boardId: string): Task[] {
    return this.boardTasks()[boardId] ?? [];
  }

  getTask(boardId: string, taskId: string): Task | undefined {
    return this.getTasks(boardId).find((task) => task.id === taskId);
  }

  addTask(boardId: string, task: Omit<Task, 'id'>): Task {
    const newTask: Task = { ...task, id: `${slugify(task.title)}-${nextTaskSuffix++}` };
    this.boardTasks.update((all) => ({
      ...all,
      [boardId]: [...(all[boardId] ?? []), newTask],
    }));
    return newTask;
  }

  updateTask(boardId: string, taskId: string, changes: Partial<Omit<Task, 'id'>>): void {
    this.boardTasks.update((all) => ({
      ...all,
      [boardId]: (all[boardId] ?? []).map((task) => (task.id === taskId ? { ...task, ...changes } : task)),
    }));
  }
}

function slugify(title: string): string {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'task';
}
