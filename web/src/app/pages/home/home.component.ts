import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserAuthService } from '../../services/user-auth.service';

interface Category {
  icon: string;
  label: string;
  query: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  searchQuery = signal('');
  selectedMake = signal('');
  selectedYear = signal('');

  readonly popularCategories: Category[] = [
    { icon: '🔴', label: 'Check Engine Light', query: 'check engine light' },
    { icon: '⚡', label: 'Car Won\'t Start', query: 'car not starting' },
    { icon: '🛑', label: 'Brake Problems', query: 'brake squealing grinding' },
    { icon: '🔋', label: 'Battery Issues', query: 'dead battery replacement' },
    { icon: '🌡️', label: 'Overheating', query: 'engine overheating' },
    { icon: '💧', label: 'Oil Leak', query: 'oil leak' },
    { icon: '🔧', label: 'Transmission', query: 'transmission slipping' },
    { icon: '💨', label: 'AC Not Cooling', query: 'ac not working' },
  ];

  readonly currentYear = new Date().getFullYear();
  readonly years = Array.from({ length: 35 }, (_, i) => this.currentYear - i);

  constructor(
    private readonly router: Router,
    private readonly userAuth: UserAuthService,
  ) {}

  ngOnInit() {
    // Restore last-used vehicle filters
    const sv = this.userAuth.searchVehicle();
    if (sv.make) this.selectedMake.set(sv.make);
    if (sv.year) this.selectedYear.set(sv.year);
  }

  search() {
    const q = this.searchQuery().trim();
    if (!q) return;

    // Persist selected filters before navigating
    this.userAuth.setSearchVehicle({
      make: this.selectedMake(),
      year: this.selectedYear(),
    });

    const params: Record<string, string> = { q };
    if (this.selectedMake()) params['make'] = this.selectedMake();
    if (this.selectedYear()) params['year'] = this.selectedYear();

    void this.router.navigate(['/search'], { queryParams: params });
  }

  searchCategory(query: string) {
    const sv = this.userAuth.searchVehicle();
    const params: Record<string, string> = { q: query };
    if (sv.make) params['make'] = sv.make;
    if (sv.year) params['year'] = sv.year;
    void this.router.navigate(['/search'], { queryParams: params });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.search();
  }
}
