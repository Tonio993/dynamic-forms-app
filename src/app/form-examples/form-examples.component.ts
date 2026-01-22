import { Component, signal, computed } from '@angular/core';
import { timer } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FormConfig } from '../models/form-config.model';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Component that displays a collection of example form configurations.
 * 
 * This component provides a tabbed interface showcasing various form examples,
 * including registration forms, contact forms, surveys, and forms with subforms.
 * It demonstrates the capabilities of the dynamic form system with real-world
 * use cases.
 * 
 * The component includes examples that demonstrate:
 * - Basic field types and validation
 * - Custom validators
 * - Subform arrays with drag-and-drop
 * - Pre-filled form values
 * 
 * @public
 */
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
  /** Signal containing the currently selected example key */
  selectedExample = signal<string>('registration');
  
  /** Index of the currently selected tab */
  selectedTabIndex = 0;

  /**
   * Collection of example form configurations.
   * 
   * Each key represents an example identifier, and the value is a complete
   * FormConfig object that demonstrates different aspects of the dynamic
   * form system.
   */
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
          placeholder: "Please share your message...",
          config: {
            minLength: 10,
            maxLength: 1000
          }
        }
      ]
    },
    survey: {
      name: "Customer Satisfaction Survey",
      fields: [
        {
          name: "satisfaction",
          type: "radio",
          required: true,
          label: "How satisfied are you with our service?",
          config: {
            options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
          }
        },
        {
          name: "recommend",
          type: "radio",
          required: true,
          label: "Would you recommend us to others?",
          config: {
            options: ["Definitely", "Probably", "Maybe", "Probably Not", "Definitely Not"]
          }
        },
        {
          name: "feedback",
          type: "textarea",
          required: false,
          label: "Additional Feedback",
          placeholder: "Please share any additional feedback...",
          config: {
            maxLength: 500
          }
        },
        {
          name: "contact",
          type: "checkbox",
          required: false,
          label: "I would like to be contacted for follow-up"
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
            maxLength: 100
          }
        },
        {
          name: "category",
          type: "select",
          required: true,
          label: "Category",
          config: {
            options: ["Electronics", "Clothing", "Food", "Books", "Home & Garden", "Other"]
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
            valueFrom: 0,
            step: 0.01
          }
        },
        {
          name: "stock",
          type: "number",
          required: true,
          label: "Stock Quantity",
          placeholder: "0",
          config: {
            min: 0,
            valueFrom: 0,
            step: 1
          }
        },
        {
          name: "description",
          type: "textarea",
          required: false,
          label: "Description",
          placeholder: "Enter product description...",
          config: {
            maxLength: 1000
          }
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
          label: "Username",
          placeholder: "Enter your username"
        },
        {
          name: "password",
          type: "password",
          required: true,
          label: "Password",
          placeholder: "Enter your password"
        },
        {
          name: "rememberMe",
          type: "checkbox",
          required: false,
          label: "Remember me"
        }
      ]
    },
    employee: {
      name: "Employee Registration with Addresses",
      fields: [
        {
          name: "firstName",
          type: "text",
          required: true,
          label: "First Name",
          placeholder: "Enter first name",
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
          placeholder: "Enter last name",
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
          placeholder: "employee@company.com"
        },
        {
          name: "phone",
          type: "text",
          required: false,
          label: "Phone Number",
          placeholder: "+1 (555) 123-4567"
        },
        {
          name: "department",
          type: "select",
          required: true,
          label: "Department",
          config: {
            options: ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"]
          }
        },
        {
          name: "addresses",
          type: "subform",
          required: true,
          label: "Addresses",
          config: {
            formConfig: {
              name: "Address Form",
              fields: [
                {
                  name: "street",
                  type: "text",
                  required: true,
                  label: "Street Address",
                  placeholder: "123 Main St"
                },
                {
                  name: "city",
                  type: "text",
                  required: true,
                  label: "City",
                  placeholder: "New York"
                },
                {
                  name: "state",
                  type: "text",
                  required: true,
                  label: "State",
                  placeholder: "NY"
                },
                {
                  name: "zipCode",
                  type: "text",
                  required: true,
                  label: "ZIP Code",
                  placeholder: "10001"
                },
                {
                  name: "country",
                  type: "select",
                  required: true,
                  label: "Country",
                  config: {
                    options: ["United States", "Canada", "United Kingdom", "Other"]
                  }
                },
                {
                  name: "addressType",
                  type: "radio",
                  required: false,
                  label: "Address Type",
                  config: {
                    options: ["Home", "Work", "Other"]
                  }
                }
              ]
            },
            minItems: 1,
            maxItems: 5,
            addButtonLabel: 'Add Address',
            deleteButtonLabel: 'Remove Address',
            allowDelete: true,
            confirmDelete: true,
            deleteConfirmationMessage: "Are you sure you want to remove this address?",
            allowDragDrop: true,
            getItemDescription: (formGroup: any, index: number) => {
              const street = formGroup.get('street')?.value || '';
              const city = formGroup.get('city')?.value || '';
              const state = formGroup.get('state')?.value || '';
              const zipCode = formGroup.get('zipCode')?.value || '';
              const country = formGroup.get('country')?.value || '';
              const addressType = formGroup.get('addressType')?.value || '';
              
              const parts: string[] = [];
              if (street) parts.push(street);
              if (city) parts.push(city);
              if (state) parts.push(state);
              if (zipCode) parts.push(zipCode);
              if (country) parts.push(country);
              if (addressType) parts.push(`(${addressType})`);
              
              return parts.length > 0 ? parts.join(', ') : `Address ${index + 1}`;
            }
          }
        },
        {
          name: "startDate",
          type: "date",
          required: false,
          label: "Start Date"
        },
        {
          name: "notes",
          type: "textarea",
          required: false,
          label: "Additional Notes",
          placeholder: "Any additional information...",
          config: {
            maxLength: 500
          }
        }
      ]
    },
    profileEdit: {
      name: "Edit Profile Form",
      fields: [
        { name: "firstName", type: "text", required: true, label: "First Name", placeholder: "Enter first name", config: { minLength: 2, maxLength: 50 } },
        { name: "lastName", type: "text", required: true, label: "Last Name", placeholder: "Enter last name", config: { minLength: 2, maxLength: 50 } },
        { name: "email", type: "email", required: true, label: "Email Address", placeholder: "your.email@example.com" },
        { name: "phone", type: "text", required: false, label: "Phone Number", placeholder: "+1 (555) 123-4567" },
        { name: "dateOfBirth", type: "date", required: false, label: "Date of Birth" },
        { name: "bio", type: "textarea", required: false, label: "Biography", placeholder: "Tell us about yourself...", config: { maxLength: 500 } },
        { name: "country", type: "select", required: true, label: "Country", config: { options: ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Spain", "Italy", "Other"] } },
        { name: "newsletter", type: "checkbox", required: false, label: "Subscribe to newsletter" },
        {
          name: "emergencyContacts",
          type: "subform",
          required: false,
          label: "Emergency Contacts",
          config: {
            formConfig: {
              name: "Emergency Contact Form",
              fields: [
                { name: "contactName", type: "text", required: true, label: "Name" },
                { name: "relationship", type: "select", required: true, label: "Relationship", config: { options: ["Spouse", "Parent", "Child", "Friend", "Other"] } },
                { name: "contactPhone", type: "text", required: false, label: "Phone" },
                { name: "contactEmail", type: "email", required: false, label: "Email" }
              ]
            },
            minItems: 0,
            maxItems: 3,
            addButtonLabel: "Add Contact",
            deleteButtonLabel: "Remove Contact",
            allowDragDrop: true,
            getItemDescription: (formGroup: any) => {
              const name = formGroup.get('contactName')?.value || 'Unnamed Contact';
              const relationship = formGroup.get('relationship')?.value || '';
              const phone = formGroup.get('contactPhone')?.value || '';
              return `${name} (${relationship}) - ${phone}`;
            }
          }
        }
      ]
    }
  };

  /**
   * Pre-filled form values for the profileEdit example.
   * 
   * This object demonstrates how to pre-fill a form with existing data,
   * including nested subform arrays.
   */
  profileEditValues = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    bio: "Software developer with 10+ years of experience in web development. Passionate about creating user-friendly applications.",
    country: "United States",
    newsletter: true,
    emergencyContacts: [
      { contactName: "Jane Doe", relationship: "Spouse", contactPhone: "555-111-2222", contactEmail: "jane.doe@example.com" },
      { contactName: "Robert Smith", relationship: "Friend", contactPhone: "555-333-4444", contactEmail: "robert.smith@example.com" }
    ]
  };

  /**
   * Computed signal containing all example keys.
   * 
   * @returns Array of example identifier strings
   */
  exampleKeys = computed(() => Object.keys(this.examples));

  /**
   * Gets pre-filled form values for a specific example.
   * 
   * Currently only the 'profileEdit' example has pre-filled values.
   * This method can be extended to support pre-filled values for other examples.
   * 
   * @param exampleKey - The identifier of the example
   * @returns Object containing form values, or undefined if no values are configured
   */
  getFormValues(exampleKey: string): Record<string, unknown> | undefined {
    if (exampleKey === 'profileEdit') {
      return this.profileEditValues;
    }
    return undefined;
  }

  /**
   * Selects an example by its key.
   * 
   * @param exampleKey - The identifier of the example to select
   */
  selectExample(exampleKey: string): void {
    this.selectedExample.set(exampleKey);
  }

  /**
   * Handles tab change events from the Material tabs component.
   * 
   * This method coordinates the tab animation with the content update. It updates
   * the tab index immediately for the animation, then delays the content update
   * to allow the Material tab animation to start first, creating a smoother
   * visual experience.
   * 
   * @param index - The index of the newly selected tab
   */
  onTabChange(index: number): void {
    const keys = this.exampleKeys();
    const nextTab = keys[index];
    if (nextTab) {
      this.selectedTabIndex = index;
      
      timer(150).subscribe(() => {
        this.selectedExample.set(nextTab);
      });
    }
  }

  /**
   * Gets the display title for an example.
   * 
   * @param key - The example identifier
   * @returns The display title string
   */
  getExampleTitle(key: string): string {
    const titles: { [key: string]: string } = {
      registration: "Registration",
      contact: "Contact Form",
      survey: "Survey",
      product: "Product Form",
      login: "Login",
      employee: "Employee with Subform",
      profileEdit: "Edit Profile (Pre-filled)"
    };
    return titles[key] || key;
  }

  /**
   * Gets the description text for an example.
   * 
   * @param key - The example identifier
   * @returns The description string explaining what the example demonstrates
   */
  getExampleDescription(key: string): string {
    const descriptions: { [key: string]: string } = {
      registration: "A comprehensive user registration form with validation for personal information and account creation.",
      contact: "A contact form for customer inquiries with subject categorization and message validation.",
      survey: "A customer satisfaction survey with rating options and feedback collection.",
      product: "A product information form for inventory management with pricing and stock tracking.",
      login: "A simple login form with username and password authentication fields.",
      employee: "An employee registration form demonstrating the subform input component. Add, edit, and delete multiple addresses for each employee.",
      profileEdit: "A profile edit form demonstrating pre-filled form values. This form is automatically populated with existing user data using the formValues input."
    };
    return descriptions[key] || "Dynamic form example";
  }
}
