import { Component, input } from '@angular/core';

export type IconName = 'home' | 'heart' | 'bookmark' | 'user' | 'search';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly filled = input(false);
}
