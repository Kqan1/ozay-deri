import db from './lib/db';

async function checkUrl(url: string): Promise<boolean> {
    try {
        // Geçersiz veya relative URL'lerin (örn: /images/test.png) scripti çökertmesini önleyelim
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            console.log(`⚠️  Geçersiz veya lokal URL atlandı: ${url}`);
            return false;
        }

        // İsteklere 5 saniye zaman aşımı (Timeout) ekliyoruz. 
        // Aksi takdirde sunucu yanıt vermezse script prod ortamında sonsuza kadar takılı kalabilir.
        const res = await fetch(url, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
        });
        return res.ok;
    } catch (e) {
        return false;
    }
}

async function main() {
    console.log("Bozuk resim linkleri taranıyor... Lütfen bekleyin.\n");
    let brokenCount = 0;

    // 1. Kategorileri Kontrol Et
    // Tüm kayıtları belleğe alıp prod ortamında RAM'i şişirmemek için sadece gereken alanları çekiyoruz
    const categories = await db.category.findMany({
        select: { id: true, name: true, images: true }
    });

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
    const products = await db.product.findMany({
        select: { id: true, name: true, images: true }
    });

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

    // 3. Slayt (Carousel) Resimlerini Kontrol Et
    const slides = await db.carouselSlide.findMany({
        select: { id: true, title: true, image: true }
    });

    for (const slide of slides) {
        if (slide.image) {
            const ok = await checkUrl(slide.image);
            if (!ok) {
                console.log(`❌ [SLAYT] "${slide.title}" (ID: ${slide.id})`);
                console.log(`   Link: ${slide.image}\n`);
                brokenCount++;
            }
        }
    }

    console.log("----------------------------------------");
    if (brokenCount === 0) {
        console.log("✅ Harika! Veritabanındaki tüm resim linkleri sağlam ve çalışıyor.");
    } else {
        console.log(`⚠️ Toplam ${brokenCount} adet bozuk/silinmiş resim linki bulundu.`);
        console.log("Admin panelinden bu kayıtları bulup resimlerini güncelleyebilirsiniz.");
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
