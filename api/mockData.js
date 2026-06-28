// mockData.js
// Sesuai dengan Struktur_DB.2.0.sql

export const mockUsers = [
  { id: 1, username: "admin_owner", password: "hashed_password", token: "token_123", no_hp: "08111222333", email: "owner@wms.local", nama: "Bpk. Ulum", role: "owner", gaji: 0.00 },
  { id: 2, username: "budi_finance", password: "hashed_password", token: "token_124", no_hp: "08123456789", email: "finance@wms.local", nama: "Budi Santoso", role: "finance", gaji: 5000000.00 },
  { id: 3, username: "siti_gudang", password: "hashed_password", token: "token_125", no_hp: "08555666777", email: "gudang@wms.local", nama: "Siti Aminah", role: "staff", gaji: 4000000.00 },
  { id: 4, username: "joko_kasir", password: "hashed_password", token: "token_126", no_hp: "08999888777", email: "kasir@wms.local", nama: "Joko Anwar", role: "kasir", gaji: 3500000.00 }
];

export const mockStore = {
  nama_toko: "WMS Mega Store",
  alamat: "Jl. Teknologi No. 88, Jakarta Selatan",
  telp: "081234567890",
  wa_status: "connected",
  owner: "Bpk. Ulum",
  api_key: "sk_live_dummy12345"
};

export const mockKategori = [
  { id: 1, nama_kategori: "Kemeja Pria" },
  { id: 2, nama_kategori: "Gamis Wanita" },
  { id: 3, nama_kategori: "Kaos Polos" },
  { id: 4, nama_kategori: "Celana Denim" }
];

// Supaya kompatibel dengan view lama yang menggunakan array of string
export const mockCategories = mockKategori.map(k => k.nama_kategori);

export const mockSuppliers = [
  { id: 1, nama_supplier: "PT. Tekstil Indah", no_hp: "08111222333" },
  { id: 2, nama_supplier: "CV. Makmur Jahit", no_hp: "08555666777" },
  { id: 3, nama_supplier: "Toko Kancing Mas", no_hp: "08999999999" }
];

export const mockChannels = [
  { id: 1, nama_channel: "Toko Offline Pusat", tipe: "Reseller", no_hp: "08123456789", email: "pusat@offline.com", saldo_deposit: 0.00, alamat: "Jakarta", saldo_titipan: 0.00 },
  { id: 2, nama_channel: "Shopee Official", tipe: "Marketplace", no_hp: "-", email: "shopee@online.com", saldo_deposit: 1500000.00, alamat: "-", saldo_titipan: 0.00 },
  { id: 3, nama_channel: "Tokopedia", tipe: "Marketplace", no_hp: "-", email: "toped@online.com", saldo_deposit: 500000.00, alamat: "-", saldo_titipan: 0.00 }
];

export const mockPosStores = [
  { id: 1, nama_store: "Cabang Jakarta Pusat", kode_store: "JKT-001", created_at: "2026-06-01T10:00:00Z", channel_id: 1 },
  { id: 2, nama_store: "Cabang Bandung", kode_store: "BDG-002", created_at: "2026-06-05T12:00:00Z", channel_id: null }
];

// Tabel inventory (digabung dg data supplier untuk view Barang.jsx)
export const mockInventory = Array.from({ length: 50 }).map((_, i) => {
  const kat = mockKategori[i % mockKategori.length];
  const hargaBeli = 35000 + Math.floor(Math.random() * 50000);
  return {
    id: i + 1,
    kode_barang: `BRG-${String(i + 1).padStart(4, '0')}`,
    nama_barang: `Produk ${kat.nama_kategori} Premium Edisi ${i + 1}`,
    foto: null,
    id_kategori: kat.id,
    nama_kategori: kat.nama_kategori, // Ditambahkan untuk frontend view
    size: ["S", "M", "L", "XL"][i % 4],
    batas_stok_rendah: 20,
    stok: Math.floor(Math.random() * 200) + 5,
    satuan: "Pcs",
    harga_beli: hargaBeli,
    harga_jual: Math.floor(hargaBeli * 1.5),
    harga_reseller: Math.floor(hargaBeli * 1.2),
    harga_marketplace: Math.floor(hargaBeli * 1.6),
    supplier: mockSuppliers[i % mockSuppliers.length].nama_supplier, // Ekstraksi untuk frontend
    tanggal_masuk: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
  };
});

