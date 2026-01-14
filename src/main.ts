import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
// Import all field components to ensure they are loaded and can register themselves
import './app/dynamic-form/field-components/field-components';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations()
  ]
}).catch(err => console.error(err));
