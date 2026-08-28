import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SelectField, SelectFieldOption } from '../../../shared/select-field/select-field';
import { BOARD_IDS } from '../board-data';

@Component({
  imports: [RouterLink, SelectField],
  selector: 'app-boards',
  styleUrl: './boards.css',
  templateUrl: './boards.html',
})
export class Boards {
  private readonly router = inject(Router);

  readonly boardIds = BOARD_IDS;

  readonly boardOptions: SelectFieldOption[] = [
    { value: '', label: 'Choose a board…' },
    ...this.boardIds.map((boardId) => ({ value: boardId, label: boardId })),
  ];

  jumpToBoard(boardId: string): void {
    if (!boardId) {
      return;
    }
    this.router.navigate(['/boards', boardId]);
  }
}
