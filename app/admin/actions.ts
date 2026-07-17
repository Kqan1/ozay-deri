"use server";

import { revalidatePath, updateTag } from "next/cache";
import type { FieldType } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-utils";

import prisma from "@/lib/db";

export async function createCategory(data: {
    name: string;
    parentId?: string | null;
    isHidden?: boolean;
    images?: string[];
}) {
    await requireAdmin();
    const category = await prisma.category.create({
        data: {
            name: data.name,
            parentId: data.parentId || null,
            isHidden: data.isHidden || false,
            images: data.images || [],
        },
    });
    revalidatePath("/");
    updateTag("categories");
    return category;
}

export async function updateCategory(
    id: string,
    data: { name: string; parentId?: string | null; isHidden?: boolean; images?: string[] },
) {
    await requireAdmin();

    const oldCategory = await prisma.category.findUnique({ where: { id } });
    if (oldCategory && data.images) {
        const removedImages = oldCategory.images.filter((img) => !data.images?.includes(img));
        const keys = removedImages.map((url) => url.split("/f/")[1]).filter(Boolean);
        if (keys.length > 0) {
            const { UTApi } = await import("uploadthing/server");
            const utapi = new UTApi();
            await utapi.deleteFiles(keys);
        }
    }

    const category = await prisma.category.update({
        where: { id },
        data: {
            name: data.name,
            parentId: data.parentId || null,
            isHidden: data.isHidden,
            ...(data.images ? { images: data.images } : {}),
        },
    });
    revalidatePath("/");
    updateTag("categories");
    return category;
}

export async function deleteCategory(id: string, deleteProducts: boolean) {
    await requireAdmin();
    if (deleteProducts) {
        const productsToDelete = await prisma.product.findMany({
            where: { categoryId: id },
        });
        const keys = productsToDelete
            .flatMap((p) => p.images)
            .map((url) => url.split("/f/")[1])
            .filter(Boolean);
        if (keys.length > 0) {
            const { UTApi } = await import("uploadthing/server");
            const utapi = new UTApi();
            await utapi.deleteFiles(keys);
        }
        await prisma.product.deleteMany({
            where: { categoryId: id },
        });
    }

    const oldCategory = await prisma.category.findUnique({ where: { id } });
    if (oldCategory && oldCategory.images.length > 0) {
        const keys = oldCategory.images.map((url) => url.split("/f/")[1]).filter(Boolean);
        if (keys.length > 0) {
            const { UTApi } = await import("uploadthing/server");
            const utapi = new UTApi();
            await utapi.deleteFiles(keys);
        }
    }

    // Kategori silindiğinde ürünler onDelete: SetNull sayesinde boşa (null) düşer veya cascade ile silinir (zaten sildik).
    const category = await prisma.category.delete({
        where: { id },
    });
    revalidatePath("/");
    updateTag("categories");
    if (deleteProducts) {
        updateTag("products");
    }
    return category;
}