// Tabel hpp_history
export const mockHppHistory = [
  { 
    id: 1, no_po: "PO-HPP-001", customer: "Internal", nama_bahan: "Kain Katun Jepang", qty_produksi: 100, 
    harga_bahan: 2500000.00, qty_bahan: 50, biaya_potong_total: 100000.00, biaya_jahit: 500000.00, biaya_finishing: 150000.00,
    biaya_laundry: 50000.00, sleting: 20000.00, puring: 0, plastik: 10000.00, kancing: 5000.00, label: 15000.00, kertas: 5000.00,
    kertas_thermal: 0, plastik_packing: 10000.00, hpp_final_pcs: 33650.00, tanggal_hitung: "2026-06-01T10:00:00Z", no_hp_supplier: "08111222333", model: "Kemeja Reguler",
    status_po_aktual: "Selesai", qty_inbound_aktual: 100
  },
  { 
    id: 2, no_po: "PO-HPP-002", customer: "Reseller A", nama_bahan: "Kain Denim 12oz", qty_produksi: 50, 
    harga_bahan: 3000000.00, qty_bahan: 40, biaya_potong_total: 150000.00, biaya_jahit: 750000.00, biaya_finishing: 200000.00,
    biaya_laundry: 100000.00, sleting: 50000.00, puring: 0, plastik: 10000.00, kancing: 25000.00, label: 10000.00, kertas: 5000.00,
    kertas_thermal: 0, plastik_packing: 10000.00, hpp_final_pcs: 86200.00, tanggal_hitung: "2026-06-15T14:30:00Z", no_hp_supplier: "08111222333", model: "Celana Jeans Slim",
    status_po_aktual: "Proses", qty_inbound_aktual: 20
  }
];

export const mockOrders = [
  { id: 1, no_invoice: "INV-20260601-001", no_resi: "RESI-001", nama_pembeli: "Budi Santoso", no_hp: "081234567890", channel_id: 1, nama_channel: "Shopee", store_id: 1, nama_store: "Store SBY", status: "Dikirim", total_bayar: 250000, metode_pembayaran: "Transfer BCA", created_at: "2026-06-01 10:00:00" },
  { id: 2, no_invoice: "INV-20260602-002", no_resi: "RESI-002", nama_pembeli: "Ani Lestar", no_hp: "081298765432", channel_id: 2, nama_channel: "Tokopedia", store_id: 1, nama_store: "Store SBY", status: "Pending", total_bayar: 150000, metode_pembayaran: "Gopay", created_at: "2026-06-02 11:30:00" },
  { id: 3, no_invoice: "INV-20260603-003", no_resi: "", nama_pembeli: "Citra Kirana", no_hp: "085512345678", channel_id: 3, nama_channel: "WhatsApp", store_id: null, nama_store: "", status: "Sukses", total_bayar: 300000, metode_pembayaran: "Transfer Mandiri", created_at: "2026-06-03 09:15:00" }
];

export const mockOrderDetails = [
  { id: 1, transaksi_id: 1, inventory_id: 1, nama_barang: "Kemeja Flanel Kotak", kode_barang: "KFK-01", qty: 2, subtotal: 250000 },
  { id: 2, transaksi_id: 2, inventory_id: 2, nama_barang: "Celana Chino Panjang", kode_barang: "CCP-02", qty: 1, subtotal: 150000 },
  { id: 3, transaksi_id: 3, inventory_id: 1, nama_barang: "Kemeja Flanel Kotak", kode_barang: "KFK-01", qty: 1, subtotal: 150000 },
  { id: 4, transaksi_id: 3, inventory_id: 2, nama_barang: "Celana Chino Panjang", kode_barang: "CCP-02", qty: 1, subtotal: 150000 }
];

