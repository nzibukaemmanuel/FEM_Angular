import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-board-details',
  styleUrl: './board-details.css',
  templateUrl: './board-details.html',
})
export class BoardDetails {
  private readonly router = inject(Router);

  @Input() boardId = '';

  goBack(): void {
    this.router.navigate(['/boards']);
  }
}
