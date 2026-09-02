import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BOARD_IDS } from '../../features/board/board-data';
import { ComponentWithUnsavedChanges } from '../../core/unsaved-changes.guard';
import { NotificationService } from '../../core/notification.service';
import { PreferencesService } from '../../core/preferences.service';
import { ThemeService } from '../../core/theme.service';
import { SelectField, SelectFieldOption } from '../../shared/select-field/select-field';

const BOARD_OPTIONS: SelectFieldOption[] = [
  { value: '', label: 'None — go to Settings after login' },
  ...BOARD_IDS.map((boardId) => ({ value: boardId, label: boardId })),
];

@Component({
  imports: [ReactiveFormsModule, SelectField],
  selector: 'app-settings',
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
export class Settings implements ComponentWithUnsavedChanges {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly notificationService = inject(NotificationService);

  protected readonly boardOptions = BOARD_OPTIONS;

  readonly form = this.fb.nonNullable.group({
    displayName: 'NZIBUKA',
    theme: this.themeService.theme(),
    confirmBeforeDelete: this.preferencesService.confirmBeforeDelete(),
    persistSuccessNotices: this.notificationService.persistSuccess(),
    defaultBoardId: this.preferencesService.defaultBoardId(),
  });

  setDefaultBoardId(value: string): void {
    this.form.controls.defaultBoardId.setValue(value);
    this.form.controls.defaultBoardId.markAsDirty();
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  save(): void {
    const { theme, confirmBeforeDelete, persistSuccessNotices, defaultBoardId } = this.form.getRawValue();
    this.themeService.setTheme(theme);
    this.preferencesService.setConfirmBeforeDelete(confirmBeforeDelete);
    this.preferencesService.setDefaultBoardId(defaultBoardId);
    // Applied before the confirmation notice so the notice itself reflects the new preference.
    this.notificationService.setPersistSuccess(persistSuccessNotices);
    this.form.markAsPristine();
    this.notificationService.success('Settings saved.');
    this.router.navigate(['/boards']);
  }
}
