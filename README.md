# Kucuk Isletme ERP Sistemi

Next.js App Router, TypeScript, Tailwind CSS, Prisma ve PostgreSQL ile hazirlanmis kucuk-orta olcekli ERP temeli.

## Kurulum

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Seed komutunu calistirmadan once `.env` icindeki degerleri degistirin:

- `NEXTAUTH_SECRET`: guclu ve benzersiz bir secret olmalidir.
- `SEED_ADMIN_EMAIL`: ilk admin kullanicinin e-posta adresi.
- `SEED_ADMIN_PASSWORD`: ilk admin kullanicinin sifresi, en az 12 karakter olmalidir.

## Mimari

- `src/app`: App Router sayfalari ve ince server action katmani
- `src/app/_shared`: yalnizca web katmaninin paylastigi cache invalidation gibi altyapi
- `src/components`: layout, UI, form ve is alanina gore ayrilmis tablo bilesenleri
- `src/domain`: framework ve veritabanindan bagimsiz saf is kurallari
- `src/lib`: Prisma, auth, yetki, validasyon ve genel yardimci fonksiyonlar
- `src/services`: use-case orkestrasyonu, transaction sinirlari ve veri erisimi
- `prisma`: veri modeli ve demo seed

Bagimlilik yonu sayfa ve action'lardan servislere, servislerden domain/lib katmanina dogrudur.
Client bilesenleri mutasyonlar icin yalnizca ilgili action'i kullanir; domain katmani ust
katmanlari import etmez. Fatura ve stok invariantlari kendi servislerinde tutulur; satis ve
satin alma servisleri bu yetenekleri transaction icinde birlestirir.
# erp-core
