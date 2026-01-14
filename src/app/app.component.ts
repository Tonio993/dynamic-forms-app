import { Component, signal, computed } from '@angular/core';
import { FormConfig } from './models/form-config.model';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { FormExamplesComponent } from './form-examples/form-examples.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DynamicFormComponent, FormExamplesComponent],
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
        constraints: [
          { type: "minLength", value: 2 },
          { type: "maxLength", value: 50 }
        ]
      },
      {
        name: "lastName",
        type: "text",
        required: true,
        label: "Last Name",
        placeholder: "Enter your last name",
        constraints: [
          { type: "minLength", value: 2 },
          { type: "maxLength", value: 50 }
        ]
      },
      {
        name: "email",
        type: "email",
        required: true,
        label: "Email Address",
        placeholder: "example@email.com",
        constraints: [
          { type: "email", value: "" }
        ]
      },
      {
        name: "age",
        type: "number",
        required: false,
        label: "Age",
        placeholder: "Enter your age",
        constraints: [
          { type: "min", value: 18 },
          { type: "max", value: 120 }
        ]
      },
      {
        name: "password",
        type: "password",
        required: true,
        label: "Password",
        placeholder: "Enter a strong password",
        constraints: [
          { type: "minLength", value: 8 },
          { type: "regex", value: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$" }
        ]
      },
      {
        name: "birthDate",
        type: "date",
        required: false,
        label: "Date of Birth",
        constraints: []
      },
      {
        name: "country",
        type: "select",
        required: true,
        label: "Country",
        options: ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Other"]
      },
      {
        name: "gender",
        type: "radio",
        required: false,
        label: "Gender",
        options: ["Male", "Female", "Other", "Prefer not to say"]
      },
      {
        name: "bio",
        type: "textarea",
        required: false,
        label: "Biography",
        placeholder: "Tell us about yourself...",
        constraints: [
          { type: "maxLength", value: 500 }
        ]
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
