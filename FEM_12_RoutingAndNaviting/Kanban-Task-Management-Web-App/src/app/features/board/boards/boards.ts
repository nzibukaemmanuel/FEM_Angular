import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-boards',
  styleUrl: './boards.css',
  templateUrl: './boards.html',
})
export class Boards {
  private readonly router = inject(Router);

  readonly boardIds = ['platform-launch', 'marketing-plan', 'roadmap'];

  jumpToBoard(boardId: string): void {
    if (!boardId) {
      return;
    }
    this.router.navigate(['/boards', boardId]);
  }
}
