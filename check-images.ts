import db from './lib/db';

async function checkUrl(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        return res.ok;
    } catch (e) {
        return false;
    }
}

async function main() {
    console.log("Bozuk resim linkleri taranıyor... Lütfen bekleyin.\n");
    let brokenCount = 0;

    // 1. Kategorileri Kontrol Et
    const categories = await db.category.findMany();

    for (const cat of categories) {
        if (cat.images && cat.images.length > 0) {
            for (const img of cat.images) {
                const ok = await checkUrl(img);
                if (!ok) {
                    console.log(`❌ [KATEGORİ] "${cat.name}" (ID: ${cat.id})`);
                    console.log(`   Link: ${img}\n`);
                    brokenCount++;
                }
            }
        }
    }

    // 2. Ürünleri Kontrol Et
    const products = await db.product.findMany();

    for (const prod of products) {
        if (prod.images && prod.images.length > 0) {
            for (const img of prod.images) {
                const ok = await checkUrl(img);
                if (!ok) {
                    console.log(`❌ [ÜRÜN] "${prod.name}" (ID: ${prod.id})`);
                    console.log(`   Link: ${img}\n`);
                    brokenCount++;
                }
            }
        }
    }

    console.log("----------------------------------------");
    if (brokenCount === 0) {
        console.log("✅ Harika! Veritabanındaki tüm resim linkleri sağlam ve çalışıyor.");
    } else {
        console.log(`⚠️ Toplam ${brokenCount} adet bozuk/silinmiş resim linki bulundu.`);
        console.log("Admin panelinden bu ürün/kategorileri bulup resimlerini güncelleyebilirsiniz.");
    }
}

main()
    .catch((e) => {
        console.error("Beklenmeyen bir hata oluştu:", e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
