import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { EditTask } from './edit-task';
import { TaskService } from '../task.service';

describe('EditTask', () => {
  let fixture: ComponentFixture<EditTask>;
  let component: EditTask;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTask],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTask);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('boardId', 'roadmap');
    fixture.componentRef.setInput('taskId', 'q1-goals');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resolves the task being edited', () => {
    expect(component.task()?.title).toBe('Set Q1 goals');
  });

  it('updates the task and navigates back to its detail page on save', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const taskService = TestBed.inject(TaskService);

    component.onSave({ title: 'Set Q1 goals (revised)', status: 'done' });

    expect(taskService.getTask('roadmap', 'q1-goals')?.title).toBe('Set Q1 goals (revised)');
    expect(navigateSpy).toHaveBeenCalledWith(['/boards', 'roadmap', 'tasks', 'q1-goals']);
  });

  it('navigates back to the task detail page on cancel', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.onCancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/boards', 'roadmap', 'tasks', 'q1-goals']);
  });
});
