import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookingHistory } from '../data/BookingHistory';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingHistoryService {
  private apiUrl = "http://localhost:5097"; // Replace with your API URL

  constructor(private http: HttpClient) { }

  getBookingHistory(): Observable<BookingHistory[]> {
    return this.http.get<BookingHistory[]>(`${this.apiUrl}/api/Bookings`).pipe(
      map(bookings => bookings.map(b => ({
        ...b,
        from: new Date(b.from),
        to: new Date(b.to)
      })))
    );
  }
}
