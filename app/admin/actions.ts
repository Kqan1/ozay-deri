"use server";

import { revalidatePath } from "next/cache";
import type { FieldType } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-utils";

import prisma from "@/lib/db";

export async function createCategory(data: {
  name: string;
  parentId?: string | null;
  isHidden?: boolean;
}) {
  await requireAdmin();
  const category = await prisma.category.create({
    data: {
      name: data.name,
      parentId: data.parentId || null,
      isHidden: data.isHidden || false,
    },
  });
  revalidatePath("/");
  return category;
}

export async function updateCategory(
  id: string,
  data: { name: string; parentId?: string | null; isHidden?: boolean },
) {
  await requireAdmin();
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      parentId: data.parentId || null,
      isHidden: data.isHidden,
    },
  });
  revalidatePath("/");
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
  // Kategori silindiğinde ürünler onDelete: SetNull sayesinde boşa (null) düşer veya cascade ile silinir (zaten sildik).
  const category = await prisma.category.delete({
    where: { id },
  });
  revalidatePath("/");
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
  price?: number | null;
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
      price: data.price ?? null,
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
  return product;
}

export async function updateProduct(id: string, data: CreateProductInput) {
  await requireAdmin();

  const oldProduct = await prisma.product.findUnique({ where: { id } });
  if (oldProduct) {
    const removedImages = oldProduct.images.filter(
      (img) => !data.images.includes(img),
    );
    const keys = removedImages
      .map((url) => url.split("/f/")[1])
      .filter(Boolean);
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
      price: data.price ?? null,
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
  return product;
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  const oldProduct = await prisma.product.findUnique({ where: { id } });
  if (oldProduct?.images?.length) {
    const keys = oldProduct.images
      .map((url) => url.split("/f/")[1])
      .filter(Boolean);
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
