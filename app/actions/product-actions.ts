"use server";

import db from "@/lib/db";

export async function getProductById(id: string) {
    if (!id) return null;

    try {
        const product = await db.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: { name: true, id: true }
                },
                fields: true
            }
        });

        return product;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}
