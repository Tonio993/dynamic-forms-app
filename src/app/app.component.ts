import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { FormConfig } from './models/form-config.model';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { FormExamplesComponent } from './form-examples/form-examples.component';
import { FieldComponentsRegistryComponent } from './dynamic-form/field-components/field-components-registry.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DynamicFormComponent,
    FormExamplesComponent,
    FieldComponentsRegistryComponent,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dynamic-forms-app';
  currentView = signal<'main' | 'examples'>('main');

  formConfig: FormConfig = {
    name: "User Registration Form",
    fields: [
      {
        name: "firstName",
        type: "text",
        required: true,
        label: "First Name",
        placeholder: "Enter your first name",
        config: {
          minLength: 2,
          maxLength: 50
        }
      },
      {
        name: "lastName",
        type: "text",
        required: true,
        label: "Last Name",
        placeholder: "Enter your last name",
        config: {
          minLength: 2,
          maxLength: 50
        }
      },
      {
        name: "email",
        type: "email",
        required: true,
        label: "Email Address",
        placeholder: "example@email.com"
      },
      {
        name: "age",
        type: "number",
        required: false,
        label: "Age",
        placeholder: "Enter your age",
        config: {
          min: 18,
          max: 120
        }
      },
      {
        name: "password",
        type: "password",
        required: true,
        label: "Password",
        placeholder: "Enter a strong password",
        config: {
          minLength: 8,
          pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"
        }
      },
      {
        name: "birthDate",
        type: "date",
        required: false,
        label: "Date of Birth"
      },
      {
        name: "country",
        type: "select",
        required: true,
        label: "Country",
        config: {
          options: ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Other"]
        }
      },
      {
        name: "gender",
        type: "radio",
        required: false,
        label: "Gender",
        config: {
          options: ["Male", "Female", "Other", "Prefer not to say"]
        }
      },
      {
        name: "bio",
        type: "textarea",
        required: false,
        label: "Biography",
        placeholder: "Tell us about yourself...",
        config: {
          maxLength: 500
        }
      },
      {
        name: "newsletter",
        type: "checkbox",
        required: false,
        label: "Subscribe to Newsletter",
        placeholder: "I want to receive newsletter updates"
      }
    ]
  };

  showMain(): void {
    this.currentView.set('main');
  }

  showExamples(): void {
    this.currentView.set('examples');
  }
}
