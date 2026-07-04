"use server";

import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır.").optional().or(z.literal("")),
    email: z.string().email("Geçersiz e-posta adresi."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır.")
});

export type ActionState = {
    success: boolean;
    message?: string;
    error?: string;
} | null;

export async function registerUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
    try {
        const rawName = formData.get("name") as string;
        const rawEmail = formData.get("email") as string;
        const rawPassword = formData.get("password") as string;

        const validated = registerSchema.safeParse({
            name: rawName,
            email: rawEmail,
            password: rawPassword
        });

        if (!validated.success) {
            return {
                success: false,
                error: validated.error.errors[0].message
            };
        }

        const { name, email, password } = validated.data;

        // Check if email already exists
        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return {
                success: false,
                error: "Bu e-posta adresi zaten kullanımda."
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in the database
        await db.user.create({
            data: {
                name: name || null,
                email,
                password: hashedPassword,
                role: "USER" // Default role is USER
            }
        });

        return {
            success: true,
            message: "Kayıt başarıyla tamamlandı. Giriş yapabilirsiniz."
        };
    } catch (error: any) {
        console.error("Kayıt hatası:", error);
        return {
            success: false,
            error: "Kayıt sırasında bir hata oluştu."
        };
    }
}
