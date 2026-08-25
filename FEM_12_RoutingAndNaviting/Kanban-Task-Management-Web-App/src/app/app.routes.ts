import { Routes } from '@angular/router';
import { Boards } from './pages/boards/boards';
import { BoardDetails } from './pages/board-details/board-details';
import { Settings } from './pages/settings/settings';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'boards', pathMatch: 'full' },
  { path: 'boards', component: Boards },
  { path: 'boards/:boardId', component: BoardDetails },
  { path: 'settings', component: Settings },
  { path: '**', component: NotFound },
];
