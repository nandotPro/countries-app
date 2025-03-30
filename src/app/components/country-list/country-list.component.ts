import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Country } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    CardModule, 
    ButtonModule, 
    PaginatorModule, 
    ProgressSpinnerModule,
    SearchBarComponent,
    DropdownModule,
    FormsModule
  ],
  templateUrl: './country-list.component.html',
  styleUrl: './country-list.component.scss'
})
export class CountryListComponent implements OnInit {
  allCountries: Country[] = [];
  countries: Country[] = [];
  loading: boolean = true;
  error: boolean = false;
  
  // Pagination
  first: number = 0;
  rows: number = 9; // 9 items per page
  totalRecords: number = 0;
  currentPage: number = 0;
  searchTerm: string = '';
  regions: { label: string, value: string }[] = [
    { label: 'Todas as regiões', value: '' },
    { label: 'África', value: 'Africa' },
    { label: 'Américas', value: 'Americas' },
    { label: 'Ásia', value: 'Asia' },
    { label: 'Europa', value: 'Europe' },
    { label: 'Oceania', value: 'Oceania' }
  ];
  selectedRegion: string = '';

  constructor(
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    // Restore the pagination state from localStorage
    this.restorePaginationState();
    this.loadCountries();
  }

  // Save the current pagination state
  savePaginationState(): void {
    const paginationState = {
      currentPage: this.currentPage,
      first: this.first
    };
    localStorage.setItem('paginationState', JSON.stringify(paginationState));
  }

  // Restore the pagination state
  restorePaginationState(): void {
    const savedState = localStorage.getItem('paginationState');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.currentPage = state.currentPage;
      this.first = state.first;
    }
  }

  loadCountries(): void {
    this.loading = true;
    this.error = false;
    
    this.countryService.getAllCountries()
      .pipe(
        catchError(error => {
          console.error('Error loading countries:', error);
          this.error = true;
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(countries => {
        this.allCountries = countries;
        this.applyFilters();
      });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 0;
    this.first = 0;
    this.applyFilters();
  }

  onRegionChange(event: any): void {
    this.selectedRegion = event.value;
    this.first = 0;
    this.currentPage = 0;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allCountries];
    
    // Region filter
    if (this.selectedRegion) {
      filtered = filtered.filter(country => {
        const matches = country.region === this.selectedRegion;
        return matches;
      });
    }
        
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(country => 
        country.name.common.toLowerCase().includes(term) ||
        country.name.official.toLowerCase().includes(term)
      );
    }
        
    this.totalRecords = filtered.length;
    this.countries = filtered.slice(this.first, this.first + this.rows);
    this.savePaginationState();
  }

  paginate(first: number, rows: number): void {
    let filtered = this.searchTerm || this.selectedRegion ? 
      this.allCountries.filter(country => {
        let matchesSearch = true;
        let matchesRegion = true;
        
        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          matchesSearch = country.name.common.toLowerCase().includes(term) ||
                          country.name.official.toLowerCase().includes(term);
        }
        
        if (this.selectedRegion) {
          matchesRegion = country.region === this.selectedRegion;
        }
        
        return matchesSearch && matchesRegion;
      }) : 
      this.allCountries;
    
    this.countries = filtered.slice(first, first + rows);
  }

  nextPage(): void {
    if (this.first + this.rows < this.totalRecords) {
      this.first += this.rows;
      this.currentPage++;
      this.updateDisplayedCountries();
      this.savePaginationState(); // Save the state after changing page
    }
  }

  prevPage(): void {
    if (this.first - this.rows >= 0) {
      this.first -= this.rows;
      this.currentPage--;
      this.updateDisplayedCountries();
      this.savePaginationState(); // Save the state after changing page
    }
  }

  updateDisplayedCountries(): void {
    this.paginate(this.first, this.rows);
  }

  onCountryClick(): void {
    this.savePaginationState(); // Save the state before navigating to details
  }
}
