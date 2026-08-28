export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  // ISO 'YYYY-MM-DD', matching <input type="date">'s value format directly. Empty string means
  // "no due date set" — kept as a string rather than null so the form's FormBuilder.nonNullable
  // group can manage it like every other field, with no separate null-handling branch.
  dueDate: string;
  subtasks: Subtask[];
}

export const BOARD_TASKS: Record<string, Task[]> = {
  // keys below double as the app's board id list — BOARD_IDS derives from them so board
  // pickers (Boards quick-jump, Settings' default board) never drift out of sync with the data.
  'platform-launch': [
    {
      id: 'define-scope',
      title: 'Define MVP scope',
      description: 'Draft and agree the MVP feature list with stakeholders.',
      status: 'done',
      dueDate: '2026-08-10',
      subtasks: [
        { id: 'define-scope-1', title: 'Interview stakeholders', completed: true },
        { id: 'define-scope-2', title: 'Draft feature list', completed: true },
        { id: 'define-scope-3', title: 'Get sign-off', completed: true },
      ],
    },
    {
      id: 'design-review',
      title: 'Design review',
      description: 'Walk through the high-fidelity mockups with design and engineering.',
      status: 'doing',
      dueDate: '2026-08-29',
      subtasks: [
        { id: 'design-review-1', title: 'Share Figma link with the team', completed: true },
        { id: 'design-review-2', title: 'Collect written feedback', completed: false },
        { id: 'design-review-3', title: 'Walkthrough meeting', completed: false },
      ],
    },
    {
      id: 'write-docs',
      title: 'Write launch docs',
      description: 'Write the public launch announcement and changelog.',
      status: 'todo',
      dueDate: '2026-09-05',
      subtasks: [],
    },
  ],
  'marketing-plan': [
    {
      id: 'audience-research',
      title: 'Audience research',
      description: 'Identify target segments and messaging angles.',
      status: 'done',
      dueDate: '2026-07-20',
      subtasks: [],
    },
    {
      id: 'draft-campaign',
      title: 'Draft campaign copy',
      description: 'Write first-draft copy for the launch campaign.',
      status: 'todo',
      dueDate: '2026-09-01',
      subtasks: [],
    },
    {
      id: 'schedule-posts',
      title: 'Schedule social posts',
      description: 'Queue social posts across all channels for launch week.',
      status: 'todo',
      dueDate: '2026-09-10',
      subtasks: [],
    },
  ],
  roadmap: [
    {
      id: 'q1-goals',
      title: 'Set Q1 goals',
      description: 'Set and align on Q1 OKRs across teams.',
      status: 'doing',
      dueDate: '2026-09-15',
      subtasks: [
        { id: 'q1-goals-1', title: 'Review last quarter results', completed: true },
        { id: 'q1-goals-2', title: 'Draft OKRs', completed: false },
      ],
    },
    {
      id: 'prioritize-features',
      title: 'Prioritize features',
      description: 'Rank the backlog against Q1 goals.',
      status: 'todo',
      dueDate: '2026-09-20',
      subtasks: [],
    },
  ],
};

export const BOARD_IDS = Object.keys(BOARD_TASKS);
