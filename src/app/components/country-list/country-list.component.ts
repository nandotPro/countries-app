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
    // Recupera o estado da paginação do localStorage
    this.restorePaginationState();
    this.loadCountries();
  }

  // Salva o estado atual da paginação
  savePaginationState(): void {
    const paginationState = {
      currentPage: this.currentPage,
      first: this.first
    };
    localStorage.setItem('paginationState', JSON.stringify(paginationState));
  }

  // Restaura o estado da paginação
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
      this.savePaginationState(); // Salva o estado após mudar de página
    }
  }

  prevPage(): void {
    if (this.first - this.rows >= 0) {
      this.first -= this.rows;
      this.currentPage--;
      this.updateDisplayedCountries();
      this.savePaginationState(); // Salva o estado após mudar de página
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

  // Adicionar método para quando clicar em um país
  onCountryClick(): void {
    this.savePaginationState(); // Salva o estado antes de navegar para os detalhes
  }
}
