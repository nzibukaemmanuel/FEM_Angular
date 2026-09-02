import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  withRouterConfig,
} from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // Child routes (e.g. boards/:boardId/tasks/:taskId) also receive their parent's params as inputs.
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      // Fetches lazy-loaded chunks (the boards feature) in the background after the app is stable,
      // trading a little idle bandwidth for instant navigation later.
      withPreloading(PreloadAllModules),
    ),
  ]
};
