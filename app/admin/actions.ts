"use server";

import { revalidatePath } from "next/cache";
import { FieldType } from "@/app/generated/prisma/client";

import prisma from "@/lib/db";

export async function createCategory(data: { name: string; parentId?: string | null; isHidden?: boolean }) {
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

export async function updateCategory(id: string, data: { name: string; parentId?: string | null; isHidden?: boolean }) {
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
  if (deleteProducts) {
    // Kategoriye ait ürünleri sil
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
  fields: {
    name: string;
    type: "STRING" | "NUMBER_UNIT" | "PHOTO";
    stringValue?: string | null;
    numberValue?: number | null;
    unit?: string | null;
  }[];
};

export async function createProduct(data: CreateProductInput) {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      categoryId: data.categoryId,
      isHidden: data.isHidden || false,
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
  const product = await prisma.product.delete({
    where: { id },
  });
  revalidatePath("/");
  return product;
}

export async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      fields: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
