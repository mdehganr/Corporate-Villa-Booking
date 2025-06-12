import { Booking } from "./Booking";

export interface BookingResponse {
    booking: Booking;
    message: string;
    success: boolean;
}