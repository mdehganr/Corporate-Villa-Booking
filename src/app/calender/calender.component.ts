import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BookingHistory, Guest, WaitList } from '../data/BookingHistory';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BookingHistoryService } from '../services/booking-history.service';
import { WebSocketService, BookingEvent } from '../services/websocket.service';
import { MatTableModule } from '@angular/material/table';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { Booking } from '../data/Booking';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { BookingResponse } from '../data/BookingResponse';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { WaitlistDialogComponent } from '../shared/waitlist-dialog/waitlist-dialog.component';

@Component({
  selector: 'app-calender',
  imports: [
    ButtonModule, MatSortModule, MatIconModule, MatButtonModule,
    TableModule, MatInputModule, CommonModule, MatTableModule,
    MatDatepickerModule, MatNativeDateModule, MatFormFieldModule,
    ReactiveFormsModule, MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './calender.component.html',
  styleUrl: './calender.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CalenderComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['fullName', 'employeeEmail', 'guest', 'startDate', 'endDate', 'waitlist', 'actions'];
  dataSource = new MatTableDataSource<Booking>();
  @ViewChild(MatSort) sort!: MatSort;

  booking: Booking[] = [];
  private subscriptions: Subscription[] = [];
  isConnected = false;

  busyDates: Date[] = [
    new Date(2025, 5, 25), // May 25, 2025
    new Date(2025, 5, 26), // May 26, 2025
  ];

  bookingForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    employeeEmail: new FormControl('', [Validators.required, Validators.email]),
    guest: new FormControl(),
    start: new FormControl(),
    end: new FormControl(),
    waitlist: new FormControl(false)
  });

  constructor(
    private bookingHistoryService: BookingHistoryService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getBookingHistory();
    this.setupRealtimeUpdates();
    this.setupConnectionStatus();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketService.disconnect();
  }

  private setupRealtimeUpdates(): void {
    const bookingUpdatesSub = this.webSocketService.getBookingUpdates().subscribe({
      next: (event: BookingEvent) => {
        this.handleRealtimeUpdate(event);
      },
      error: (error) => {
        console.error('Error receiving real-time updates:', error);
        this.showNotification('Connection error occurred', 'error');
      }
    });

    this.subscriptions.push(bookingUpdatesSub);
  }

  private setupConnectionStatus(): void {
    const connectionSub = this.webSocketService.getConnectionStatus().subscribe({
      next: (isConnected: boolean) => {
        this.isConnected = isConnected;
        if (isConnected) {
          this.showNotification('Real-time updates connected', 'success');
        } else {
          this.showNotification('Real-time updates disconnected', 'warning');
        }
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(connectionSub);
  }

  private handleRealtimeUpdate(event: BookingEvent): void {
    const currentData = this.dataSource.data;

    switch (event.type) {
      case 'CREATE':
        // Add new booking to the table
        this.dataSource.data = [...currentData, event.booking];
        this.showNotification(`New booking created by ${event.booking.fullName}`, 'success');
        this.updateBusyDates();
        break;

      case 'UPDATE':
        // Update existing booking
        const updateIndex = currentData.findIndex(b => b.id === event.booking.id);
        if (updateIndex !== -1) {
          currentData[updateIndex] = event.booking;
          this.dataSource.data = [...currentData];
          this.showNotification(`Booking updated by ${event.booking.fullName}`, 'error');
          this.updateBusyDates();
        }
        break;

      case 'DELETE':
        // Remove booking from table
        this.dataSource.data = currentData.filter(b => b.id !== event.booking.id);
        this.showNotification(`Booking cancelled by ${event.booking.fullName}`, 'error');
        this.updateBusyDates();
        break;
    }

    this.cdr.detectChanges();
  }

  private updateBusyDates(): void {
    // Update busy dates based on current bookings
    this.busyDates = this.dataSource.data.flatMap(booking => {
      const dates: Date[] = [];
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    });
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {

    const config = {
      duration: 3000,
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const,
      panelClass: [`snackbar-${type}`]
    };

    this.snackBar.open(message, 'Close', config);
  }

  // dateFilter = (date: Date | null): boolean => {
  //   if (!date) return false;

  //   const busyDateStrings = this.busyDates.map(d =>
  //     new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString()
  //   );

  //   const current = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();

  //   return !busyDateStrings.includes(current);
  // };

  book() {
    const startDate: Date = this.bookingForm.get('start')?.value;
    const endDate: Date = this.bookingForm.get('end')?.value;

    if (!startDate || !endDate) {
      this.showNotification("Start or end date is missing", 'error');
      return;
    }

    if (!this.bookingForm.valid) {
      this.showNotification("Please fill in all required fields", 'error');
      return;
    }

    const newBooking = new Booking(
      0,
      this.bookingForm.get('fullName')?.value ?? '',
      this.bookingForm.get('employeeEmail')?.value ?? '',
      this.bookingForm.get('guest')?.value ?? '',
      startDate.toISOString(),
      endDate.toISOString(),
      this.bookingForm.get('waitlist')?.value ?? false
    );

    this.bookingHistoryService.saveBooking(newBooking).subscribe({
      next: (response: BookingResponse) => {
        this.showNotification(response.message || 'Booking created successfully!',
          response.success ? 'success' : 'warning');

        if (response.success) {
          this.bookingForm.reset();
          this.getBookingHistory();
        }
      },
      error: (err) => {
        console.error('Failed to save booking:', err);
        const errorMessage = err.status === 400
          ? err.error
          : err.error?.message || 'Failed to create booking';

        if (err.error === "These dates are already booked") {
          const dialogRef = this.dialog.open(WaitlistDialogComponent, {
            width: '400px'
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              // User wants to join waitlist
              const waitlistBooking = {
                ...newBooking,
                waitlist: true
              };
              this.bookingHistoryService.saveBooking(waitlistBooking).subscribe({
                next: (response: BookingResponse) => {
                  this.showNotification('Successfully added to waitlist', 'success');
                  this.bookingForm.reset();
                  this.getBookingHistory();
                },
                error: (error) => {
                  this.showNotification('Failed to add to waitlist', 'error');
                }
              });
            } else {
              this.showNotification('Booking cancelled', 'info');
            }
          });
        } else {
          this.showNotification(errorMessage, 'error');
        }
      },
    });
  }

  onEdit(booking: Booking) {
    // Implement edit functionality
    console.log('Edit booking:', booking);
    // You would typically open a dialog or navigate to edit form
    this.showNotification('Edit functionality to be implemented', 'info');
  }

  // onDelete(booking: Booking) {
  //   if (confirm(`Are you sure you want to delete the booking for ${booking.fullName}?`)) {
  //     this.bookingHistoryService.deleteBooking(booking.id).subscribe({
  //       next: () => {
  //         this.showNotification('Booking deleted successfully!', 'success');
  //         // Real-time update will handle removal from table
  //         this.getBookingHistory();
  //       },
  //       error: (err) => {
  //         console.error('Failed to delete booking:', err);
  //         this.showNotification('Failed to delete booking', 'error');
  //       }
  //     });
  //   }
  // }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  getBookingHistory() {
    this.bookingHistoryService.getBookingHistory().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.updateBusyDates();
      },
      error: (err) => {
        console.error('Failed to load booking history:', err);
        this.showNotification('Failed to load bookings', 'error');
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
}