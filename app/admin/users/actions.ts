"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-utils";
import db from "@/lib/db";

export async function getAdmins() {
    await requireAdmin();
    return db.user.findMany({
        where: { role: "ADMIN" },
        select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createAdmin(formData: FormData) {
    await requireAdmin();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) return { error: "Kullanıcı adı ve şifre zorunludur." };

    try {
        const existing = await db.user.findUnique({ where: { username } });
        if (existing) return { error: "Bu kullanıcı adı zaten kullanılıyor." };

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.create({
            data: {
                username,
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        revalidatePath("/admin/admins");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteAdmin(id: string, _currentUserId: string) {
    await requireAdmin();
    try {
        await db.user.delete({ where: { id } });
        revalidatePath("/admin/admins");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateProfile(formData: FormData) {
    await requireAdmin();
    const id = formData.get("id") as string;
    const username = formData.get("username") as string;

    if (!id || !username) return { error: "ID ve Kullanıcı Adı zorunludur." };

    try {
        const existing = await db.user.findUnique({ where: { username } });
        if (existing && existing.id !== id)
            return {
                error: "Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.",
            };

        await db.user.update({
            where: { id },
            data: { username },
        });

        revalidatePath("/admin/profile");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updatePassword(formData: FormData) {
    await requireAdmin();
    const id = formData.get("id") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!id || !currentPassword || !newPassword) return { error: "Tüm alanlar zorunludur." };

    try {
        const user = await db.user.findUnique({ where: { id } });
        if (!user) return { error: "Kullanıcı bulunamadı." };

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return { error: "Mevcut şifre yanlış." };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
