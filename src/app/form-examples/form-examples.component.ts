import { Component, signal, computed } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FormConfig } from '../models/form-config.model';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-form-examples',
  standalone: true,
  imports: [
    DynamicFormComponent,
    JsonPipe,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './form-examples.component.html',
  styleUrls: ['./form-examples.component.css']
})
export class FormExamplesComponent {
  selectedExample = signal<string>('registration');
  selectedTabIndex = 0;

  examples: { [key: string]: FormConfig } = {
    registration: {
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
          },
          validators: [(control: AbstractControl) => control.value !== 'Antonio' ? { notAntonio: "Name must be Antonio" } : null]
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
          name: "country",
          type: "select",
          required: true,
          label: "Country",
          config: {
            options: ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Other"]
          }
        }
      ]
    },
    contact: {
      name: "Contact Us Form",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          label: "Full Name",
          placeholder: "Enter your full name",
          config: {
            minLength: 3,
            maxLength: 100
          }
        },
        {
          name: "email",
          type: "email",
          required: true,
          label: "Email Address",
          placeholder: "your.email@example.com"
        },
        {
          name: "phone",
          type: "text",
          required: false,
          label: "Phone Number",
          placeholder: "+1 (555) 123-4567",
          config: {
            pattern: "^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$"
          }
        },
        {
          name: "subject",
          type: "select",
          required: true,
          label: "Subject",
          config: {
            options: ["General Inquiry", "Technical Support", "Sales", "Feedback", "Other"]
          }
        },
        {
          name: "message",
          type: "textarea",
          required: true,
          label: "Message",
          placeholder: "Please describe your inquiry...",
          config: {
            minLength: 10,
            maxLength: 1000
          }
        },
        {
          name: "urgent",
          type: "checkbox",
          required: false,
          label: "Urgent Request",
          placeholder: "Check if this is an urgent matter"
        }
      ]
    },
    survey: {
      name: "Customer Satisfaction Survey",
      fields: [
        {
          name: "customerName",
          type: "text",
          required: false,
          label: "Your Name (Optional)",
          placeholder: "Enter your name",
          config: {
            maxLength: 100
          }
        },
        {
          name: "rating",
          type: "radio",
          required: true,
          label: "Overall Rating",
          config: {
            options: ["Excellent", "Very Good", "Good", "Fair", "Poor"]
          }
        },
        {
          name: "recommend",
          type: "radio",
          required: true,
          label: "Would you recommend us?",
          config: {
            options: ["Definitely", "Probably", "Maybe", "Probably Not", "Definitely Not"]
          }
        },
        {
          name: "satisfaction",
          type: "select",
          required: true,
          label: "Satisfaction Level",
          config: {
            options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
          }
        },
        {
          name: "comments",
          type: "textarea",
          required: false,
          label: "Additional Comments",
          placeholder: "Please share any additional feedback...",
          config: {
            maxLength: 500
          }
        },
        {
          name: "contactConsent",
          type: "checkbox",
          required: false,
          label: "Contact Consent",
          placeholder: "I agree to be contacted for follow-up"
        }
      ]
    },
    product: {
      name: "Product Information Form",
      fields: [
        {
          name: "productName",
          type: "text",
          required: true,
          label: "Product Name",
          placeholder: "Enter product name",
          config: {
            minLength: 3,
            maxLength: 200
          }
        },
        {
          name: "category",
          type: "select",
          required: true,
          label: "Category",
          config: {
            options: ["Electronics", "Clothing", "Food & Beverage", "Home & Garden", "Sports", "Books", "Other"]
          }
        },
        {
          name: "price",
          type: "number",
          required: true,
          label: "Price",
          placeholder: "0.00",
          config: {
            min: 0,
            max: 999999
          }
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          label: "Quantity in Stock",
          placeholder: "0",
          config: {
            min: 0,
            max: 1000000
          }
        },
        {
          name: "description",
          type: "textarea",
          required: true,
          label: "Product Description",
          placeholder: "Describe the product...",
          config: {
            minLength: 20,
            maxLength: 2000
          }
        },
        {
          name: "releaseDate",
          type: "date",
          required: false,
          label: "Release Date"
        },
        {
          name: "inStock",
          type: "checkbox",
          required: false,
          label: "Currently In Stock",
          placeholder: "Product is available for purchase"
        }
      ]
    },
    login: {
      name: "Login Form",
      fields: [
        {
          name: "username",
          type: "text",
          required: true,
          label: "Username or Email",
          placeholder: "Enter your username or email",
          config: {
            minLength: 3,
            maxLength: 100
          }
        },
        {
          name: "password",
          type: "password",
          required: true,
          label: "Password",
          placeholder: "Enter your password",
          config: {
            minLength: 6
          }
        },
        {
          name: "rememberMe",
          type: "checkbox",
          required: false,
          label: "Remember Me",
          placeholder: "Keep me logged in"
        }
      ]
    }
  };

  // Computed values
  currentFormConfig = computed(() => this.examples[this.selectedExample()]);
  exampleKeys = computed(() => Object.keys(this.examples));

  selectExample(exampleKey: string): void {
    this.selectedExample.set(exampleKey);
  }

  onTabChange(index: number): void {
    const keys = this.exampleKeys();
    if (keys[index]) {
      this.selectedExample.set(keys[index]);
      this.selectedTabIndex = index;
    }
  }

  getExampleTitle(key: string): string {
    const titles: { [key: string]: string } = {
      registration: "Registration",
      contact: "Contact Form",
      survey: "Survey",
      product: "Product Form",
      login: "Login"
    };
    return titles[key] || key;
  }

  getExampleDescription(key: string): string {
    const descriptions: { [key: string]: string } = {
      registration: "A comprehensive user registration form with validation for personal information and account creation.",
      contact: "A contact form for customer inquiries with subject categorization and message validation.",
      survey: "A customer satisfaction survey with rating options and feedback collection.",
      product: "A product information form for inventory management with pricing and stock tracking.",
      login: "A simple login form with username and password authentication fields."
    };
    return descriptions[key] || "Dynamic form example";
  }
}
