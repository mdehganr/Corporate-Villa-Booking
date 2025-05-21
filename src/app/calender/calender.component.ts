import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BookingHistory, Guest, WaitList } from '../data/BookingHistory';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BookingHistoryService } from '../services/booking-history.service';
import { MatTableModule } from '@angular/material/table';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { Booking } from '../data/Booking';

@Component({
  selector: 'app-calender',
  imports: [ButtonModule, TableModule, CommonModule, MatTableModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './calender.component.html',
  styleUrl: './calender.component.scss',
})

export class CalenderComponent implements OnInit {

  booking: Booking[] = []
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  busyDates: Date[] = [
    new Date(2025, 5, 25), // May 25, 2025
    new Date(2025, 5, 26), // May 26, 2025

  ];

  constructor(private bookingHistoryService: BookingHistoryService) { }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;

    const busyDateStrings = this.busyDates.map(d =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString()
    );

    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();

    return !busyDateStrings.includes(current); // allow only if not busy
  };

  ngOnInit() {
    this.getBookingHistory();
  }

  book() {
    const startDate: Date = this.range.get('start')?.value;
    const endDate: Date = this.range.get('end')?.value;

    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    if (!startDate || !endDate) {
      console.warn("Start or end date is missing");
      return;
    }

    const booking: Booking = {
      id: 0, // or undefined if your API auto-generates it
      employeeEmail: 'user@example.com', // replace with actual value
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    // Example of formatting:
    if (startDate && endDate) {
      const formattedStart = startDate.toISOString().split('T')[0];
      const formattedEnd = endDate.toISOString().split('T')[0];
      console.log('Formatted:', formattedStart, 'to', formattedEnd);
    }

    this.bookingHistoryService.saveBooking(booking)
      .subscribe({
        next: (savedBooking) => {
          console.log('Booking saved:', savedBooking);
          this.getBookingHistory(); // Refresh the list
        },
        error: (err) => {
          // console.error('Failed to save booking:', err);
        }
      });

  }



  getBookingHistory() {
    this.bookingHistoryService.getBookingHistory()
      .subscribe(booking => this.booking = booking);
  }
}

