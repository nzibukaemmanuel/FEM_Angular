import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('returns the seeded tasks for a known board', () => {
    expect(service.getTasks('roadmap').map((task) => task.id)).toEqual(['q1-goals', 'prioritize-features']);
  });

  it('returns an empty array for an unknown board', () => {
    expect(service.getTasks('does-not-exist')).toEqual([]);
  });

  it('finds a single task by board and id', () => {
    expect(service.getTask('roadmap', 'q1-goals')?.title).toBe('Set Q1 goals');
  });

  it('returns undefined for a task id that does not exist on that board', () => {
    expect(service.getTask('roadmap', 'not-real')).toBeUndefined();
  });

  describe('otherTitles', () => {
    it('lists every title on the board when nothing is excluded', () => {
      expect(service.otherTitles('roadmap', null)).toEqual(['Set Q1 goals', 'Prioritize features']);
    });

    it('excludes the given task id', () => {
      expect(service.otherTitles('roadmap', 'q1-goals')).toEqual(['Prioritize features']);
    });
  });

  describe('addTask', () => {
    it('appends a new task to the board with a generated id', () => {
      const added = service.addTask('roadmap', { title: 'New task', description: '', status: 'todo', dueDate: '', subtasks: [] });

      expect(added.id).toBeTruthy();
      expect(service.getTasks('roadmap').map((task) => task.id)).toContain(added.id);
    });

    it('does not affect tasks on other boards', () => {
      const before = service.getTasks('platform-launch');

      service.addTask('roadmap', { title: 'New task', description: '', status: 'todo', dueDate: '', subtasks: [] });

      expect(service.getTasks('platform-launch')).toEqual(before);
    });

    it('generates distinct ids for two tasks with the same title', () => {
      const first = service.addTask('roadmap', { title: 'Duplicate', description: '', status: 'todo', dueDate: '', subtasks: [] });
      const second = service.addTask('roadmap', { title: 'Duplicate', description: '', status: 'todo', dueDate: '', subtasks: [] });

      expect(first.id).not.toBe(second.id);
    });
  });

  describe('updateTask', () => {
    it('applies only the given changes, leaving other fields on the same task untouched', () => {
      service.updateTask('roadmap', 'q1-goals', { status: 'done' });

      const updated = service.getTask('roadmap', 'q1-goals');
      expect(updated?.status).toBe('done');
      expect(updated?.title).toBe('Set Q1 goals');
    });

    it('does not affect other tasks on the same board', () => {
      const otherBefore = service.getTask('roadmap', 'prioritize-features');

      service.updateTask('roadmap', 'q1-goals', { title: 'Renamed', status: 'done' });

      expect(service.getTask('roadmap', 'prioritize-features')).toEqual(otherBefore);
    });

    it('does not affect tasks on other boards', () => {
      const otherBoardBefore = service.getTasks('platform-launch');

      service.updateTask('roadmap', 'q1-goals', { title: 'Renamed' });

      expect(service.getTasks('platform-launch')).toEqual(otherBoardBefore);
    });

    it('is a no-op when the task id does not exist on that board', () => {
      const before = service.getTasks('roadmap');

      service.updateTask('roadmap', 'not-real', { title: 'Ghost' });

      expect(service.getTasks('roadmap')).toEqual(before);
    });
  });
});
