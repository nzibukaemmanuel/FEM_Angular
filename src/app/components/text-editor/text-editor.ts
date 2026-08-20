import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.html',
  styleUrl: './text-editor.css',
})
export class TextEditor {
  readonly text = input.required<string>();
  readonly textChange = output<string>();

  protected onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.textChange.emit(target.value);
  }
}
