import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Boards } from './boards';
import { TaskService } from '../task.service';

describe('Boards', () => {
  let component: Boards;
  let fixture: ComponentFixture<Boards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Boards],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Boards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to the selected board when jumping via the quick-jump select', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.jumpToBoard('roadmap');

    expect(navigateSpy).toHaveBeenCalledWith(['/boards', 'roadmap']);
  });

  it('does not navigate when no board is selected', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.jumpToBoard('');

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('streams the current task count for a board', async () => {
    expect(await firstValueFrom(component.taskCount$('roadmap')!)).toBe(2);
  });

  it('reflects a task added through TaskService — via its shared BehaviorSubject — without a reload', async () => {
    const taskService = TestBed.inject(TaskService);
    const before = await firstValueFrom(component.taskCount$('roadmap')!);

    taskService.addTask('roadmap', { title: 'New task', description: '', status: 'todo', dueDate: '', subtasks: [] });

    const after = await firstValueFrom(component.taskCount$('roadmap')!);
    expect(after).toBe(before + 1);
  });
});
