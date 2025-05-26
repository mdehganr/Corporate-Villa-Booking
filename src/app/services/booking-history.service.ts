import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookingHistory } from '../data/BookingHistory';
import { Booking } from '../data/Booking';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingHistoryService {
  private apiUrl = "http://localhost:5114"; // Replace with your API URL

  constructor(private http: HttpClient) { }

  // getBookingHistory(): Observable<Booking[]> {
  //   return this.http.get<Booking[]>(`${this.apiUrl}/api/Booking`).pipe(
  //     map(bookings => bookings.map(b => ({
  //       ...b,
  //       from: new Date(b.startDate),
  //       to: new Date(b.endDate)
  //     })))
  //   );
  // }
  getBookingHistory(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/api/booking`);
  }
  saveBooking(booking: Booking): Observable<Booking> {
    console.log('Booking:', booking);
    return this.http.post<Booking>(`${this.apiUrl}/api/Booking`, booking, { headers: { 'Content-Type': 'application/json' } });
  }
}
