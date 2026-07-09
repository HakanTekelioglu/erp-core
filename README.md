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

- `src/app`: App Router sayfalari ve route gruplari
- `src/components`: layout, UI, tablo, form ve grafik bilesenleri
- `src/lib`: Prisma, auth, yetki, validasyon ve yardimci fonksiyonlar
- `src/services`: is kurallari ve veri erisim servisleri
- `prisma`: veri modeli ve demo seed
# erp-core
