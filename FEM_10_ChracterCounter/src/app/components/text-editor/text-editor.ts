import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TextCounter } from '../../services/text-counter';

const SHAKE_DURATION_MS = 400;

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.html',
  styleUrl: './text-editor.css',
})
export class TextEditor implements OnInit, OnChanges, OnDestroy {
  readonly text = input.required<string>();
  readonly textChange = output<string>();

  @Input() overLimit = false;
  @Input() limitValue: number | null = null;

  @ViewChild('textInput', { static: true }) private readonly textInputRef!: ElementRef<HTMLTextAreaElement>;

  private readonly counter = inject(TextCounter);

  protected readonly isShaking = signal(false);
  private shakeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    console.log('[TextEditor] initialized with', this.text().length, 'characters');
    this.textInputRef.nativeElement.focus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const overLimitChange = changes['overLimit'];
    if (overLimitChange && overLimitChange.currentValue === true && !overLimitChange.firstChange) {
      console.log('[TextEditor] change detected: character limit exceeded, limit =', this.limitValue);
      this.triggerShake();
    }
  }

  ngOnDestroy(): void {
    if (this.shakeTimeoutId !== null) {
      clearTimeout(this.shakeTimeoutId);
    }
    console.log('[TextEditor] destroyed, cleared pending timers');
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const enforced = this.counter.enforceLimit(target.value);

    if (enforced !== target.value) {
      const cursor = Math.min(target.selectionStart ?? enforced.length, enforced.length);
      target.value = enforced;
      target.setSelectionRange(cursor, cursor);
    }

    this.textChange.emit(enforced);
  }

  private triggerShake(): void {
    if (this.shakeTimeoutId !== null) {
      clearTimeout(this.shakeTimeoutId);
    }
    this.isShaking.set(true);
    this.shakeTimeoutId = setTimeout(() => {
      this.isShaking.set(false);
      this.shakeTimeoutId = null;
    }, SHAKE_DURATION_MS);
  }
}
