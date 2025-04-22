import { Component } from '@angular/core';
import { BookingHistory, Guest, WaitList } from '../data/BookingHistory';
import { ButtonModule } from 'primeng/button';
import { Product } from '../data/Product';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-calender',
  imports: [ButtonModule, TableModule, CommonModule],
  templateUrl: './calender.component.html',
  styleUrl: './calender.component.scss'
})

export class CalenderComponent {
  products: Product[] = [
    {
      id: 1000,
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5
    },
    {
      id: 324,
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5
    },
  ];

  bookingHistory: BookingHistory[] = [
    { id: 1, title: "Darrell", from: new Date(), to: new Date(), guests: [new Guest("Darrell", 30), new Guest("John", 25)], waitLists: [new WaitList(1, "Darrell"), new WaitList(2, "John")] },
    { id: 2, title: "Josh", from: new Date(), to: new Date(), guests: [new Guest("Josh", 25), new Guest("Vahed", 19)], waitLists: [new WaitList(1, "Bella"), new WaitList(2, "Sara")] },
  ]


}
