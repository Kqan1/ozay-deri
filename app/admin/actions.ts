"use server";

import { revalidatePath } from "next/cache";
// We need prisma. Let's check where it's located.
import { FieldType } from "@/app/generated/prisma/client";

import prisma from "@/lib/db";

export async function createCategory(data: { name: string }) {
  const category = await prisma.category.create({
    data: {
      name: data.name,
    },
  });
  
  // Revalidate if needed, although app/admin will just be revalidated manually or via router.refresh()
  return category;
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export type CreateProductInput = {
  name: string;
  categoryId: string;
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
      fields: {
        create: data.fields.map((f) => ({
          name: f.name,
          type: f.type,
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
