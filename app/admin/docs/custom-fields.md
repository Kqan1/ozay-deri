# Custom Fields ve Category Yönetimi Dökümantasyonu

Bu döküman, admin paneline eklenen "Kategori" ve "Dinamik Özellikli Ürün" sisteminin nasıl çalıştığını açıklamaktadır. Sistemi manuel olarak düzenlerken bu bilgiler işinize yarayacaktır.

## 1. Veritabanı Yapısı (Prisma)

Şemamızda 3 temel model bulunmaktadır:

- `Category`: Ürünlerin gruplandığı kategorileri tutar.
- `Product`: Ürünlerin ana bilgilerini (ad ve kategori ilişkisi) tutar.
- `ProductField`: Her ürüne ait özel alanları tutar. (EAV - Entity Attribute Value modeli kullanılmıştır.)

**Neden `ProductField` Modeli Kullanıldı?**
Bir kategorideki ürünlerin tamamen bağımsız özelliklere sahip olabilmesi için JSON kullanmak yerine ilişkisel bir model tercih ettik. Böylece sorgulama yapmak ve veri tiplerini korumak çok daha kolay.

**Veri Tipleri (`FieldType` Enum):**
- `STRING`: Basit metinler için. (`stringValue` sütununa kaydedilir)
- `NUMBER_UNIT`: Ağırlık, uzunluk gibi birimli sayılar için. (`numberValue` ve `unit` sütunlarına kaydedilir)
- `PHOTO`: Resim URL'leri için. UploadThing üzerinden yüklenen resmin URL'si `stringValue` sütununa kaydedilir.

## 2. Server Actions (`app/admin/actions.ts`)

UI bileşenleri doğrudan veritabanına erişemeyeceği için Server Actions kullanılmıştır.

- `createCategory({ name })`: Yeni bir kategori oluşturur.
- `getCategories()`: Tüm kategorileri getirir.
- `createProduct({ name, categoryId, fields })`: Bir ürünü ve ona ait tüm dinamik `ProductField` verilerini aynı anda oluşturur. Prisma'nın iç içe yazma (nested write) özelliği (`fields: { create: [...] }`) kullanılmıştır.
- `getProducts()`: Tüm ürünleri, kategorileri ve özel alanlarıyla (fields) birlikte getirir.

## 3. UI Bileşenleri (`app/admin/page.tsx`)

Arayüz oldukça basit tutulmuştur. Eğer tasarımı değiştirmek isterseniz `app/admin/page.tsx` dosyasındaki Tailwind sınıflarını (class) düzenleyebilirsiniz.

### Ürün Ekleme Mantığı:
1. State içinde `fields` isimli bir dizi tutulur.
2. Kullanıcı "Metin Ekle", "Fotoğraf Ekle" gibi butonlara bastığında `fields` dizisine varsayılan değerlerle yeni bir obje eklenir (`addField` fonksiyonu).
3. İnputlara girilen değerler `updateField` fonksiyonu ile `fields` dizisinde güncellenir.
4. "Ürünü Kaydet" butonuna basıldığında tüm bilgiler `createProduct` action'ına gönderilir.

## 4. UploadThing (Fotoğraf Yükleme)

Resim yükleme işlemleri için UploadThing entegre edilmiştir.
- **Sunucu Ayarları:** `app/api/uploadthing/core.ts` dosyasında `productImage` isimli bir endpoint tanımlanmıştır. (Max 4MB, 1 Dosya kısıtlaması mevcuttur).
- **Client Bileşeni:** `utils/uploadthing.ts` içindeki `UploadButton` kullanılmıştır.
- **Kullanımı:** `app/admin/page.tsx` içinde türü `PHOTO` olan alanlar için bu buton gösterilir. Yükleme tamamlandığında dönen URL `updateField` ile kaydedilir.

> [!TIP]
> Eğer UploadThing'in çalışması için gerekli olan `UPLOADTHING_SECRET` ve `UPLOADTHING_APP_ID` çevre değişkenlerini (environment variables) `.env` dosyanıza eklemediyseniz, fotoğraf yükleme işlemi hata verecektir. (UploadThing dashboard'undan alınabilir.)