export async function getCategories() {
    await requireAdmin();
    return prisma.category.findMany({
        include: {
            parent: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

export type CreateProductInput = {
    name: string;
    categoryId: string | null;
    isHidden?: boolean;
    images: string[];
    fields: {
        name: string;
        type: "STRING" | "NUMBER_UNIT";
        stringValue?: string | null;
        numberValue?: number | null;
        unit?: string | null;
    }[];
};

export async function createProduct(data: CreateProductInput) {
    await requireAdmin();
    const product = await prisma.product.create({
        data: {
            name: data.name,
            categoryId: data.categoryId,
            isHidden: data.isHidden || false,
            images: data.images,
            fields: {
                create: data.fields.map((f) => ({
                    name: f.name,
                    type: f.type as FieldType,
                    stringValue: f.stringValue ?? null,
                    numberValue: f.numberValue ?? null,
                    unit: f.unit ?? null,
                })),
            },
        },
        include: {
            fields: true,
            category: true,
        },
    });
    revalidatePath("/");
    updateTag("products");
    return product;
}

export async function updateProduct(id: string, data: CreateProductInput) {
    await requireAdmin();

    const oldProduct = await prisma.product.findUnique({ where: { id } });
    if (oldProduct) {
        const removedImages = oldProduct.images.filter((img) => !data.images.includes(img));
        const keys = removedImages.map((url) => url.split("/f/")[1]).filter(Boolean);
        if (keys.length > 0) {
            const { UTApi } = await import("uploadthing/server");
            const utapi = new UTApi();
            await utapi.deleteFiles(keys);
        }
    }

    // Önce eski özellikleri sil, sonra yenilerini ekle (Prisma'da ilişkisel array'i tamamen güncellemenin en kolay yolu)
    await prisma.productField.deleteMany({
        where: { productId: id },
    });

    const product = await prisma.product.update({
        where: { id },
        data: {
            name: data.name,
            categoryId: data.categoryId,
            isHidden: data.isHidden,
            images: data.images,
            fields: {
                create: data.fields.map((f) => ({
                    name: f.name,
                    type: f.type as FieldType,
                    stringValue: f.stringValue ?? null,
                    numberValue: f.numberValue ?? null,
                    unit: f.unit ?? null,
                })),
            },
        },
        include: {
            fields: true,
            category: true,
        },
    });
    revalidatePath("/");
    updateTag("products");
    return product;
}

export async function deleteProduct(id: string) {
    await requireAdmin();

    const oldProduct = await prisma.product.findUnique({ where: { id } });
    if (oldProduct?.images?.length) {
        const keys = oldProduct.images.map((url) => url.split("/f/")[1]).filter(Boolean);
        if (keys.length > 0) {
            const { UTApi } = await import("uploadthing/server");
            const utapi = new UTApi();
            await utapi.deleteFiles(keys);
        }
    }

    const product = await prisma.product.delete({
        where: { id },
    });
    revalidatePath("/");
    updateTag("products");
    return product;
}

export async function getProducts() {
    await requireAdmin();
    return prisma.product.findMany({
        include: {
            category: true,
            fields: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getFieldDefinitions() {
    await requireAdmin();
    return prisma.fieldDefinition.findMany({
        include: { category: true },
        orderBy: { createdAt: "asc" },
    });
}

export async function deleteUploadThingImage(url: string) {
    await requireAdmin();
    const key = url.split("/f/")[1];
    if (key) {
        const { UTApi } = await import("uploadthing/server");
        const utapi = new UTApi();
        await utapi.deleteFiles(key);
    }
}

export async function getAdminStats() {
    await requireAdmin();
    const productsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const fieldsCount = await prisma.fieldDefinition.count();

    return {
        productsCount,
        categoriesCount,
        fieldsCount,
    };
}

// --- Carousel Actions ---

export type CreateCarouselSlideInput = {
    image: string;
    title: string;
    titleColor?: string | null;
    titleSize?: string | null;
    titleWeight?: string | null;
    description?: string | null;
    descColor?: string | null;
    descSize?: string | null;
    descWeight?: string | null;
    buttons?: any; // JSON array of buttons
    isActive?: boolean;
    order?: number;
};

export async function createCarouselSlide(data: CreateCarouselSlideInput) {
    await requireAdmin();
    const count = await prisma.carouselSlide.count();
    const slide = await prisma.carouselSlide.create({
        data: {
            ...data,
            order: data.order ?? count,
        },
    });
    revalidatePath("/");
    updateTag("carousel");
    return slide;
}

export async function updateCarouselSlide(id: string, data: CreateCarouselSlideInput) {
    await requireAdmin();
    const oldSlide = await prisma.carouselSlide.findUnique({ where: { id } });
    if (oldSlide && oldSlide.image !== data.image) {
        const key = oldSlide.image.split("/f/")[1];
        if (key) {
            const { UTApi } = await import("uploadthing/server");
            const utapi = new UTApi();
            await utapi.deleteFiles(key);
        }
    }
    const slide = await prisma.carouselSlide.update({
        where: { id },
        data,
    });
    revalidatePath("/");
    updateTag("carousel");
    return slide;
}

export async function deleteCarouselSlide(id: string) {
    await requireAdmin();
    const oldSlide = await prisma.carouselSlide.findUnique({ where: { id } });
    if (oldSlide?.image) {
        const key = oldSlide.image.split("/f/")[1];
        if (key) {
            const { UTApi } = await import("uploadthing/server");
            const utapi = new UTApi();
            await utapi.deleteFiles(key);
        }
    }
    const slide = await prisma.carouselSlide.delete({
        where: { id },
    });
    revalidatePath("/");
    updateTag("carousel");
    return slide;
}

export async function getCarouselSlides() {
    await requireAdmin();
    return prisma.carouselSlide.findMany({
        orderBy: { order: "asc" },
    });
}

export async function updateCarouselSlideOrder(updates: { id: string; order: number }[]) {
    await requireAdmin();
    for (const update of updates) {
        await prisma.carouselSlide.update({
            where: { id: update.id },
            data: { order: update.order },
        });
    }
    revalidatePath("/");
    updateTag("carousel");
    return true;
}

export async function cleanOrphanedFiles(forceAll = false) {
    await requireAdmin();

    const { UTApi } = await import("uploadthing/server");
    const utapi = new UTApi();

    let allFiles: any[] = [];
    let hasMore = true;
    let offset = 0;
    
    // UploadThing'den tüm dosyaları çek
    while (hasMore) {
        const result = await utapi.listFiles({ limit: 500, offset });
        if (result.files && result.files.length > 0) {
            allFiles = allFiles.concat(result.files);
            offset += result.files.length;
        } else {
            break;
        }
        hasMore = result.hasMore;
    }

    // Veritabanındaki tüm kullanım yerlerini topla
    const categories = await prisma.category.findMany({ select: { images: true } });
    const products = await prisma.product.findMany({ select: { images: true } });
    const carousel = await prisma.carouselSlide.findMany({ select: { image: true } });
    const productFields = await prisma.productField.findMany({
        where: { name: "Thumbnail", stringValue: { not: null } },
        select: { stringValue: true },
    });

    const usedKeys = new Set<string>();

    const extractKey = (url: string | null | undefined) => {
        if (!url) return;
        const parts = url.split("/f/");
        if (parts.length > 1 && parts[1]) {
            usedKeys.add(parts[1]);
        }
    };

    categories.forEach((c) => c.images.forEach(extractKey));
    products.forEach((p) => p.images.forEach(extractKey));
    carousel.forEach((c) => extractKey(c.image));
    productFields.forEach((pf) => extractKey(pf.stringValue));

    const now = Date.now();
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const keysToDelete: string[] = [];

    for (const file of allFiles) {
        if (!usedKeys.has(file.key)) {
            // Eğer forceAll true ise süreye bakma (test amaçlı). Değilse sadece 2 saatten eskileri sil.
            if (forceAll || now - file.uploadedAt > TWO_HOURS_MS) {
                keysToDelete.push(file.key);
            }
        }
    }

    let deletedCount = 0;
    if (keysToDelete.length > 0) {
        await utapi.deleteFiles(keysToDelete);
        deletedCount = keysToDelete.length;
    }

    return {
        success: true,
        scanned: allFiles.length,
        deleted: deletedCount,
        used: usedKeys.size,
    };
}
