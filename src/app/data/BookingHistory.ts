export class BookingHistory {
    id: number;
    title?: string;
    from: Date;
    to: Date;
    guests: Guest[];

    constructor(id: number, from: Date, to: Date, guests: Guest[], title?: string) {
        this.id = id;
        this.title = title;
        this.from = from;
        this.to = to;
        this.guests = guests;
    }
}

export class Guest {
    fullName: string;
    age: number;

    constructor(fullName: string, age: number) {
        this.fullName = fullName;
        this.age = age;
    }
}