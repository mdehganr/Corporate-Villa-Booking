export class Product {
    id: number;
    code: string;
    name: string;
    description: string;
    image: string;
    price: number;
    category: string;
    quantity: number;
    inventoryStatus: string;
    rating: number;

    constructor(
        id: number,
        code: string,
        name: string,
        description: string,
        image: string,
        price: number,
        category: string,
        quantity: number,
        inventoryStatus: string,
        rating: number
    ) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.image = image;
        this.price = price;
        this.category = category;
        this.quantity = quantity;
        this.inventoryStatus = inventoryStatus;
        this.rating = rating;
    }
}