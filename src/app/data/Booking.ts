export class Booking {
    constructor(
        public id: number,
        public fullName: string,
        public employeeEmail: string,
        public guest: string,
        public startDate: string,
        public endDate: string,
        public waitlist: boolean = false
    ) { }
}

