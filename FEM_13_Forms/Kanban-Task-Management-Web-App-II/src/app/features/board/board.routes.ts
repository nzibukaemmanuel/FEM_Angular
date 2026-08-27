import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth.guard';
import { Boards } from './boards/boards';
import { BoardDetails } from './board-details/board-details';
import { TaskDetail } from './task-detail/task-detail';

export const BOARD_ROUTES: Routes = [
  // The boards list (/boards) is the only page open to everyone. Everything past it —
  // a specific board and its tasks — requires login; canActivate on this segment also
  // covers the nested tasks/:taskId route, since a child can't activate without its parent.
  { path: '', component: Boards },
  {
    path: ':boardId',
    component: BoardDetails,
    canActivate: [authGuard],
    children: [{ path: 'tasks/:taskId', component: TaskDetail }],
  },
];
