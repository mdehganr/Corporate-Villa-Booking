import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BookingHistory, Guest, WaitList } from '../data/BookingHistory';
import { BookingStatus } from '../data/BookingStatus';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule, formatDate } from '@angular/common';
import { BookingHistoryService } from '../services/booking-history.service';
import { WebSocketService, BookingEvent } from '../services/websocket.service';
import { MatTableModule } from '@angular/material/table';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule, MatCalendarCellCssClasses } from '@angular/material/datepicker';
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
import { GoogleMapsModule } from '@angular/google-maps';
import { MatCardModule } from '@angular/material/card';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrl: './calender.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    ButtonModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    TableModule,
    MatInputModule,
    CommonModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule,
    GoogleMapsModule,
    MatCardModule,
    CarouselModule,
  ],
})
export class CalenderComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['fullName', 'employeeEmail', 'guest', 'startDate', 'endDate', 'waitlist', 'actions'];
  dataSource = new MatTableDataSource<Booking>();
  @ViewChild(MatSort) sort!: MatSort;

  isAdmin = true; // TODO: wire to your auth logic

  booking: Booking[] = [];
  private subscriptions: Subscription[] = [];
  isConnected = false;

  /** Optional: if needed elsewhere; derived from busyDateKeys */
  busyDates: Date[] = [];
  /** Source of truth for calendar highlighting */
  private busyDateKeys = new Set<string>();

  bookingForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    employeeEmail: new FormControl('', [Validators.required, Validators.email]),
    guest: new FormControl(),
    start: new FormControl<Date | null>(null, Validators.required),
    end: new FormControl<Date | null>(null, Validators.required),
    BookingStatus: new FormControl(BookingStatus.Submitted)
  });

  center: google.maps.LatLngLiteral = {
    lat: 50.11961573885982,
    lng: -119.5126670181798
  };

  markerOptions: google.maps.MarkerOptions = {
    animation: google.maps.Animation.DROP
  };

  googleMapsUrl = `https://www.google.com/maps?q=${this.center.lat},${this.center.lng}`;
  directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${this.center.lat},${this.center.lng}`;

  slides = [
    {
      image: 'assets/images/LaCasa1.jpg',
      thumbImage: 'assets/images/LaCasa1.jpg',
      alt: 'Main Villa View',
      title: 'Main Villa View',
      description: 'Main Villa View'
    },
    {
      image: 'assets/images/LaCasa2.jpg',
      thumbImage: 'assets/images/LaCasa2.jpg',
      alt: 'Living Room',
      title: 'Living Room',
      description: 'Living Room'
    }
  ];

  currentSlide = 0;

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
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketService.disconnect();
  }

  // ---------------- Realtime & Connection ----------------

  private setupRealtimeUpdates(): void {
    const bookingUpdatesSub = this.webSocketService.getBookingUpdates().subscribe({
      next: (event: BookingEvent) => this.handleRealtimeUpdate(event),
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
        this.showNotification(
          isConnected ? 'Real-time updates connected' : 'Real-time updates disconnected',
          isConnected ? 'success' : 'warning'
        );
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(connectionSub);
  }

  private handleRealtimeUpdate(event: BookingEvent): void {
    const currentData = this.dataSource.data;

    switch (event.type) {
      case 'CREATE':
        this.dataSource.data = [...currentData, event.booking];
        this.showNotification(`New booking created by ${event.booking.fullName}`, 'success');
        this.updateBusyDates();
        break;

      case 'UPDATE':
        const updateIndex = currentData.findIndex(b => b.id === event.booking.id);
        if (updateIndex !== -1) {
          currentData[updateIndex] = event.booking;
          this.dataSource.data = [...currentData];
          this.showNotification(`Booking updated by ${event.booking.fullName}`, 'info');
          this.updateBusyDates();
        }
        break;

      case 'DELETE':
        this.dataSource.data = currentData.filter(b => b.id !== event.booking.id);
        this.showNotification(`Booking canceled by ${event.booking.fullName}`, 'warning');
        this.updateBusyDates();
        break;
    }

    this.cdr.detectChanges();
  }

  // ---------------- Date Helpers (LOCAL, no UTC conversions) ----------------

  /** Parse an incoming value (string like '2025-09-27 00:00:00-07' or ISO or Date) as local **date-only** */
  private parseLocalDateOnly(input: string | Date): Date {
    if (input instanceof Date) {
      const d = new Date(input);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const m = String(input).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    }
    const d = new Date(input);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** Local 'YYYY-MM-DD' key (kept purely local to avoid TZ/DST drift) */
  private toKeyLocal(date: Date | string): string {
    const d = this.parseLocalDateOnly(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /** End-inclusive or end-exclusive LOCAL day enumeration (use endExclusive=false if the end day is occupied) */
  private enumerateKeysLocal(start: string | Date, end: string | Date, endExclusive = false): string[] {
    const s = this.parseLocalDateOnly(start);
    const e = this.parseLocalDateOnly(end);

    const keys: string[] = [];
    let cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());

    while (endExclusive ? cur.getTime() < e.getTime() : cur.getTime() <= e.getTime()) {
      keys.push(this.toKeyLocal(cur));
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    return keys;
  }

  /** Accepts either enum (number), enum name (string), or plain 'Canceled' string */
  private isCanceled(b: any): boolean {
    const s = b?.status ?? b?.BookingStatus;
    if (s == null) return false;

    if (typeof s === 'number') {
      return s === (BookingStatus as any).Canceled;
    }

    if (typeof s === 'string') {
      const lower = s.trim().toLowerCase();
      const enumCanceledName = (BookingStatus as any)[(BookingStatus as any).Canceled]
        ?.toString()
        .toLowerCase?.();
      return lower === 'canceled' || (enumCanceledName && lower === enumCanceledName);
    }

    return false;
  }

  // ---------------- Busy Dates Build & Calendar Hook ----------------

  private updateBusyDates(): void {
    const keys = new Set<string>();

    for (const booking of this.dataSource.data) {
      if (this.isCanceled(booking)) continue; // exclude canceled

      // If your end date is a CHECKOUT (not occupied), use endExclusive = true
      const dayKeys = this.enumerateKeysLocal(booking.startDate, booking.endDate, /*endExclusive*/ false);
      for (const k of dayKeys) keys.add(k);
    }

    this.busyDateKeys = keys;
    // Optional array for any other UI (not needed for dateClass)
    this.busyDates = [...keys].map(k => {
      const [y, m, d] = k.split('-').map(Number);
      return new Date(y, m - 1, d); // local Date at midnight
    });
  }

  dateClass = (date: Date): MatCalendarCellCssClasses => {
    return this.busyDateKeys.has(this.toKeyLocal(date)) ? 'busy-date' : '';
  };

  // ---------------- Notifications ----------------

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    const config = {
      duration: 3000,
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const,
      panelClass: [`snackbar-${type}`]
    };
    this.snackBar.open(message, 'Close', config);
  }

  // ---------------- Booking Create / Update ----------------

  book() {
    const startDate = this.bookingForm.get('start')?.value as Date | null;
    const endDate = this.bookingForm.get('end')?.value as Date | null;

    if (!startDate || !endDate) {
      this.showNotification('Start or end date is missing', 'error');
      return;
    }

    if (!this.bookingForm.valid) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Send **date-only** strings to avoid timezone rollovers (yyyy-MM-dd)
    const startStr = formatDate(startDate, 'yyyy-MM-dd', 'en-CA');
    const endStr = formatDate(endDate, 'yyyy-MM-dd', 'en-CA');

    const newBooking = new Booking(
      0,
      this.bookingForm.get('fullName')?.value ?? '',
      this.bookingForm.get('employeeEmail')?.value ?? '',
      this.bookingForm.get('guest')?.value ?? '',
      startStr,
      endStr,
      this.bookingForm.get('BookingStatus')?.value ?? BookingStatus.Submitted
    );

    this.bookingHistoryService.saveBooking(newBooking).subscribe({
      next: (response: BookingResponse) => {
        this.showNotification(response.message || 'Booking created successfully!', response.success ? 'success' : 'warning');
        if (response.success) {
          this.bookingForm.reset();
          this.getBookingHistory();
        }
      },
      error: (err) => {
        console.error('Failed to save booking:', err);
        const errorMessage = err.status === 400 ? err.error : err.error?.message || 'Failed to create booking';

        if (err.error === 'Requested dates overlap an existing booking.') {
          const dialogRef = this.dialog.open(WaitlistDialogComponent, { width: '400px' });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              const waitlistBooking = {
                ...newBooking,
                waitlist: true,
                BookingStatus: BookingStatus.Waitlisted
              };
              this.bookingHistoryService.saveBooking(waitlistBooking).subscribe({
                next: () => {
                  this.showNotification('Successfully added to waitlist', 'success');
                  this.bookingForm.reset();
                  this.getBookingHistory();
                },
                error: () => this.showNotification('Failed to add to waitlist', 'error')
              });
            } else {
              this.showNotification('Booking canceled', 'info');
            }
          });
        } else {
          this.showNotification(errorMessage, 'error');
        }
      },
    });
  }

  onEdit(booking: Booking) {
    console.log('Edit booking:', booking);
    this.showNotification('Edit functionality to be implemented', 'info');
  }

  onConfirm(booking: Booking) {
    const start = formatDate(booking.startDate, 'yyyy-MM-dd', 'en-CA');
    const end = formatDate(booking.endDate, 'yyyy-MM-dd', 'en-CA');

    if (confirm(`Are you sure you want to confirm the booking for ${booking.fullName} from ${start} to ${end}?`)) {
      this.bookingHistoryService.UpdateStatus(booking.id, BookingStatus.Confirmed).subscribe({
        next: () => {
          this.showNotification('Booking confirmed successfully!', 'success');
          this.getBookingHistory();
        },
        error: (err: any) => {
          console.error('Failed to confirm booking:', err);
          this.showNotification('Failed to confirm booking', 'error');
        }
      });
    }
  }

  onCancel(booking: Booking) {
    const start = formatDate(booking.startDate, 'yyyy-MM-dd', 'en-CA');
    const end = formatDate(booking.endDate, 'yyyy-MM-dd', 'en-CA');

    if (confirm(`Are you sure you want to cancel the booking for ${booking.fullName} from ${start} to ${end}?`)) {
      this.bookingHistoryService.UpdateStatus(booking.id, BookingStatus.Canceled).subscribe({
        next: () => {
          this.showNotification('Booking canceled successfully!', 'success');
          this.getBookingHistory();
        },
        error: (err: any) => {
          console.error('Failed to cancel booking:', err);
          this.showNotification('Failed to cancel booking', 'error');
        }
      });
    }
  }

  // ---------------- Table & Misc ----------------

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

  click(event: google.maps.MapMouseEvent) {
    console.log(event);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }
}
