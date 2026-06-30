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

Demo kullanici:

- E-posta: `admin@minierp.local`
- Sifre: `Admin123!`

## Mimari

- `src/app`: App Router sayfalari ve route gruplari
- `src/components`: layout, UI, tablo, form ve grafik bilesenleri
- `src/lib`: Prisma, auth, yetki, validasyon ve yardimci fonksiyonlar
- `src/services`: is kurallari ve veri erisim servisleri
- `prisma`: veri modeli ve demo seed
# erp-core
