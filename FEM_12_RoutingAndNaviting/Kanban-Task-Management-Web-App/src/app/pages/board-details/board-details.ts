import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-board-details',
  styleUrl: './board-details.css',
  templateUrl: './board-details.html',
})
export class BoardDetails {
  @Input() boardId = '';
}
