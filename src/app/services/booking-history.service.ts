import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookingHistory } from '../data/BookingHistory';
import { Booking } from '../data/Booking';
import { Observable, map } from 'rxjs';
import { BookingResponse } from '../data/BookingResponse';
import { BookingStatus } from '../data/BookingStatus';

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
  saveBooking(booking: Booking): Observable<BookingResponse> {
    // Check for date conflicts
    return this.http.post<BookingResponse>(`${this.apiUrl}/api/booking`, {
      ...booking,
      waitlist: booking.BookingStatus
    });
  }
  deleteBooking(id: number) {
    return new Error('Method not implemented.');
  }

  UpdateStatus(id: number, status: BookingStatus): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/booking/${id}/status`, { status });
  }

}
