import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BookingHistory, Guest, WaitList } from '../data/BookingHistory';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BookingHistoryService } from '../services/booking-history.service';
import { MatTableModule } from '@angular/material/table';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-calender',
  imports: [ButtonModule, TableModule, CommonModule, MatTableModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule,ReactiveFormsModule],
  templateUrl: './calender.component.html',
  styleUrl: './calender.component.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CalenderComponent implements OnInit {

  bookingHistory: BookingHistory[] = []
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  constructor(private bookingHistoryService: BookingHistoryService) { }

  ngOnInit() {
    this.getBookingHistory();
  }

  printDates() {
    const startDate: Date = this.range.get('start')?.value;
    const endDate: Date = this.range.get('end')?.value;

    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    // Example of formatting:
    if (startDate && endDate) {
      const formattedStart = startDate.toISOString().split('T')[0];
      const formattedEnd = endDate.toISOString().split('T')[0];
      console.log('Formatted:', formattedStart, 'to', formattedEnd);
    }
  }


  getBookingHistory() {
    this.bookingHistoryService.getBookingHistory()
      .subscribe(bookingHistory => this.bookingHistory = bookingHistory);
  }
}

