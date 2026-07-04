# ÖZAY Deri Çift Katmanlı Arama Motoru (Dual-Layer Search Engine)

Bu dokümantasyon, e-ticaret sistemi için özel olarak geliştirilen, hiçbir dış servise (Algolia vb.) bağımlı olmayan yüksek performanslı arama motorunun mimarisini ve çalışma prensiplerini açıklar.

## 1. Genel Mimari ve Teknoloji Yığını

*   **Framework:** Next.js App Router (Server Components & Server Actions)
*   **Veritabanı ve ORM:** Prisma Postgres
*   **Bulanık Arama (Fuzzy Search):** PostgreSQL `pg_trgm` (Trigram) eklentisi
*   **Tasarım:** Tailwind CSS & shadcn/ui prensipleri

Arama motoru iki ana katmandan oluşur:
1.  **Canlı Arama (Live Search):** Header üzerinde çalışan, 400ms debounce ile anlık sonuç getiren Client Component.
2.  **Detaylı Arama (Detailed Search):** URL parametreleri ile çalışan, tam sayfa Server Component tabanlı gelişmiş arama ve filtreleme sayfası (`/search`).

---

## 2. Veritabanı Mimarisi (Esnek Alan Yönetimi)

Arama ve filtreleme sistemi, ürünlere özel statik sütunlar (JSONB veya kolonlar) eklemek yerine mevcut **EAV (Entity-Attribute-Value)** benzeri esnek `ProductField` mimarisi üzerine inşa edilmiştir.

### İlgili Modeller

*   **`FieldDefinition`**: Sisteme eklenecek alanları (Renk, Kumaş, Fiyat, Açıklama) tanımlar.
    *   `isFilterable`: `true` ise, detaylı arama sayfasında sol menüde kesin eşleşme (exact match) filtresi olarak listelenir.
    *   `isSearchable`: `true` ise, girilen arama terimi bu alanın verilerinde `pg_trgm` ile aranır (Bulanık Arama).
*   **`ProductField`**: `FieldDefinition` ile tanımlanan alanların, ürün bazındaki gerçek değerlerini (`stringValue`, `numberValue`) tutar.
*   **`SearchLog`**: Kullanıcıların arattığı ancak hiçbir sonucun bulunamadığı kelimeleri arka planda kaydeder.

---

## 3. Bulanık Arama (Fuzzy Search) Entegrasyonu

Standart `LIKE` veya `contains` sorguları, klavye kaymaları ("deri" yerine "drri" yazılması) gibi hataları tolere edemez. Bu nedenle PostgreSQL'in yerleşik **Trigram (`pg_trgm`)** eklentisi kullanılmıştır.

### Nasıl Çalışır?
*   Hem Server Action (Canlı arama) hem de Server Component (Detaylı arama) içinde `prisma.$queryRaw` kullanılarak saf (raw) SQL sorgusu atılır.
*   `similarity(text1, text2)` fonksiyonu kullanılarak aranan kelime ile veri tabanındaki kelime karşılaştırılır ve 0 ile 1 arasında bir eşleşme skoru (`simScore`) döndürülür.
*   Arama şu sütunlarda yapılır:
    *   `Product.name` (Ürün Adı)
    *   `Category.name` (Kategori Adı)
    *   `ProductField.stringValue` (Sadece `FieldDefinition.isSearchable = true` olan özel alanlar, örn: "Açıklama")
*   Sorgu sonuçları `simScore` (eşleşme oranına) göre büyükten küçüğe (`DESC`) sıralanır. Eşleşme skoru, geliştirici konsoluna detaylı olarak loglanır.

---

## 4. Dinamik Filtreleme (Exact Match)

Detaylı arama sayfasında (`/search`) yer alan sol Sidebar menüsü tamamen dinamiktir. 

*   Sayfa yüklendiğinde, `FieldDefinition` tablosundan `isFilterable = true` olan tüm alanlar çekilir.
*   Her alan için `ProductField` tablosundan benzersiz (distinct) değerler toplanarak filtre seçenekleri (örn: Siyah, Beyaz, Kırmızı) oluşturulur.
*   Kullanıcı bir filtreye tıkladığında, bu değer URL'e parametre olarak eklenir (`?q=canta&Renk=Siyah`).
*   Next.js Server Component URL parametrelerini yakalar ve raw SQL sorgusuna **kesin eşleşme** (EXISTS) koşulları olarak ekler.

```sql
-- Örnek Dinamik Filtre Koşulu
EXISTS (
  SELECT 1 FROM "ProductField" pf 
  WHERE pf."productId" = p.id 
    AND pf.name = 'Renk' 
    AND pf."stringValue" = 'Siyah'
)
```

---

## 5. Analytics: Boş Sonuç Takibi

Arama sonuçları 0 (sıfır) ise ve kullanıcı henüz 1. sayfadaysa (ve aktif bir URL filtresi yoksa), aranan kelime asenkron ve sessiz bir şekilde arka planda tetiklenerek `SearchLog` tablosuna kaydedilir. 

Bu sayede mağaza yönetimi, müşterilerin neyi arayıp bulamadığını analiz ederek yeni stok stratejileri geliştirebilir.

---

## 6. Yönetim (Admin Paneli)

Arama motorunu ve filtreleri yönetmek için `app/admin/fields` rotasında basit bir arayüz bulunur. Bu panel üzerinden;
*   Yeni ürün alanları eklenebilir,
*   Bir alanın Sidebar'da filtre olarak çıkıp çıkmayacağı (`isFilterable`) belirlenebilir,
*   Bir alanın yazım hatalarını tolere eden bulanık aramaya (`isSearchable`) dahil olup olmayacağı seçilebilir.
