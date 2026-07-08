"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createFieldDefinition(formData: FormData) {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const type = formData.get("type") as "STRING" | "NUMBER_UNIT";
  const isGlobal = formData.get("isGlobal") === "true";
  const categoryId = formData.get("categoryId") as string | null;
  const isFilterable = formData.get("isFilterable") === "on";
  const isSortable = formData.get("isSortable") === "on";
  const isSearchable = formData.get("isSearchable") === "on";

  if (!name || !type) return { error: "Name and type are required" };

  try {
    const data = {
      name,
      type,
      isGlobal,
      categoryId: isGlobal ? null : (categoryId || null),
      isFilterable,
      isSortable,
      isSearchable
    };

    if (id) {
      await db.fieldDefinition.update({
        where: { id },
        data
      });
    } else {
      await db.fieldDefinition.create({ data });
    }
    
    revalidatePath("/admin/fields");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteFieldDefinition(id: string) {
  try {
    await db.fieldDefinition.delete({ where: { id } });
    revalidatePath("/admin/fields");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
