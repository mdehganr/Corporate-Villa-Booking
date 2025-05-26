export class Booking {
    id: number;
    employeeEmail: string;
    startDate: string; // ISO 8601 format
    endDate: string;
    fullName: string;
    guest: string;

    constructor(id: number, fullName: string, employeeEmail: string, guest: string, startDate: string, endDate: string) {
        this.id = id;
        this.fullName = fullName;
        this.guest = guest;
        this.employeeEmail = employeeEmail;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

