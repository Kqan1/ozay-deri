import db from './lib/db';
import bcrypt from 'bcryptjs';

async function main() {
    console.log("Admin kullanıcısı oluşturuluyor...");
    
    // Argümanlardan al, yoksa varsayılanları kullan
    const username = process.argv[2] || "admin";
    const password = process.argv[3] || "admin123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.upsert({
        where: { username },
        update: {
            password: hashedPassword,
            role: "ADMIN",
        },
        create: {
            username,
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    console.log(`✅ Admin hesabı başarıyla oluşturuldu/güncellendi!`);
    console.log(`👤 Kullanıcı Adı: ${user.username}`);
    console.log(`🔑 Şifre: ${password}`);
}

main()
    .catch((e) => {
        console.error("Hata oluştu:", e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
