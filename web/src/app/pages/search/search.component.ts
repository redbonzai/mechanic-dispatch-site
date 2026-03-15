import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../services/search.service';
import { UserAuthService } from '../../services/user-auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { SearchResult, RepairGuideResult, MechanicSummary } from '../../models/search.models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  query = signal('');
  make = signal('');
  model = signal('');
  year = signal('');

  results = signal<SearchResult | null>(null);
  loading = signal(false);
  error = signal('');
  showRegisterPrompt = signal(false);
  selectedGuide = signal<RepairGuideResult | null>(null);

  readonly currentYear = new Date().getFullYear();
  readonly years = Array.from({ length: 35 }, (_, i) => this.currentYear - i);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly searchService: SearchService,
    readonly userAuth: UserAuthService,
    private readonly analytics: AnalyticsService,
  ) {}

  ngOnInit() {
    // Pre-fill make/model/year from persisted vehicle state
    const sv = this.userAuth.searchVehicle();
    if (sv.make) this.make.set(sv.make);
    if (sv.model) this.model.set(sv.model);
    if (sv.year) this.year.set(sv.year);

    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.query.set(params['q'] as string);
        // URL params override persisted values when explicitly present
        if (params['make'] !== undefined) this.make.set(params['make'] as string);
        if (params['model'] !== undefined) this.model.set(params['model'] as string);
        if (params['year'] !== undefined) this.year.set(params['year'] as string);
        this.runSearch();
      }
    });
  }

  search() {
    const q = this.query().trim();
    if (!q) return;

    // Persist the selected vehicle filters
    this.userAuth.setSearchVehicle({
      make: this.make(),
      model: this.model(),
      year: this.year(),
    });

    void this.router.navigate(['/search'], {
      queryParams: {
        q,
        ...(this.make() ? { make: this.make() } : {}),
        ...(this.model() ? { model: this.model() } : {}),
        ...(this.year() ? { year: this.year() } : {}),
      },
    });
  }

  private runSearch() {
    const q = this.query().trim();
    if (!q) return;

    this.loading.set(true);
    this.error.set('');

    const shouldPrompt = this.userAuth.incrementAnonSearchCount();

    this.analytics.searchFix(
      q,
      this.make() || undefined,
      this.model() || undefined,
      this.year() ? parseInt(this.year(), 10) : undefined,
    );

    this.searchService
      .searchFixes({
        q,
        make: this.make() || undefined,
        model: this.model() || undefined,
        year: this.year() ? parseInt(this.year(), 10) : undefined,
      })
      .subscribe({
        next: (results) => {
          this.results.set(results);
          this.loading.set(false);
          if (shouldPrompt) {
            this.showRegisterPrompt.set(true);
          }
        },
        error: () => {
          this.error.set('Search failed. Please try again.');
          this.loading.set(false);
        },
      });
  }

  selectGuide(guide: RepairGuideResult) {
    this.selectedGuide.update((current) =>
      current?.title === guide.title ? null : guide,
    );
  }

  trackMechanicClick(mechanic: MechanicSummary) {
    // Prompt registration if anonymous
    if (!this.userAuth.isLoggedIn()) {
      this.showRegisterPrompt.set(true);
    }
    this.searchService
      .trackMechanicView(mechanic.id, { source: 'search_result', clickedLink: true })
      .subscribe({ error: () => null });
  }

  dismissPrompt() {
    this.showRegisterPrompt.set(false);
  }

  formatCost(minCents?: number, maxCents?: number): string {
    if (!minCents && !maxCents) return 'Cost varies';
    const fmt = (c: number) => `$${Math.round(c / 100)}`;
    if (minCents && maxCents) return `${fmt(minCents)} – ${fmt(maxCents)}`;
    if (minCents) return `from ${fmt(minCents)}`;
    return `up to ${fmt(maxCents!)}`;
  }

  formatTime(minutes?: number): string {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  difficultyColor(difficulty: string): string {
    const map: Record<string, string> = {
      BEGINNER: '#10b981',
      INTERMEDIATE: '#f59e0b',
      ADVANCED: '#ef4444',
      PROFESSIONAL: '#8b5cf6',
    };
    return map[difficulty] ?? '#64748b';
  }

  difficultyLabel(difficulty: string): string {
    return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.search();
  }
}
