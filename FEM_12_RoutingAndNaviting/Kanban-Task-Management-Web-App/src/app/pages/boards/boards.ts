import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-boards',
  styleUrl: './boards.css',
  templateUrl: './boards.html',
})
export class Boards {
  readonly boardIds = ['platform-launch', 'marketing-plan', 'roadmap'];
}
