# KanbanTaskManagementWebApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.5.

## State management

There's no backend behind this app yet — `board-data.ts` is the fixture every service and the
store both boot from — so "state management" here is about how the *client-side* copy of that
data flows between components, not about caching a real API response.

### Local vs. global state

- **Local**: form state inside `TaskForm` (dirty/touched, in-progress edits), the `Boards` quick-jump
  select, per-page filter/sort query params. None of it is needed outside the component that owns it.
- **Global**: the task list per board (read from `Boards`, `BoardDetails`, `TaskDetail`, `AddTask` and
  `EditTask` alike) and the board id list (read from `Boards`, `BoardDetails`, `Settings`). Both need
  to stay in sync everywhere the moment one place changes them.

### Hybrid strategy (bonus task)

Global state here is deliberately split across two mechanisms rather than moved to NgRx wholesale:

| State | Owner | Why |
|---|---|---|
| Tasks (per board) | **NgRx** (`features/board/store/`) — actions, a `createReducer` backed by `@ngrx/entity`'s `EntityAdapter`, selectors, and `TaskEffects` | Tasks are the app's actual CRUD surface (add/update/delete, filter, sort) — the kind of state that benefits from an explicit action log, time-travel debugging, and a normalized, id-keyed collection instead of `TaskService`'s `Record<boardId, Task[]>`. |
| Boards (which boards exist) | **Service-based** — `BoardService`'s `ReplaySubject<readonly string[]>` | The board list is fixed at boot and effectively never mutates at runtime. A full store slice (actions, reducer, selectors, effects) would be ceremony around a value that never changes — a `ReplaySubject` already gives every subscriber, including late ones, the current list. |

Trade-off: NgRx's action → effect → reducer → selector indirection pays for itself on Tasks (multiple
mutation paths, multiple readers, debugging value) but would be pure overhead on the board list. Service
state is simpler to read/write but has no action log and no `EntityAdapter`-style structure — fine for a
value that's set once, not fine for something with four different ways to change it.

### Task state — actions → effects → reducer → selectors

`TaskService` remains the actual data layer (an in-memory fixture today; swapping in a real HTTP-backed
service later wouldn't change anything above it). Components no longer inject it directly — they
dispatch `TaskActions` and read back through `store.selectSignal(...)`:

```
component.dispatch(TaskActions.addTask({ boardId, task }))
      │
      ▼
TaskEffects.addTask$  →  calls TaskService.addTask(...)  →  dispatches TaskActions.addTaskSuccess({ task })
      │
      ▼
taskReducer  →  taskAdapter.addOne(task, state)
      │
      ▼
selectAllTasks / selectTasksByBoard(boardId)  →  components re-render
```

- `task.actions.ts` — `Load Tasks`, `Add/Update/Delete Task` (+ their `Success`/`Failure` pairs), via `createActionGroup`.
- `task.reducer.ts` — `EntityAdapter<TaskEntity>`-backed `TaskState` (`TaskEntity` = `Task` + `boardId`), seeded from the same fixture `TaskService` boots from so the board never shows an empty loading state.
- `task.selectors.ts` — `selectAllTasks`, plus parameterized factories (`selectTasksByBoard`, `selectTaskByBoardAndId`, `selectOtherTitles`) for the boardId-scoped reads components actually need.
- `task.effects.ts` — the only place `TaskService` is called from now; turns each intent action into a `TaskService` call and a `Success`/`Failure` action.
- `testing.ts` — `provideTaskStoreForTests()`, the one place spec files get the same store/effects wiring `app.config.ts` provides for real.

### Debugging with NgRx DevTools

`provideStoreDevtools` is wired up in `app.config.ts` (`app.ts` dispatches `TaskActions.loadTasks()` on
boot so there's a real load action to see, not just the seeded state). With the
[Redux DevTools browser extension](https://github.com/reduxjs/redux-devtools) installed, `ng serve` and
opening the extension panel shows every dispatched action (`[Task] Add Task` → `[Task] Add Task
Success`, etc.) and the resulting state diff in real time.

### Testing

- `task.reducer.spec.ts` / `task.selectors.spec.ts` — pure state-shape tests, no Angular DI.
- `task.effects.spec.ts` — each effect against the real `TaskService`, using `provideMockActions`.
- Component specs (`boards.spec.ts`, `board-details.spec.ts`, `add-task.spec.ts`, `edit-task.spec.ts`,
  `task-detail.spec.ts`) and the router-level `task-form-routing.integration.spec.ts` dispatch actions
  or drive the UI and assert the store-backed reads update without a reload.

### Deployment

`netlify.toml` builds with `npm run build` and publishes `dist/Kanban-Task-Management-Web-App/browser`
with a SPA catch-all redirect. Deploying needs a Netlify (or Vercel) account connected to this repo —
run `netlify deploy --prod` (or push through the connected Git integration) from an authenticated
session.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
