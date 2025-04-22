export class BookingHistory {
    id: number;
    title?: string;
    from: Date;
    to: Date;
    guests: Guest[];
    waitLists: WaitList[];

    constructor(id: number, from: Date, to: Date, guests: Guest[], waitLists: WaitList[], title?: string) {
        this.id = id;
        this.title = title;
        this.from = from;
        this.to = to;
        this.guests = guests;
        this.waitLists = waitLists;
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

export class WaitList {
    id: number;
    guestName: string;

    constructor(id: number, guestName: string) {
        this.id = id;
        this.guestName = guestName;
    }
}