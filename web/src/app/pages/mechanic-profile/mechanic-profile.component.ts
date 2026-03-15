import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SearchService } from '../../services/search.service';
import { UserAuthService } from '../../services/user-auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { environment } from '../../../environments/environment';

interface MechanicProfile {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  shopName: string | null;
  bio: string | null;
  phone: string | null;
  website: string | null;
  location: string;
  yearsExperience: number;
  certifications: string[];
  rating: number;
  reviewCount: number;
  profileViews: number;
  searchAppearances: number;
  linkClicks: number;
  subscriptionTier: string | null;
  isActive: boolean;
  skills: Array<{ skill: { id: string; name: string; category?: string } }>;
}

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  response: string | null;
  createdAt: string;
}

@Component({
  selector: 'app-mechanic-profile',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './mechanic-profile.component.html',
  styleUrls: ['./mechanic-profile.component.scss'],
})
export class MechanicProfileComponent implements OnInit {
  mechanic = signal<MechanicProfile | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  error = signal('');
  showRegisterPrompt = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly searchService: SearchService,
    readonly userAuth: UserAuthService,
    private readonly analytics: AnalyticsService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadMechanic(id);
      }
    });
  }

  private loadMechanic(id: string) {
    this.loading.set(true);
    this.http
      .get<MechanicProfile>(`${environment.apiUrl}/mechanics/${id}`)
      .subscribe({
        next: (m) => {
          this.mechanic.set(m);
          this.loading.set(false);
          this.trackView(id);
          this.loadReviews(id);
        },
        error: () => {
          this.error.set('This mechanic profile could not be found.');
          this.loading.set(false);
        },
      });
  }

  private loadReviews(mechanicId: string) {
    this.http
      .get<Review[]>(`${environment.apiUrl}/mechanics/${mechanicId}/reviews`)
      .subscribe({ next: (r) => this.reviews.set(r), error: () => null });
  }

  private trackView(mechanicId: string) {
    this.searchService
      .trackMechanicView(mechanicId, { source: 'profile_page' })
      .subscribe({ error: () => null });
    this.analytics.viewMechanicProfile(mechanicId, 'profile_page');
  }

  trackLinkClick(linkType: 'phone' | 'website' = 'phone') {
    const m = this.mechanic();
    if (!m) return;

    if (!this.userAuth.isLoggedIn()) {
      this.showRegisterPrompt.set(true);
    }

    this.analytics.clickMechanicLink(m.id, linkType);

    this.searchService
      .trackMechanicView(m.id, { source: 'profile_link', clickedLink: true })
      .subscribe({ error: () => null });
  }

  skillNames(): string[] {
    return this.mechanic()?.skills.map((s) => s.skill.name) ?? [];
  }

  starString(rating: number): string {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
