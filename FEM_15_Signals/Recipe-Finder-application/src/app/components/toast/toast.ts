import { Component, input, output } from '@angular/core';

export type ToastType = 'error' | 'success';

export interface ToastMessage {
  type: ToastType;
  text: string;
}

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast {
  readonly toast = input<ToastMessage | null>(null);
  readonly dismissed = output<void>();

  protected dismiss(): void {
    this.dismissed.emit();
  }
}
