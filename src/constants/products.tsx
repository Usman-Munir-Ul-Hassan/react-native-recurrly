export interface Product {
    id: string;
    name: string;
    price: string;
    icon: string;
    desc: string;
}

export const PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Wireless Headphones",
        price: "$299.00",
        icon: "🎧",
        desc: "Active noise cancellation with 30-hour battery life.",
    },
    {
        id: "2",
        name: "Smart Watch",
        price: "$199.00",
        icon: "⌚",
        desc: "Heart-rate monitoring, AMOLED display, and GPS tracking.",
    },
    {
        id: "3",
        name: "Mechanical Keyboard",
        price: "$149.00",
        icon: "⌨️",
        desc: "RGB hot-swappable switches with tactile feedback.",
    },
];

export function getProductById(id: string): Product | undefined {
    return PRODUCTS.find((p) => p.id === id);
}
