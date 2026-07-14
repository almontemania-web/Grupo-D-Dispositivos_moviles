import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Apply the persisted "Modo Adulto Mayor" class before bootstrap to avoid a flash of unscaled UI.
if (localStorage.getItem('modoAdultoMayor') === 'true') {
  document.body.classList.add('senior-mode');
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));