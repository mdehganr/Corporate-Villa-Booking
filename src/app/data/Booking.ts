export class Booking {
    id: number;
    employeeEmail: string;
    startDate: string; // ISO 8601 format
    endDate: string;

    constructor(id: number, employeeEmail: string, startDate: string, endDate: string) {
        this.id = id;
        this.employeeEmail = employeeEmail;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

