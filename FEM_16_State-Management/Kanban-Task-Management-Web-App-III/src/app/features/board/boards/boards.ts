import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SelectField, SelectFieldOption } from '../../../shared/select-field/select-field';
import { BoardService } from '../board.service';

@Component({
  imports: [RouterLink, SelectField],
  selector: 'app-boards',
  styleUrl: './boards.css',
  templateUrl: './boards.html',
})
export class Boards {
  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);

  readonly boardIds = this.boardService.boardIds;

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
