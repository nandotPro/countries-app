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
    SearchBarComponent
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

  constructor(
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
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
        this.totalRecords = countries.length;
        
        
        if (this.searchTerm) {
          this.filterCountries(this.searchTerm);
        } else {
          this.paginate(this.first, this.rows);
        }
      });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 0;
    this.first = 0;
    this.filterCountries(term);
  }

  filterCountries(searchTerm?: string): void {
    let filtered = [...this.allCountries];
    
    // Apply search filter if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(country => 
        country.name.common.toLowerCase().includes(term) ||
        country.name.official.toLowerCase().includes(term)
      );
    }
    
    this.totalRecords = filtered.length;
    this.countries = filtered.slice(this.first, this.first + this.rows);
  }

  nextPage(): void {
    if (this.first + this.rows < this.totalRecords) {
      this.first += this.rows;
      this.currentPage++;
      this.updateDisplayedCountries();
    }
  }

  prevPage(): void {
    if (this.first - this.rows >= 0) {
      this.first -= this.rows;
      this.currentPage--;
      this.updateDisplayedCountries();
    }
  }

  paginate(first: number, rows: number): void {
    let filtered = this.searchTerm ? 
      this.allCountries.filter(country => 
        country.name.common.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        country.name.official.toLowerCase().includes(this.searchTerm.toLowerCase())
      ) : 
      this.allCountries;
    
    this.countries = filtered.slice(first, first + rows);
  }

  updateDisplayedCountries(): void {
    this.paginate(this.first, this.rows);
  }
}
