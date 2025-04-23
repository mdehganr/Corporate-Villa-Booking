import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BookingHistory, Guest, WaitList } from '../data/BookingHistory';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BookingHistoryService } from '../services/booking-history.service';
import { MatTableModule } from '@angular/material/table';

import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-calender',
  imports: [ButtonModule, TableModule, CommonModule, MatTableModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule],
  templateUrl: './calender.component.html',
  styleUrl: './calender.component.scss'
})

export class CalenderComponent implements OnInit {

  bookingHistory: BookingHistory[] = []

  constructor(private bookingHistoryService: BookingHistoryService) { }

  ngOnInit() {
    this.getBookingHistory();
  }


  getBookingHistory() {
    this.bookingHistoryService.getBookingHistory()
      .subscribe(bookingHistory => this.bookingHistory = bookingHistory);
  }
}

