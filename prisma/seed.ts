import { PrismaClient, Role, UnitType, CustomerType, StockMovementType, OrderStatus, PurchaseStatus, InvoiceType, InvoiceStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function getSeedAdminCredentials() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLocaleLowerCase("tr-TR");
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!email || email === "change-this-admin@example.com" || !email.includes("@")) {
    throw new Error("SEED_ADMIN_EMAIL .env icinde gecerli bir admin e-posta adresi olarak ayarlanmali.");
  }

  if (!password || password === "change-this-admin-password" || password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD .env icinde en az 12 karakterlik guclu bir deger olarak ayarlanmali.");
  }

  return { email, password };
}

async function main() {
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.companySetting.deleteMany();
  await prisma.user.deleteMany();

  const seedAdmin = getSeedAdminCredentials();
  const passwordHash = await bcrypt.hash(seedAdmin.password, 10);

  const admin = await prisma.user.create({
    data: {
      name: "ERP Admin",
      email: seedAdmin.email,
      passwordHash,
      role: Role.ADMIN
    }
  });

  await prisma.companySetting.create({
    data: {
      companyName: "Kucuk Isletme ERP Sistemi",
      address: "Istanbul",
      phone: "+90 212 000 00 00",
      email: "info@minierp.local",
      taxNumber: "1234567890",
      invoicePrefix: "ERP"
    }
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Gida", description: "Raf ve paketli gida urunleri" } }),
    prisma.category.create({ data: { name: "Temizlik", description: "Temizlik ve sarf malzemeleri" } }),
    prisma.category.create({ data: { name: "Ofis", description: "Ofis tuketim urunleri" } })
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        code: "PRD-001",
        barcode: "869000000001",
        name: "Filtre Kahve 1 kg",
        categoryId: categories[0].id,
        purchasePrice: 210,
        salePrice: 310,
        vatRate: 10,
        unit: UnitType.PAKET,
        stockQuantity: 24,
        minimumStockLevel: 10
      }
    }),
    prisma.product.create({
      data: {
        code: "PRD-002",
        name: "Kagit Havlu",
        categoryId: categories[1].id,
        purchasePrice: 38,
        salePrice: 58,
        vatRate: 20,
        unit: UnitType.PAKET,
        stockQuantity: 8,
        minimumStockLevel: 12
      }
    }),
    prisma.product.create({
      data: {
        code: "PRD-003",
        name: "A4 Fotokopi Kagidi",
        categoryId: categories[2].id,
        purchasePrice: 92,
        salePrice: 135,
        vatRate: 20,
        unit: UnitType.PAKET,
        stockQuantity: 40,
        minimumStockLevel: 15
      }
    })
  ]);

  const customer = await prisma.customer.create({
    data: {
      type: CustomerType.CORPORATE,
      name: "Mavi Kafe Ltd.",
      phone: "+90 532 111 22 33",
      email: "satinalma@mavikafe.local",
      address: "Kadikoy / Istanbul",
      taxNumber: "9876543210"
    }
  });

  const supplier = await prisma.supplier.create({
    data: {
      companyName: "Anadolu Toptan",
      contactPerson: "Selin Yilmaz",
      phone: "+90 312 444 55 66",
      email: "operasyon@anadolutoptan.local",
      address: "Yenimahalle / Ankara",
      taxNumber: "1122334455"
    }
  });

  for (const product of products) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: StockMovementType.ADJUSTMENT,
        quantity: product.stockQuantity,
        note: "Acilis stogu",
        reference: "SEED"
      }
    });
  }

  const saleSubtotal = 2 * 310 + 3 * 135;
  const saleVat = 2 * 310 * 0.1 + 3 * 135 * 0.2;
  const sale = await prisma.salesOrder.create({
    data: {
      orderNumber: "SO-2026-0001",
      customerId: customer.id,
      userId: admin.id,
      status: OrderStatus.APPROVED,
      subtotal: saleSubtotal,
      vatTotal: saleVat,
      grandTotal: saleSubtotal + saleVat,
      stockPosted: true,
      approvedAt: new Date(),
      items: {
        create: [
          { productId: products[0].id, quantity: 2, unitPrice: 310, vatRate: 10, lineTotal: 682 },
          { productId: products[2].id, quantity: 3, unitPrice: 135, vatRate: 20, lineTotal: 486 }
        ]
      }
    }
  });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "ERP-2026-0001",
      type: InvoiceType.SALES,
      status: InvoiceStatus.PARTIALLY_PAID,
      customerId: customer.id,
      salesOrderId: sale.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      subtotal: saleSubtotal,
      vatTotal: saleVat,
      grandTotal: saleSubtotal + saleVat,
      paidTotal: 600
    }
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      userId: admin.id,
      amount: 600,
      method: PaymentMethod.BANK_TRANSFER,
      note: "Kismi odeme"
    }
  });

  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-2026-0001",
      supplierId: supplier.id,
      userId: admin.id,
      status: PurchaseStatus.ORDERED,
      subtotal: 10 * 210,
      vatTotal: 10 * 210 * 0.1,
      grandTotal: 10 * 210 * 1.1,
      items: {
        create: [{ productId: products[0].id, quantity: 10, unitPrice: 210, vatRate: 10, lineTotal: 2310 }]
      }
    }
  });

  await prisma.expense.createMany({
    data: [
      { userId: admin.id, title: "Kargo gideri", category: "Lojistik", amount: 420, method: PaymentMethod.CASH },
      { userId: admin.id, title: "Muhasebe hizmeti", category: "Operasyon", amount: 1500, method: PaymentMethod.BANK_TRANSFER }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
