import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Ensure browser always starts at the top on page refresh
if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
