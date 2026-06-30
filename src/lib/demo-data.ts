export const demoCategories = [
  { id: "cat-1", name: "Gida", description: "Paketli gida ve icecekler", isActive: "Aktif", productCount: 18 },
  { id: "cat-2", name: "Temizlik", description: "Temizlik ve sarf malzemeleri", isActive: "Aktif", productCount: 11 },
  { id: "cat-3", name: "Ofis", description: "Ofis tuketim urunleri", isActive: "Aktif", productCount: 9 }
];

export const demoProducts = [
  { id: "prd-1", code: "PRD-001", name: "Filtre Kahve 1 kg", category: "Gida", stock: 24, minStock: 10, purchasePrice: 210, salePrice: 310, unit: "PAKET", status: "Aktif" },
  { id: "prd-2", code: "PRD-002", name: "Kagit Havlu", category: "Temizlik", stock: 8, minStock: 12, purchasePrice: 38, salePrice: 58, unit: "PAKET", status: "Kritik" },
  { id: "prd-3", code: "PRD-003", name: "A4 Fotokopi Kagidi", category: "Ofis", stock: 40, minStock: 15, purchasePrice: 92, salePrice: 135, unit: "PAKET", status: "Aktif" },
  { id: "prd-4", code: "PRD-004", name: "Zeytinyagi 5 lt", category: "Gida", stock: 6, minStock: 8, purchasePrice: 620, salePrice: 790, unit: "LITRE", status: "Kritik" }
];

export const demoCustomers = [
  { id: "cus-1", type: "Kurumsal", name: "Mavi Kafe Ltd.", phone: "+90 532 111 22 33", email: "satinalma@mavikafe.local", balance: 568, status: "Aktif" },
  { id: "cus-2", type: "Kurumsal", name: "Nehir Market", phone: "+90 216 444 11 22", email: "finans@nehirmarket.local", balance: 0, status: "Aktif" },
  { id: "cus-3", type: "Bireysel", name: "Ayse Demir", phone: "+90 555 012 34 56", email: "ayse@example.com", balance: 240, status: "Aktif" }
];

export const demoSuppliers = [
  { id: "sup-1", companyName: "Anadolu Toptan", contactPerson: "Selin Yilmaz", phone: "+90 312 444 55 66", email: "operasyon@anadolutoptan.local", status: "Aktif" },
  { id: "sup-2", companyName: "Marmara Sarf", contactPerson: "Kerem Ak", phone: "+90 212 320 10 20", email: "siparis@marmarasarf.local", status: "Aktif" }
];

export const demoStockMovements = [
  { id: "stm-1", product: "Filtre Kahve 1 kg", type: "SALE_OUT", quantity: 2, reference: "SO-2026-0001", date: "29.06.2026" },
  { id: "stm-2", product: "A4 Fotokopi Kagidi", type: "SALE_OUT", quantity: 3, reference: "SO-2026-0001", date: "29.06.2026" },
  { id: "stm-3", product: "Kagit Havlu", type: "ADJUSTMENT", quantity: 8, reference: "SEED", date: "28.06.2026" }
];

export const demoSalesOrders = [
  { id: "so-1", orderNumber: "SO-2026-0001", customer: "Mavi Kafe Ltd.", status: "APPROVED", total: 1168, date: "29.06.2026" },
  { id: "so-2", orderNumber: "SO-2026-0002", customer: "Nehir Market", status: "PENDING", total: 2840, date: "28.06.2026" },
  { id: "so-3", orderNumber: "SO-2026-0003", customer: "Ayse Demir", status: "DRAFT", total: 740, date: "27.06.2026" }
];

export const demoPurchaseOrders = [
  { id: "po-1", orderNumber: "PO-2026-0001", supplier: "Anadolu Toptan", status: "ORDERED", total: 2310, date: "28.06.2026" },
  { id: "po-2", orderNumber: "PO-2026-0002", supplier: "Marmara Sarf", status: "RECEIVED", total: 4260, date: "24.06.2026" }
];

export const demoInvoices = [
  { id: "inv-1", invoiceNumber: "ERP-2026-0001", type: "Satis", party: "Mavi Kafe Ltd.", status: "PARTIALLY_PAID", total: 1168, paid: 600, dueDate: "13.07.2026" },
  { id: "inv-2", invoiceNumber: "ERP-2026-0002", type: "Satis", party: "Nehir Market", status: "UNPAID", total: 2840, paid: 0, dueDate: "12.07.2026" },
  { id: "inv-3", invoiceNumber: "ERP-2026-0003", type: "Satin Alma", party: "Marmara Sarf", status: "PAID", total: 4260, paid: 4260, dueDate: "30.06.2026" }
];

export const demoPayments = [
  { id: "pay-1", invoiceNumber: "ERP-2026-0001", party: "Mavi Kafe Ltd.", amount: 600, method: "BANK_TRANSFER", date: "29.06.2026" },
  { id: "pay-2", invoiceNumber: "ERP-2026-0003", party: "Marmara Sarf", amount: 4260, method: "CREDIT_CARD", date: "25.06.2026" }
];

export const demoExpenses = [
  { id: "exp-1", title: "Kargo gideri", category: "Lojistik", amount: 420, method: "CASH", date: "29.06.2026" },
  { id: "exp-2", title: "Muhasebe hizmeti", category: "Operasyon", amount: 1500, method: "BANK_TRANSFER", date: "26.06.2026" }
];

export const demoUsers = [
  { id: "usr-1", name: "ERP Admin", email: "admin@minierp.local", role: "ADMIN", status: "Aktif" },
  { id: "usr-2", name: "Satis Uzmani", email: "satis@minierp.local", role: "SALES", status: "Aktif" },
  { id: "usr-3", name: "Depo Sorumlusu", email: "depo@minierp.local", role: "WAREHOUSE", status: "Aktif" }
];

export const dashboardMetrics = {
  monthlySales: 138000,
  monthlyExpense: 81000,
  estimatedProfit: 57000,
  customerCount: 42,
  productCount: 96,
  criticalStockCount: 7,
  pendingSales: 5,
  unpaidInvoices: 9
};
