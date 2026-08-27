export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  // ISO 'YYYY-MM-DD', matching <input type="date">'s value format directly. Empty string means
  // "no due date set" — kept as a string rather than null so the form's FormBuilder.nonNullable
  // group can manage it like every other field, with no separate null-handling branch.
  dueDate: string;
}

export const BOARD_TASKS: Record<string, Task[]> = {
  'platform-launch': [
    {
      id: 'define-scope',
      title: 'Define MVP scope',
      description: 'Draft and agree the MVP feature list with stakeholders.',
      status: 'done',
      dueDate: '2026-08-10',
    },
    {
      id: 'design-review',
      title: 'Design review',
      description: 'Walk through the high-fidelity mockups with design and engineering.',
      status: 'doing',
      dueDate: '2026-08-29',
    },
    {
      id: 'write-docs',
      title: 'Write launch docs',
      description: 'Write the public launch announcement and changelog.',
      status: 'todo',
      dueDate: '2026-09-05',
    },
  ],
  'marketing-plan': [
    {
      id: 'audience-research',
      title: 'Audience research',
      description: 'Identify target segments and messaging angles.',
      status: 'done',
      dueDate: '2026-07-20',
    },
    {
      id: 'draft-campaign',
      title: 'Draft campaign copy',
      description: 'Write first-draft copy for the launch campaign.',
      status: 'todo',
      dueDate: '2026-09-01',
    },
    {
      id: 'schedule-posts',
      title: 'Schedule social posts',
      description: 'Queue social posts across all channels for launch week.',
      status: 'todo',
      dueDate: '2026-09-10',
    },
  ],
  roadmap: [
    {
      id: 'q1-goals',
      title: 'Set Q1 goals',
      description: 'Set and align on Q1 OKRs across teams.',
      status: 'doing',
      dueDate: '2026-09-15',
    },
    {
      id: 'prioritize-features',
      title: 'Prioritize features',
      description: 'Rank the backlog against Q1 goals.',
      status: 'todo',
      dueDate: '2026-09-20',
    },
  ],
};
