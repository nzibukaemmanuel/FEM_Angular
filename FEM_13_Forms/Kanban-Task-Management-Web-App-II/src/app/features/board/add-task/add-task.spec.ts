import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AddTask } from './add-task';
import { TaskService } from '../task.service';

describe('AddTask', () => {
  let fixture: ComponentFixture<AddTask>;
  let component: AddTask;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTask],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTask);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('boardId', 'roadmap');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has no unsaved changes until the form is edited', () => {
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('adds the task to the board and navigates back to it on save', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const taskService = TestBed.inject(TaskService);

    component.onSave({ title: 'New task', status: 'todo' });

    expect(taskService.getTasks('roadmap').some((task) => task.title === 'New task')).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/boards', 'roadmap']);
  });

  it('navigates back to the board on cancel', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.onCancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/boards', 'roadmap']);
  });
});
