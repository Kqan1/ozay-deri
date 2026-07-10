"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import db from "@/lib/db";

const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export type ActionState = {
  success: boolean;
  message?: string;
  error?: string;
} | null;

export async function registerUser(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rawUsername = formData.get("username") as string;
    const rawPassword = formData.get("password") as string;

    const validated = registerSchema.safeParse({
      username: rawUsername,
      password: rawPassword,
    });

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0].message,
      };
    }

    const { username, password } = validated.data;

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Bu kullanıcı adı zaten kullanımda.",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    await db.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "USER", // Default role is USER
      },
    });

    return {
      success: true,
      message: "Kayıt başarıyla tamamlandı. Giriş yapabilirsiniz.",
    };
  } catch (error: any) {
    console.error("Kayıt hatası:", error);
    return {
      success: false,
      error: "Kayıt sırasında bir hata oluştu.",
    };
  }
}
