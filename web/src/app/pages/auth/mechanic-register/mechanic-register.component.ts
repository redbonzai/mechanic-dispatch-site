import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { MechanicAuthService } from '../../../services/mechanic-auth.service';
import { SubscriptionService } from '../../../services/subscription.service';
import { SubscriptionPlan } from '../../../models/auth.models';
import { environment } from '../../../../environments/environment';

interface Skill {
  id: string;
  name: string;
  category?: string;
}

@Component({
  selector: 'app-mechanic-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './mechanic-register.component.html',
  styleUrls: ['./mechanic-register.component.scss'],
})
export class MechanicRegisterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardElement') cardElementRef!: ElementRef;

  step = signal(1);
  loading = signal(false);
  error = signal('');
  availableSkills = signal<Skill[]>([]);
  plans = signal<SubscriptionPlan[]>([]);
  selectedTier = signal('PRO');
  cardError = signal('');
  subscriptionSuccess = signal(false);

  private stripe: Stripe | null = null;
  private card: StripeCardElement | null = null;

  form = {
    email: '',
    password: '',
    name: '',
    location: '',
    shopName: '',
    phone: '',
    website: '',
    bio: '',
    yearsExperience: 0,
    certifications: '',
    selectedSkillIds: [] as string[],
  };

  constructor(
    private readonly authService: MechanicAuthService,
    private readonly subscriptionService: SubscriptionService,
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.http
      .get<Skill[]>(`${environment.apiUrl}/mechanics/skills`)
      .subscribe({ next: (skills) => this.availableSkills.set(skills) });

    this.subscriptionService
      .getPlans()
      .subscribe({ next: (plans) => this.plans.set(plans) });
  }

  async ngAfterViewInit() {
    if (environment.stripePublishableKey) {
      this.stripe = await loadStripe(environment.stripePublishableKey);
    }
  }

  ngOnDestroy() {
    this.card?.destroy();
  }

  nextStep() {
    this.step.update((s) => s + 1);
    // Mount Stripe card element when step 4 is shown
    if (this.step() === 4) {
      setTimeout(() => this.mountCard(), 100);
    }
  }

  prevStep() {
    this.step.update((s) => s - 1);
  }

  private mountCard() {
    if (!this.stripe || !this.cardElementRef) return;
    this.card?.destroy();
    const elements = this.stripe.elements();
    this.card = elements.create('card', {
      style: {
        base: {
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: '15px',
          color: '#0f172a',
          '::placeholder': { color: '#94a3b8' },
        },
        invalid: { color: '#dc2626' },
      },
    });
    this.card.mount(this.cardElementRef.nativeElement);
    this.card.on('change', (event) => {
      this.cardError.set(event.error?.message ?? '');
    });
  }

  toggleSkill(skillId: string) {
    const current = this.form.selectedSkillIds;
    const idx = current.indexOf(skillId);
    this.form.selectedSkillIds =
      idx === -1 ? [...current, skillId] : current.filter((id) => id !== skillId);
  }

  isSkillSelected(skillId: string): boolean {
    return this.form.selectedSkillIds.includes(skillId);
  }

  // Step 3 — register the account, then advance to step 4
  submitAccount() {
    this.loading.set(true);
    this.error.set('');

    const certs = this.form.certifications
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    this.authService
      .register({
        email: this.form.email,
        password: this.form.password,
        name: this.form.name,
        location: this.form.location,
        shopName: this.form.shopName || undefined,
        phone: this.form.phone || undefined,
        website: this.form.website || undefined,
        bio: this.form.bio || undefined,
        yearsExperience: this.form.yearsExperience,
        certifications: certs,
        skillIds: this.form.selectedSkillIds,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.nextStep(); // advance to step 4 (subscription)
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
          this.loading.set(false);
        },
      });
  }

  // Step 4 — tokenize card with Stripe, then call backend subscription endpoint
  async submitSubscription() {
    if (!this.stripe || !this.card) {
      // No Stripe key configured — skip to dashboard (dev mode)
      void this.router.navigate(['/mechanic-dashboard']);
      return;
    }

    this.loading.set(true);
    this.cardError.set('');
    this.error.set('');

    const result = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.card,
    });

    if (result.error) {
      this.cardError.set(result.error.message ?? 'Card error');
      this.loading.set(false);
      return;
    }

    this.subscriptionService
      .createSubscription(this.selectedTier(), result.paymentMethod.id)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.subscriptionSuccess.set(true);
          setTimeout(() => void this.router.navigate(['/mechanic-dashboard']), 2500);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Subscription failed. Please try again.');
          this.loading.set(false);
        },
      });
  }

  skipSubscription() {
    void this.router.navigate(['/mechanic-dashboard']);
  }

  skillsByCategory(): Record<string, Skill[]> {
    const result: Record<string, Skill[]> = {};
    for (const skill of this.availableSkills()) {
      const cat = skill.category ?? 'General';
      if (!result[cat]) result[cat] = [];
      result[cat].push(skill);
    }
    return result;
  }

  categoryEntries(): [string, Skill[]][] {
    return Object.entries(this.skillsByCategory());
  }

  formatPrice(cents: number): string {
    return `$${Math.round(cents / 100)}/mo`;
  }
}
