# ÖZAY Deri E-Ticaret Platformu

Modern, yüksek performanslı ve yönetilebilir bir e-ticaret (B2B/B2C) platformu. Next.js 15, React 19, Tailwind CSS v4 ve PostgreSQL kullanılarak geliştirilmiştir.

## 🚀 Teknolojiler

- **Framework:** Next.js 15 (App Router, Server Actions, Suspense Streaming)
- **UI & Stil:** React 19, Tailwind CSS v4, shadcn/ui, Lucide Icons
- **Veritabanı:** PostgreSQL, Prisma ORM
- **Performans & Arama:** PostgreSQL Trigram (`pg_trgm`) tabanlı bulanık arama, Suspense loaderları.
- **Linting:** Biome.js

## 🌟 Öne Çıkan Özellikler

- **Gelişmiş Kategori Yönetimi:** Sınırsız derinlikte alt kategori oluşturabilme.
- **Dinamik Ürün Alanları (EAV):** Kategori bazlı veya global ürün özellikleri tanımlayabilme (Renk, Beden, Kumaş).
- **Gelişmiş Arama Motoru:** Harici servislere (Algolia vs.) ihtiyaç duymadan çalışan, yazım hatalarını tolere eden (fuzzy search) yerleşik arama.
- **Performans Optimizasyonu:** `React.Suspense` kullanılarak veri çekimlerinde akıcı iskelet (skeleton) yükleme ekranları.
- **Kapsamlı Admin Paneli:** Slayt, site ayarları, kategoriler, ürünler ve log yönetimi.

## 🛠️ Kurulum

1. Depoyu klonlayın:
```bash
git clone <repo-url>
cd ozay-deri
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun ve veritabanı bağlantınızı ekleyin:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ozay_deri?schema=public"
```

4. Veritabanı şemasını uygulayın:
```bash
npx prisma db push
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## 📖 Dökümantasyon

Mimari kararlar ve sistem işleyişi hakkında daha fazla bilgi için `docs/` klasörüne göz atın:
- `docs/custom-fields.md`: Dinamik ürün özellikleri (EAV) ve kategori sistemi.
- `docs/search.md`: Bulanık arama motoru ve dinamik filtreleme sistemi.

## 🎨 Tasarım Prensipleri

Platform, son kullanıcıya (B2B müşterileri) premium bir his vermek üzere modern bir tasarıma sahiptir. Glassmorphism, yumuşak gölgeler, minimalist grid yapıları ve mikro-animasyonlar (hover efektleri) kullanılmıştır.
