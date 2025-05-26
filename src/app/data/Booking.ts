export class Booking {
    id: number;
    fullName: string;
    employeeEmail: string;
    guest: string;
    startDate: string; // ISO 8601 format
    endDate: string;

    constructor(id: number, fullName: string, employeeEmail: string, guest: string, startDate: string, endDate: string) {
        this.id = id;
        this.fullName = fullName;
        this.employeeEmail = employeeEmail;
        this.guest = guest;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

