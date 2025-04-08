import { Component } from '@angular/core';
import { BookingHistory, Guest } from '../data/BookingHistory';
@Component({
  selector: 'app-calender',
  imports: [],
  templateUrl: './calender.component.html',
  styleUrl: './calender.component.scss'
})
export class CalenderComponent {
  bookingHistory: BookingHistory[] = [
    { id: 1, title: "Darrell", from: new Date(), to: new Date(), guests: [new Guest("Darrell", 30), new Guest("John", 25)] },
  ]
}
