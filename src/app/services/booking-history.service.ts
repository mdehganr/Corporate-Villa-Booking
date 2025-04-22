import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BookingHistoryService {
  private apiUrl = "https://localhost:7150"; // Replace with your API URL

  constructor(private http: HttpClient) {
  }
}