export const mockPendingPO = [
  { id: 1, no_po: "PO-HPP-002", model: "Celana Jeans Slim", vendor: "Reseller A", qty_produksi: 50, qty_masuk: 20, sisa: 30, tanggal_hitung: "2026-06-15T14:30:00Z" }
];

export const mockRetur = [
  { id: 1, no_invoice: "INV-20260601-001", nama_pembeli: "Budi Santoso", nama_barang: "Kemeja Flanel Kotak", qty_retur: 1, alasan: "Cacat produksi", status_retur: "Menunggu" }
];

export const mockInbound = [
  { id: 1, kode_barang: "KFK-01", nama_barang: "Kemeja Flanel Kotak", tipe_inbound: "PO", qty: 100, tanggal: "2026-06-05 10:00:00", pic: "Gudang 1" },
  { id: 2, kode_barang: "CCP-02", nama_barang: "Celana Chino Panjang", tipe_inbound: "Retur", qty: 1, tanggal: "2026-06-06 14:00:00", pic: "QC" }
];

// Tabel rekening
export const mockPaymentAccounts = [
  { id: 1, nama_rekening: "BCA Utama", tipe_rekening: "Transfer Bank", nomor_rekening: "1234567890", saldo_awal: 10000000.00, saldo_sekarang: 45000000.00, is_active: 1, coa_id: 1 },
  { id: 2, nama_rekening: "Mandiri Operasional", tipe_rekening: "Transfer Bank", nomor_rekening: "0987654321", saldo_awal: 5000000.00, saldo_sekarang: 12500000.00, is_active: 1, coa_id: 2 },
  { id: 3, nama_rekening: "Kas Tunai Toko", tipe_rekening: "Tunai", nomor_rekening: "-", saldo_awal: 1000000.00, saldo_sekarang: 3500000.00, is_active: 1, coa_id: 3 }
];

// Tabel coa
export const mockCoa = [
  { id: 1, kode_akun: "1-1001", nama_akun: "Bank BCA", tipe_akun: "Asset", saldo_normal: "Debit", is_active: 1 },
  { id: 2, kode_akun: "1-1002", nama_akun: "Bank Mandiri", tipe_akun: "Asset", saldo_normal: "Debit", is_active: 1 },
  { id: 3, kode_akun: "1-1003", nama_akun: "Kas Kecil", tipe_akun: "Asset", saldo_normal: "Debit", is_active: 1 },
  { id: 4, kode_akun: "4-1001", nama_akun: "Pendapatan Penjualan", tipe_akun: "Revenue", saldo_normal: "Kredit", is_active: 1 },
  { id: 5, kode_akun: "5-1001", nama_akun: "Harga Pokok Penjualan", tipe_akun: "Expense", saldo_normal: "Debit", is_active: 1 }
];

// Laporan Penjualan (Analytics) 
// (Bukan dari struktur spesifik tapi dibutuhkan untuk dashboard frontend)
// Analytics / Laporan Data Structure
export const mockAnalytics = {
  metrics: {
    total_qty_terjual: 120,
    qty_retur: 2,
    total_stok_all: 1050,
    low_stock_count: 5
  },
  daily_trend: [
    { tanggal: "2026-06-14", omzet: 1200000, qty: 10 },
    { tanggal: "2026-06-15", omzet: 2500000, qty: 18 },
    { tanggal: "2026-06-16", omzet: 1800000, qty: 15 },
    { tanggal: "2026-06-17", omzet: 3000000, qty: 25 },
    { tanggal: "2026-06-18", omzet: 2100000, qty: 12 },
    { tanggal: "2026-06-19", omzet: 4500000, qty: 30 },
    { tanggal: "2026-06-20", omzet: 1500000, qty: 10 }
  ],
  top_products: [
    { nama_barang: "Kemeja Flanel Kotak", kode_barang: "KFK-01", total_terjual: 45 },
    { nama_barang: "Celana Chino Panjang", kode_barang: "CCP-02", total_terjual: 30 },
    { nama_barang: "Kaos Polos Cotton 30s", kode_barang: "KPC-03", total_terjual: 25 }
  ]
};

