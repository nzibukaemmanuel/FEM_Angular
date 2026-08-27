export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
}

export const BOARD_TASKS: Record<string, Task[]> = {
  'platform-launch': [
    { id: 'define-scope', title: 'Define MVP scope', status: 'done' },
    { id: 'design-review', title: 'Design review', status: 'doing' },
    { id: 'write-docs', title: 'Write launch docs', status: 'todo' },
  ],
  'marketing-plan': [
    { id: 'audience-research', title: 'Audience research', status: 'done' },
    { id: 'draft-campaign', title: 'Draft campaign copy', status: 'todo' },
    { id: 'schedule-posts', title: 'Schedule social posts', status: 'todo' },
  ],
  roadmap: [
    { id: 'q1-goals', title: 'Set Q1 goals', status: 'doing' },
    { id: 'prioritize-features', title: 'Prioritize features', status: 'todo' },
  ],
};
