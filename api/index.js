import express from 'express';
import {
  mockUsers, mockStore, mockCategories, mockSuppliers,
  mockChannels, mockInventory, mockPosStores, mockHppHistory,
  mockAnalytics, mockPaymentAccounts, mockOrders, mockOrderDetails,
  mockPendingPO, mockRetur, mockInbound,
  mockCOA, mockRekeningTypes, mockHutang, mockPiutang, 
  mockHistoriHutangPiutang, mockJurnalUmum, mockDepositReseller, 
  mockBukuKas, mockMutasiBank, mockFinanceDashboard, mockLaporan
} from './mockData.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTERS MOCK API ---

// 1. log.php
app.all('/api/log.php', (req, res) => {
  res.json({
    status: "success",
    message: "Login berhasil",
    token: "dummy-token-super-secret",
    user: mockUsers[0]
  });
});

// 2. settings.php
app.all('/api/settings.php', (req, res) => {
  const action = req.query.action;
  if (action === 'get_store') return res.json({ status: "success", data: mockStore });
  if (action === 'get_wa_status') return res.json({ status: "success", connected: true, battery: 98 });
  if (action === 'get_preview_stats') return res.json({ status: "success", data: { total_sales: 45000000, total_orders: 340 } });
  if (action === 'get_coa_list') return res.json({ status: "success", data: mockPaymentAccounts });
  if (action === 'get_qr') return res.json({ status: "success", qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DummyQR" });
  if (action === 'init_data') return res.json({
    status: "success", 
    data: {
      items: mockInventory,
      channels: mockChannels,
      stores: mockPosStores,
      rekening: mockPaymentAccounts,
      store: mockStore,
      sync_health: { status: "OK", last_sync: new Date().toISOString() }
    }
  });
  res.json({ status: "success", message: "Pengaturan berhasil disimpan (Demo Mode)" });
});

// 3. inventory.php
app.all('/api/inventory.php', (req, res) => {
  const action = req.query.action;
  if (action === 'read_inventory') return res.json({ status: "success", data: mockInventory, total: mockInventory.length });
  if (action === 'read_kategori') return res.json({ status: "success", data: mockCategories });
  if (action === 'read_suppliers') return res.json({ status: "success", data: mockSuppliers });
  if (action === 'read_pending_po') return res.json({ status: "success", data: mockPendingPO, total: mockPendingPO.length });
  if (action === 'read_retur') return res.json({ status: "success", data: mockRetur, total: mockRetur.length });
  if (action === 'read_inbound_trx') return res.json({ status: "success", data: mockInbound, total: mockInbound.length });
  res.json({ status: "success", message: "Aksi inventory berhasil diproses" });
});

// 4. users.php
app.all('/api/users.php', (req, res) => {
  const action = req.query.action;
  if (action === 'read') return res.json({ status: "success", data: mockUsers });
  if (action === 'get_payment_accounts') return res.json({ status: "success", data: mockPaymentAccounts });
  res.json({ status: "success", message: "Aksi user berhasil (Demo Mode)" });
});

// 5. pricelist.php
app.all('/api/pricelist.php', (req, res) => {
  const action = req.query.action;
  if (action === 'read_pricelist') return res.json({ status: "success", data: mockInventory, total: mockInventory.length });
  if (action === 'get_all_models') return res.json({ status: "success", data: mockInventory });
  res.json({ status: "success", message: "Harga berhasil disimpan" });
});

// 6. channels.php
app.all('/api/channels.php', (req, res) => {
  if (req.query.action === 'read' || req.query.action === 'read_channels') return res.json({ status: "success", data: mockChannels });
  res.json({ status: "success", message: "Channel aksi berhasil" });
});

// 7. pos.php (Master Store)
app.all('/api/pos.php', (req, res) => {
  const action = req.query.action;
  if (action === 'read_stores') return res.json({ status: "success", data: mockPosStores });
  if (action === 'read_outbound') return res.json({ status: "success", data: mockOrders, total_data: mockOrders.length });
  if (action === 'read_outbound_detail') return res.json(mockOrderDetails);
  if (action === 'get_product_price') return res.json({ status: "success", data: mockInventory[0] });
  if (action === 'check_resi_availability') return res.json({ status: "success" });
  if (action === 'checkout_outbound') return res.json({ status: "success", invoice: "INV-MOCK-2026" });
  if (action === 'update_outbound_status') return res.json({ status: "success" });
  if (action === 'get_order_by_resi') return res.json({ status: "success", data: mockOrders[0] });
  res.json({ status: "success", message: "POS aksi berhasil" });
});

// 8. hpp.php
app.all('/api/hpp.php', (req, res) => {
  if (req.query.action === 'read_history') return res.json({ status: "success", data: mockHppHistory });
  if (req.query.action === 'get_suppliers') {
    const formattedSuppliers = mockSuppliers.map(s => ({
      customer: s.nama_supplier,
      no_hp_supplier: s.no_hp
    }));
    return res.json({ status: "success", data: formattedSuppliers });
  }
  res.json({ status: "success", message: "HPP aksi berhasil" });
});

// 9. dashboard.php
app.all('/api/dashboard.php', (req, res) => {
  res.json({
    status: "success",
    stats: [
      { label: "Omzet Hari Ini", value: "Rp 5.000.000", unit: "IDR", icon: "💰", bg: "bg-blue-100", color: "text-blue-600" },
      { label: "Total Transaksi", value: "120", unit: "TRX", icon: "📦", bg: "bg-emerald-100", color: "text-emerald-600", link: "monitoring" },
      { label: "Stok Barang", value: "1.050", unit: "PCS", icon: "🛒", bg: "bg-amber-100", color: "text-amber-600", link: "inventory" },
      { label: "Retur / Batal", value: "2", unit: "TRX", icon: "🔙", bg: "bg-rose-100", color: "text-rose-600" }
    ],
    activities: [
      { time: "10:30", desc: "Pesanan Baru Shopee", id: "INV-001", qty: 2, status: "Sukses" },
      { time: "09:15", desc: "Barang Masuk PO", id: "PO-HPP-002", qty: 20, status: "Sukses" }
    ],
    inventory: mockInventory.slice(0, 3)
  });
});

// 10. analytics_penjualan.php / laporan.php
app.all('/api/analytics_penjualan.php', (req, res) => {
  res.json({ status: "success", data: mockAnalytics });
});
app.all('/api/laporan.php', (req, res) => {
  // Laporan expects an array of objects
  const dummyLaporan = [
    { "Tanggal": "2026-06-20", "No Invoice": "INV-001", "Pelanggan": "Reseller A", "Total Tagihan": 1500000, "Status": "Lunas" },
    { "Tanggal": "2026-06-19", "No Invoice": "INV-002", "Pelanggan": "Customer B", "Total Tagihan": 500000, "Status": "Lunas" },
    { "Tanggal": "2026-06-18", "No Invoice": "INV-003", "Pelanggan": "Agen C", "Total Tagihan": 2500000, "Status": "Piutang" },
  ];
  res.json(dummyLaporan); // Laporan returns direct array or res.data as array
});

// 11. finance/*
app.all('/api/finance/rekening.php', (req, res) => {
  const action = req.query.action;
  if (action === 'get_types') {
    return res.json(mockRekeningTypes);
  }
  if (action === 'mutasi') {
    return res.json({ status: "success", data: mockMutasiBank, total_data: mockMutasiBank.length });
  }
  res.json(mockPaymentAccounts);
});

app.all('/api/finance/laporan.php', (req, res) => {
  const action = req.query.action;
  if (action === 'laba_rugi') return res.json({ status: "success", data: mockLaporan.laba_rugi });
  if (action === 'neraca') return res.json({ status: "success", data: mockLaporan.neraca });
  res.json({ status: "success", data: mockLaporan });
});

app.all('/api/finance/coa.php', (req, res) => {
  const action = req.query.action;
  if (action === 'read') return res.json({ status: "success", data: mockCOA });
  res.json({ status: "success", data: mockCOA });
});

app.all('/api/finance/utang_piutang.php', (req, res) => {
  const action = req.query.action;
  if (action === 'read_hutang') return res.json(mockHutang);
  if (action === 'read_piutang') return res.json(mockPiutang);
  if (action === 'read_histori_hutang') return res.json(mockHistoriHutangPiutang.filter(h => h.tipe === "Hutang"));
  if (action === 'read_histori_piutang') return res.json(mockHistoriHutangPiutang.filter(h => h.tipe === "Piutang"));
  res.json([]);
});

app.all('/api/finance/jurnal_umum.php', (req, res) => {
  res.json({ status: "success", data: mockJurnalUmum, total: mockJurnalUmum.length });
});

app.all('/api/finance/deposit.php', (req, res) => {
  res.json({ status: "success", data: mockDepositReseller, total: mockDepositReseller.length });
});

app.all('/api/finance/buku_kas.php', (req, res) => {
  res.json({ status: "success", data: mockBukuKas, total: mockBukuKas.length });
});

app.all('/api/finance/mutasi.php', (req, res) => {
  res.json({ status: "success", data: mockMutasiBank, total: mockMutasiBank.length });
});

app.all('/api/finance/dashboard.php', (req, res) => {
  res.json({ status: "success", data: mockFinanceDashboard });
});

// CATCH-ALL UNTUK SISANYA
app.use((req, res) => {
  const method = req.method;
  if (method === 'GET') {
    res.json({ status: "success", data: [], message: "Data kosong (Demo Mode)" });
  } else {
    res.json({ status: "success", message: "Aksi berhasil (Demo Mode)" });
  }
});

export default app;
