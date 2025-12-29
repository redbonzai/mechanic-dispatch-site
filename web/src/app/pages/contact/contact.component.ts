import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  submitted = false;
  submitting = false;

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.submitting = true;
      // In a real application, you would send this to your backend API
      setTimeout(() => {
        this.submitted = true;
        this.submitting = false;
        this.contactForm.reset();
        setTimeout(() => {
          this.submitted = false;
        }, 5000);
      }, 1000);
    }
  }
}


