// ================= FINANCE MOCK DATA =================

export const mockCOA = [
  { id: 1, kode_akun: "10-100", nama_akun: "Kas Tunai", tipe_akun: "Asset", saldo_normal: "Debit", linked_rekening: "Kas Utama" },
  { id: 2, kode_akun: "10-101", nama_akun: "Bank BCA", tipe_akun: "Asset", saldo_normal: "Debit", linked_rekening: "BCA Utama" },
  { id: 3, kode_akun: "10-102", nama_akun: "Bank Mandiri", tipe_akun: "Asset", saldo_normal: "Debit", linked_rekening: "Mandiri Operasional" },
  { id: 4, kode_akun: "10-103", nama_akun: "ShopeePay", tipe_akun: "Asset", saldo_normal: "Debit", linked_rekening: "ShopeePay Escrow" },
  { id: 5, kode_akun: "11-200", nama_akun: "Piutang Usaha", tipe_akun: "Asset", saldo_normal: "Debit" },
  { id: 6, kode_akun: "20-100", nama_akun: "Hutang Usaha", tipe_akun: "Liability", saldo_normal: "Kredit" },
  { id: 7, kode_akun: "30-100", nama_akun: "Modal Pemilik", tipe_akun: "Equity", saldo_normal: "Kredit" },
  { id: 8, kode_akun: "40-100", nama_akun: "Pendapatan Penjualan", tipe_akun: "Revenue", saldo_normal: "Kredit" },
  { id: 9, kode_akun: "50-100", nama_akun: "HPP", tipe_akun: "Expense", saldo_normal: "Debit" },
  { id: 10, kode_akun: "60-100", nama_akun: "Biaya Operasional", tipe_akun: "Expense", saldo_normal: "Debit" }
];

export const mockRekeningTypes = { status: "success", types: ["Transfer Bank", "E-Wallet", "Tunai", "MP Escrow"] };

export const mockHutang = [
  { id: 1, type: "Hutang", no_invoice: "INV-PO-001", nama_supplier: "Supplier Kain A", total_hutang: 5000000.00, total_terbayar: 3000000.00, status: "Sebagian", jatuh_tempo: "2026-06-30" },
  { id: 2, type: "Hutang", no_invoice: "INV-PO-002", nama_supplier: "Konveksi Makmur", total_hutang: 3500000.00, total_terbayar: 0, status: "Belum Lunas", jatuh_tempo: "2026-06-25" }
];

export const mockPiutang = [
  { id: 1, type: "Piutang", no_invoice: "INV-RES-001", nama_channel: "Reseller Budi", total_tagihan: 1500000.00, total_terbayar: 1000000.00, status: "Sebagian", jatuh_tempo: "2026-06-28" },
  { id: 2, type: "Piutang", no_invoice: "INV-RES-002", nama_channel: "Agen Surya", total_tagihan: 2500000.00, total_terbayar: 0, status: "Belum Lunas", jatuh_tempo: "2026-06-22" }
];

export const mockHistoriHutangPiutang = [
  { id: 1, no_invoice: "INV-PO-001", nominal: 3000000.00, rekening_bayar: "BCA Utama", tipe: "Hutang", tanggal: "2026-06-15 10:00:00", pic: "Finance" },
  { id: 2, no_invoice: "INV-RES-001", nominal: 1000000.00, rekening_bayar: "Kas Utama", tipe: "Piutang", tanggal: "2026-06-16 14:00:00", pic: "Finance" }
];

export const mockJurnalUmum = [
  { id: 1, tanggal: "2026-06-20", no_referensi: "TRX-001", deskripsi: "Penjualan Barang Tunai", akun_debit: "10-100", nama_akun_debit: "Kas Tunai", akun_kredit: "40-100", nama_akun_kredit: "Pendapatan Penjualan", total_debit: 1500000.00, total_kredit: 1500000.00 },
  { id: 2, tanggal: "2026-06-19", no_referensi: "PAY-001", deskripsi: "Bayar Tagihan Listrik", akun_debit: "60-100", nama_akun_debit: "Biaya Operasional", akun_kredit: "10-101", nama_akun_kredit: "Bank BCA", total_debit: 500000.00, total_kredit: 500000.00 }
];

