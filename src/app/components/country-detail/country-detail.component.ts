import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Country } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ButtonModule, 
    ProgressSpinnerModule
  ],
  templateUrl: './country-detail.component.html',
  styleUrl: './country-detail.component.scss'
})
export class CountryDetailComponent implements OnInit {
  country: Country | null = null;
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.loadCountry();
  }

  loadCountry(): void {
    this.loading = true;
    this.error = false;
    
    // Get country code from route
    const countryCode = this.route.snapshot.paramMap.get('id');
    
    if (!countryCode) {
      this.error = true;
      this.loading = false;
      return;
    }
    
    // Fetch country using RxJS operators for error handling
    this.countryService.getCountryByCode(countryCode)
      .pipe(
        catchError(error => {
          console.error('Error loading country:', error);
          this.error = true;
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(countries => {
        if (countries && countries.length > 0) {
          this.country = countries[0];
        } else {
          this.error = true;
        }
      });
  }

  // Formats languages 
  getLanguages(): string {
    if (!this.country?.languages) return 'N/A';
    return Object.values(this.country.languages).join(', ');
  }


  // Formats currencies 
  getCurrencies(): string {
    if (!this.country?.currencies) return 'N/A';
    return Object.values(this.country.currencies)
      .map(currency => `${currency.name} (${currency.symbol})`)
      .join(', ');
  }
}
