import db from "./lib/db";

const LEATHER_ADJECTIVES = ["Premium", "Hakiki", "Lüks", "Klasik", "Vintage", "El Yapımı", "İtalyan", "Mat", "Parlak", "Suni"];
const PRODUCT_TYPES = ["Deri Ceket", "Deri Çanta", "Deri Cüzdan", "Deri Kemer", "Deri Eldiven", "Deri Çizme", "Deri Ayakkabı", "Deri Evrak Çantası", "Deri Kartlık"];
const COLORS = ["Siyah", "Kahverengi", "Taba", "Lacivert", "Bordo", "Haki", "Taba", "Kırmızı", "Bej"];
const BRANDS = ["Özay", "Derimod", "Desa", "Koton", "Zara", "Mango", "Kemal Tanca", "Beymen"];

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateProductName() {
    return `${randomElement(LEATHER_ADJECTIVES)} ${randomElement(COLORS)} ${randomElement(PRODUCT_TYPES)}`;
}

async function seed() {
    console.log("Seeding started...");

    // 1. Fetch categories
    const categories = await db.category.findMany({ select: { id: true, name: true, parentId: true } });
    if (categories.length === 0) {
        console.error("No categories found. Please create categories first.");
        process.exit(1);
    }
    
    // Favor leaf categories (subcategories)
    const subCategories = categories.filter(c => c.parentId !== null);
    const targetCategories = subCategories.length > 0 ? subCategories : categories;

    const BATCH_SIZE = 100;
    
    for (let i = 0; i < BATCH_SIZE; i++) {
        const name = generateProductName();
        const price = Math.floor(Math.random() * 5000) + 500; // 500 to 5500
        const category = randomElement(targetCategories);
        const color = randomElement(COLORS);
        const brand = randomElement(BRANDS);
        const isHidden = Math.random() > 0.9; // 10% hidden
        
        // Random image from Unsplash related to leather
        const imageId = Math.floor(Math.random() * 1000);
        const thumbnailUrl = `https://picsum.photos/seed/leather${imageId}/600/800`;
        const galleryImage = `https://picsum.photos/seed/gallery${imageId}/800/1000`;

        await db.product.create({
            data: {
                name,
                price,
                categoryId: category.id,
                isHidden,
                images: [thumbnailUrl, galleryImage],
                fields: {
                    create: [
                        { name: "Thumbnail", type: "STRING", stringValue: thumbnailUrl },
                        { name: "Renk", type: "STRING", stringValue: color },
                        { name: "Marka", type: "STRING", stringValue: brand },
                        { name: "Materyal", type: "STRING", stringValue: "100% Hakiki Deri" }
                    ]
                }
            }
        });
        
        if ((i + 1) % 10 === 0) {
            console.log(`Created ${i + 1} products...`);
        }
    }

    console.log("Seeding finished successfully!");
}

seed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
