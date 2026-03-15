import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SearchService } from '../../services/search.service';
import { environment } from '../../../environments/environment';

interface MechanicCard {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  location: string;
  rating: number;
  reviewCount: number;
  subscriptionTier: string | null;
  bio: string | null;
  certifications: string[];
  skills: Array<{ skill: { name: string; category?: string } }>;
  yearsExperience: number;
  profileViews: number;
}

interface MechanicsResponse {
  mechanics: MechanicCard[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-mechanics-directory',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './mechanics-directory.component.html',
  styleUrls: ['./mechanics-directory.component.scss'],
})
export class MechanicsDirectoryComponent implements OnInit {
  mechanics = signal<MechanicCard[]>([]);
  total = signal(0);
  loading = signal(false);
  hoveredId = signal<string | null>(null);

  page = signal(1);
  limit = 16;
  filterSkill = signal('');
  filterLocation = signal('');

  constructor(
    private readonly http: HttpClient,
    private readonly searchService: SearchService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', String(this.page()))
      .set('limit', String(this.limit))
      .set('isActive', 'true');

    if (this.filterSkill()) params = params.set('skill', this.filterSkill());
    if (this.filterLocation())
      params = params.set('location', this.filterLocation());

    this.http
      .get<MechanicsResponse>(`${environment.apiUrl}/mechanics`, { params })
      .subscribe({
        next: (res) => {
          this.mechanics.set(res.mechanics ?? []);
          this.total.set(res.total ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  applyFilters() {
    this.page.set(1);
    this.load();
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  nextPage() {
    if (this.page() * this.limit < this.total()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  get totalPages() {
    return Math.ceil(this.total() / this.limit);
  }

  setHovered(id: string | null) {
    this.hoveredId.set(id);
  }

  trackView(mechanic: MechanicCard) {
    this.searchService
      .trackMechanicView(mechanic.id, { source: 'directory' })
      .subscribe({ error: () => null });
  }

  getSkillNames(mech: MechanicCard): string[] {
    return mech.skills.map((s) => s.skill.name);
  }

  tierLabel(tier: string | null): string {
    const map: Record<string, string> = {
      PREMIUM: 'Featured',
      PRO: 'Pro',
      BASIC: '',
    };
    return tier ? (map[tier] ?? '') : '';
  }
}