export const mockLaporan = {
  laba_rugi: {
    pendapatan: [{ nama_akun: "Pendapatan Penjualan", total: 15000000 }],
    hpp: [{ nama_akun: "HPP", total: 4000000 }],
    biaya: [{ nama_akun: "Biaya Listrik", total: 500000 }, { nama_akun: "Biaya Gaji", total: 1500000 }],
    total_pendapatan: 15000000,
    total_hpp: 4000000,
    laba_kotor: 11000000,
    total_biaya: 2000000,
    laba_bersih: 9000000
  },
  neraca: {
    aset: [{ nama_akun: "Kas & Bank", total: 67000000 }, { nama_akun: "Piutang Usaha", total: 3000000 }],
    kewajiban: [{ nama_akun: "Hutang Usaha", total: 5500000 }],
    modal: [{ nama_akun: "Modal Pemilik", total: 55500000 }, { nama_akun: "Laba Ditahan", total: 9000000 }],
    total_aset: 70000000,
    total_kewajiban: 5500000,
    total_modal: 64500000,
    total_pasiva: 70000000
  }
};

export const mockDepositReseller = [
  { id: 1, tanggal: "2026-06-18 09:30:00", reseller: "Reseller Budi", nominal: 5000000.00, tipe: "Topup", keterangan: "Topup saldo via BCA" },
  { id: 2, tanggal: "2026-06-19 15:45:00", reseller: "Reseller Budi", nominal: -250000.00, tipe: "Potongan", keterangan: "Potongan checkout pesanan INV-20260619-01" },
  { id: 3, tanggal: "2026-06-20 10:00:00", reseller: "Agen Surya", nominal: 10000000.00, tipe: "Topup", keterangan: "Topup saldo via Mandiri" }
];

export const mockBukuKas = [
  { id: 1, tanggal: "2026-06-15", no_referensi: "KAS-001", rekening: "Kas Utama", keterangan: "Setoran Modal Awal", tipe_mutasi: "Masuk", debit: 5000000.00, kredit: 0, saldo: 5000000.00, coa: "30-100" },
  { id: 2, tanggal: "2026-06-16", no_referensi: "KAS-002", rekening: "Kas Utama", keterangan: "Beli Alat Tulis", tipe_mutasi: "Keluar", debit: 0, kredit: 150000.00, saldo: 4850000.00, coa: "60-100" },
  { id: 3, tanggal: "2026-06-17", no_referensi: "KAS-003", rekening: "BCA Utama", keterangan: "Terima Transfer Penjualan", tipe_mutasi: "Masuk", debit: 2500000.00, kredit: 0, saldo: 7350000.00, coa: "40-100" }
];

export const mockMutasiBank = [
  { id: 1, bank: "BCA Utama", tanggal: "2026-06-17 11:00:00", keterangan: "TRF DARI BUDI", jenis_mutasi: "Masuk", nominal: 2500000.00, saldo_berjalan: 47500000.00, nama_pihak: "Budi Santoso" },
  { id: 2, bank: "Mandiri Operasional", tanggal: "2026-06-18 09:00:00", keterangan: "TRF KE PLN", jenis_mutasi: "Keluar", nominal: 500000.00, saldo_berjalan: 19500000.00, nama_pihak: "PLN" }
];

export const mockFinanceDashboard = {
  total_kas: 67000000.00,
  total_piutang: 3000000.00,
  total_utang: 5500000.00,
  laba_bulan_ini: 13000000.00,
  cash_trends: [
    { month: "Jan", masuk: 12000000, keluar: 2000000 },
    { month: "Feb", masuk: 15000000, keluar: 3000000 },
    { month: "Mar", masuk: 11000000, keluar: 1500000 },
    { month: "Apr", masuk: 18000000, keluar: 2500000 },
    { month: "Mei", masuk: 14000000, keluar: 1000000 },
    { month: "Jun", masuk: 15000000, keluar: 2000000 }
  ]
};