// websocket.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Booking } from '../data/Booking';

export interface BookingEvent {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    booking: Booking;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private socket: WebSocket | null = null;
    private bookingUpdates$ = new Subject<BookingEvent>();
    private connectionStatus$ = new BehaviorSubject<boolean>(false);
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 3000; // 3 seconds

    constructor() {
        this.connect();
    }

    private connect(): void {
        try {
            // Replace with your WebSocket server URL
            this.socket = new WebSocket('ws://localhost:5114/ws');

            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.connectionStatus$.next(true);
                this.reconnectAttempts = 0;
            };

            this.socket.onmessage = (event) => {
                try {
                    const bookingEvent: BookingEvent = JSON.parse(event.data);
                    this.bookingUpdates$.next(bookingEvent);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.connectionStatus$.next(false);
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.connectionStatus$.next(false);
            };

        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            this.attemptReconnect();
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    // Observable to subscribe to booking updates
    getBookingUpdates(): Observable<BookingEvent> {
        return this.bookingUpdates$.asObservable();
    }

    // Observable to check connection status
    getConnectionStatus(): Observable<boolean> {
        return this.connectionStatus$.asObservable();
    }

    // Send booking update to server (if needed)
    sendBookingUpdate(event: BookingEvent): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(event));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    // Clean up connection
    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.bookingUpdates$.complete();
        this.connectionStatus$.complete();
    }
}