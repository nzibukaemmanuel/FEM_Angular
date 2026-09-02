import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { SelectField, SelectFieldOption } from '../../../shared/select-field/select-field';
import { NotFound } from '../../../pages/not-found/not-found';
import { BoardService } from '../board.service';
import { TaskService } from '../task.service';

@Component({
  imports: [RouterLink, RouterOutlet, SelectField, NotFound],
  selector: 'app-board-details',
  styleUrl: './board-details.css',
  templateUrl: './board-details.html',
})
export class BoardDetails {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly taskService = inject(TaskService);
  private readonly boardService = inject(BoardService);

  readonly boardId = input('');
  readonly status = input('all');
  readonly sort = input<'title' | 'status'>('title');

  // Board ids come from a fixed fixture list, so a mistyped/stale URL (e.g. a bookmarked
  // board that got removed) never matches one — show the same 404 as an unmatched route
  // instead of an empty board shell with no tasks.
  readonly boardExists = computed(() => this.boardService.boardExists(this.boardId()));

  readonly statusOptions: SelectFieldOption[] = [
    { value: 'all', label: 'All' },
    { value: 'todo', label: 'To do' },
    { value: 'doing', label: 'In progress' },
    { value: 'done', label: 'Done' },
  ];

  readonly sortOptions: SelectFieldOption[] = [
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
  ];

  // Router input binding sets these to `undefined` (not the declared default) once their
  // query param is no longer present in the URL — e.g. after a relative nav to a child route
  // that doesn't carry the params forward. Fall back to the defaults ourselves.
  readonly effectiveStatus = computed(() => this.status() ?? 'all');
  readonly effectiveSort = computed(() => this.sort() ?? 'title');

  readonly tasks = computed(() => {
    const boardTasks = this.taskService.getTasks(this.boardId());
    const status = this.effectiveStatus();
    const sort = this.effectiveSort();
    const filtered = status === 'all' ? boardTasks : boardTasks.filter((task) => task.status === status);
    return [...filtered].sort((a, b) => a[sort].localeCompare(b[sort]));
  });

  updateQueryParams(partial: Record<string, string>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: partial,
      queryParamsHandling: 'merge',
    });
  }

  goBack(): void {
    this.router.navigate(['/boards']);
  }
}
