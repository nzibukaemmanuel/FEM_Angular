import { Routes } from '@angular/router';
import { Boards } from './boards/boards';
import { BoardDetails } from './board-details/board-details';
import { TaskDetail } from './task-detail/task-detail';

export const BOARD_ROUTES: Routes = [
  { path: '', component: Boards },
  {
    path: ':boardId',
    component: BoardDetails,
    children: [{ path: 'tasks/:taskId', component: TaskDetail }],
  },
];
