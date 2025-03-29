import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl = 'https://restcountries.com/v3.1';

  constructor(private http: HttpClient) { }

  getAllCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/all?fields=name,flags,population,region,capital,cca3`);
  }

  getCountryByCode(code: string): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/alpha/${code}`);
  }

  getCountryByName(name: string): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/name/${name}`);
  }

  getCountriesByCodes(codes: string[]): Observable<Country[]> {
    const codesParam = codes.join(',');
    return this.http.get<Country[]>(`${this.apiUrl}/alpha?codes=${codesParam}`);
  }
}
