import { useState, useEffect, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import DateRangeFilter from "../../components/DateRangeFilter";
import Pagination from "../../components/Pagination";
import axiosInstance from "../../utils/axios";

const CURRENCY_KEYS = new Set([
  "Total Bayar", "Total Biaya", "Nominal", "Terbayar", "Sisa Hutang", "Sisa Piutang",
  "Total Tagihan", "Total Hutang", "HPP (Modal)", "Harga Modal", "Harga Jual",
  "Harga Reseller", "Harga MP", "HPP Satuan", "Total Valuasi", "HPP (Modal Dasar)",
  "HPP / Pcs", "Total Omzet", "Gaji Pokok", "Bonus", "Potongan", "Total Diterima",
  "Saldo Awal", "Saldo Sekarang", "Saldo", "Total Debit", "Total Kredit",
  "Debit", "Kredit", "Nominal Bayar", "Total Hutang Asal", "Harga Bahan",
  "Biaya Potong", "Biaya Jahit", "Biaya Finishing", "Biaya Laundry", "Biaya Aksesoris",
  "Total Biaya Asal", "HPP Satuan",
]);

const formatRp = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : "Rp " + new Intl.NumberFormat("id-ID").format(n);
};

const TAB_GROUPS = [
  {
    group: "Penjualan",
    color: "blue",
    icon: "🛒",
    tabs: [
      { id: "penjualan", label: "Daftar Penjualan", icon: "🛒", hasDate: true },
      { id: "rekap_channel", label: "Rekap per Channel", icon: "📊", hasDate: true },
      { id: "rekap_store", label: "Rekap per Toko", icon: "🏢", hasDate: true },
      { id: "order_tracking", label: "Order Tracking", icon: "🚚", hasDate: true },
      { id: "retur_customer", label: "Retur Penjualan", icon: "🔙", hasDate: true },
    ],
  },
  {
    group: "Pembelian & Produksi",
    color: "purple",
    icon: "🏭",
    tabs: [
      { id: "inbound", label: "Barang Masuk", icon: "📥", hasDate: true },
      { id: "inbound_po", label: "Purchase Order", icon: "📋", hasDate: true },
      { id: "hpp_produksi", label: "Kalkulasi HPP", icon: "⚙️", hasDate: true },
      { id: "alokasi_vendor", label: "Alokasi Vendor", icon: "👥", hasDate: true },
      { id: "retur", label: "Retur Supplier", icon: "⚠️", hasDate: true },
    ],
  },
  {
    group: "Keuangan",
    color: "emerald",
    icon: "💰",
    tabs: [
      { id: "kas", label: "Arus Kas", icon: "💸", hasDate: true },
      { id: "hutang", label: "Buku Hutang", icon: "📤", hasDate: true },
      { id: "pembayaran_hutang", label: "Bayar Hutang", icon: "✅", hasDate: true },
      { id: "piutang", label: "Buku Piutang", icon: "📥", hasDate: true },
      { id: "pembayaran_piutang", label: "Terima Piutang", icon: "💵", hasDate: true },
      { id: "deposit_reseller", label: "Deposit Reseller", icon: "🏦", hasDate: true },
      { id: "payroll", label: "Penggajian", icon: "👤", hasDate: true },
    ],
  },
  {
    group: "Akuntansi",
    color: "amber",
    icon: "📒",
    tabs: [
      { id: "jurnal_flat", label: "Jurnal Umum", icon: "📒", hasDate: true },
      { id: "buku_besar_flat", label: "Buku Besar (COA)", icon: "📑", hasDate: true },
    ],
  },
  {
    group: "Stok & Master",
    color: "rose",
    icon: "📦",
    tabs: [
      { id: "stok", label: "Stok & HPP", icon: "📦", hasDate: false },
      { id: "master_barang", label: "Data Barang", icon: "👕", hasDate: false },
      { id: "master_channel", label: "Data Channel", icon: "🔗", hasDate: false },
      { id: "master_store", label: "Data Toko", icon: "🏪", hasDate: false },
      { id: "master_rekening", label: "Data Rekening", icon: "💳", hasDate: false },
      { id: "master_supplier", label: "Data Supplier", icon: "🤝", hasDate: false },
      { id: "master_coa", label: "Chart of Accounts", icon: "📊", hasDate: false },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);

const COLOR_MAP = {
  blue: { active: "bg-blue-600 text-white shadow-blue-500/30", dot: "bg-blue-500" },
  purple: { active: "bg-purple-600 text-white shadow-purple-500/30", dot: "bg-purple-500" },
  emerald: { active: "bg-emerald-600 text-white shadow-emerald-500/30", dot: "bg-emerald-500" },
  amber: { active: "bg-amber-500 text-white shadow-amber-500/30", dot: "bg-amber-500" },
  rose: { active: "bg-rose-600 text-white shadow-rose-500/30", dot: "bg-rose-500" },
};

const getLocalISODate = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

const Laporan = () => {
  const [activeGroup, setActiveGroup] = useState("Penjualan");
  const [activeTab, setActiveTab] = useState("penjualan");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportMode, setExportMode] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return getLocalISODate(d);
  });
  const [endDate, setEndDate] = useState(() => getLocalISODate(new Date()));

  const currentTabMeta = ALL_TABS.find((t) => t.id === activeTab) || ALL_TABS[0];
  const currentGroupColor = TAB_GROUPS.find((g) => g.group === activeGroup)?.color || "blue";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { action: activeTab };
      if (currentTabMeta.hasDate && startDate) params.start = startDate;
      if (currentTabMeta.hasDate && endDate) params.end = endDate;
      const res = await axiosInstance.get("/laporan.php", { params });
      setData(Array.isArray(res.data) ? res.data : []);
    } catch {
      window.showToast("Gagal mengambil data laporan!", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate, currentTabMeta.hasDate]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSelectTab = (tab, group) => {
    setActiveGroup(group);
    setActiveTab(tab.id);
    setCurrentPage(1); // Reset page when changing tab
  };

  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * limit;
    return data.slice(startIdx, startIdx + limit);
  }, [data, currentPage, limit]);

  const buildExcelData = (rows) =>
    rows.map((row) => {
      const out = {};
      Object.entries(row).forEach(([k, v]) => {
        out[k] = CURRENCY_KEYS.has(k) && v !== null && !isNaN(parseFloat(v))
          ? parseFloat(v)
          : v ?? "-";
      });
      return out;
    });

  const handleExport = async (mode = "single") => {
    setExportMode(mode);
    try {
      const wb = XLSX.utils.book_new();
      const targets = mode === "all" ? ALL_TABS : [currentTabMeta];

      for (const tab of targets) {
        const params = { action: tab.id };
        if (tab.hasDate && startDate) params.start = startDate;
        if (tab.hasDate && endDate) params.end = endDate;
        const res = await axiosInstance.get(`/laporan.php`, { params });
        const rows = Array.isArray(res.data) ? res.data : [];
        const safeName = tab.label.replace(/[\\/*?:[\]]/g, "").substring(0, 31);
        const ws = XLSX.utils.json_to_sheet(
          rows.length > 0 ? buildExcelData(rows) : [{ Pesan: "Data kosong" }]
        );
        XLSX.utils.book_append_sheet(wb, ws, safeName);
      }

      XLSX.writeFile(
        wb,
        mode === "all"
          ? `Laporan_Lengkap_${Date.now()}.xlsx`
          : `Laporan_${currentTabMeta.label}_${Date.now()}.xlsx`
      );
      window.showToast("Export Excel berhasil!", "success");
    } catch {
      window.showToast("Gagal export Excel!", "error");
    } finally {
      setExportMode(null);
    }
  };

  // Summary counts
  const totalRows = data.length;
  const totalNominal = (() => {
    const nomKey = Object.keys(data[0] || {}).find((k) => CURRENCY_KEYS.has(k) && k.toLowerCase().includes("total"));
    if (!nomKey) return null;
    const sum = data.reduce((s, r) => s + (parseFloat(r[nomKey]) || 0), 0);
    return { key: nomKey, val: sum };
  })();

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* ── TOP BAR ── */}
      <div className="shrink-0 px-4 pt-4 pb-2 flex flex-wrap gap-3 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 opacity-70">Laporan VIP</p>
          <h2 className="text-sm font-black italic uppercase text-slate-800 dark:text-slate-100 tracking-tight">
            {currentTabMeta.icon} {currentTabMeta.label}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          {currentTabMeta.hasDate && (
            <>
              <DateRangeFilter
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
              />
              <button
                onClick={fetchData}
                className="bg-slate-900 dark:bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow active:scale-95 transition-all"
              >
                Terapkan
              </button>
            </>
          )}
          <button
            onClick={() => handleExport("single")}
            disabled={exportMode !== null || data.length === 0}
            className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 dark:border-emerald-900 px-3 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            {exportMode === "single" ? <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block" /> : "📄"}
            Export Tab
          </button>
          <button
            onClick={() => handleExport("all")}
            disabled={exportMode !== null}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            {exportMode === "all" ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : "📊"}
            Export Semua
          </button>
        </div>
      </div>

      {/* ── GROUP + TAB BAR ── */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 space-y-2">
        {/* Group Pills */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {TAB_GROUPS.map((g) => {
            const c = COLOR_MAP[g.color];
            const isActive = activeGroup === g.group;
            return (
              <button
                key={g.group}
                onClick={() => { setActiveGroup(g.group); handleSelectTab(g.tabs[0], g.group); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest whitespace-nowrap shrink-0 transition-all ${isActive
                  ? `${c.active} shadow-md`
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
              >
                <span className="text-sm">{g.icon}</span>{g.group}
              </button>
            );
          })}
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
          {TAB_GROUPS.find((g) => g.group === activeGroup)?.tabs.map((tab) => {
            const c = COLOR_MAP[currentGroupColor];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${activeTab === tab.id
                  ? `${c.active} shadow`
                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SUMMARY BAR ── */}
      <div className="shrink-0 px-4 py-2 flex gap-4 items-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Data</span>
          <span className="text-sm font-black text-slate-800 dark:text-slate-100">{totalRows.toLocaleString("id-ID")}</span>
          <span className="text-[9px] text-slate-400">baris</span>
        </div>
        {totalNominal && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2">
            <span className="text-[10px] font-black uppercase text-slate-400">{totalNominal.key}</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              Rp {new Intl.NumberFormat("id-ID").format(totalNominal.val)}
            </span>
          </div>
        )}
        {currentTabMeta.hasDate && (
          <span className="text-[9px] text-slate-400 italic ml-auto">
            Periode: {startDate} s/d {endDate}
          </span>
        )}
      </div>

      {/* ── TABLE ── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-4 pb-4">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex flex-col justify-center items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Memuat Data...</p>
            </div>
          ) : data.length > 0 ? (
            <div className="overflow-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-separate border-spacing-y-1 px-3 py-2">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-white/95 dark:bg-slate-900/95 backdrop-blur">
                    <th className="py-2 px-3 text-[8px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">#</th>
                    {Object.keys(paginatedData[0]).map((k) => (
                      <th key={k} className="py-2 px-3 text-[8px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => {
                    const rowNumber = (currentPage - 1) * limit + idx + 1;
                    return (
                      <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-1.5 px-3 bg-slate-50 dark:bg-slate-800/30 rounded-l-lg text-[9px] font-bold text-slate-400 border-y border-l border-slate-100 dark:border-slate-800 whitespace-nowrap">
                          {rowNumber}
                        </td>
                        {Object.entries(row).map(([k, v], i, arr) => {
                          const isCurr = CURRENCY_KEYS.has(k);
                          const display = isCurr && v !== null ? formatRp(v) : (v ?? "-");
                          const isLast = i === arr.length - 1;
                          return (
                            <td
                              key={k}
                              className={`py-1.5 px-3 bg-slate-50 dark:bg-slate-800/30 border-y border-slate-100 dark:border-slate-800 ${isLast ? "rounded-r-lg border-r" : ""}`}
                            >
                              <div
                                className={`text-xs font-semibold truncate max-w-[180px] ${isCurr
                                  ? "text-emerald-600 dark:text-emerald-400 font-black"
                                  : String(display).toUpperCase() === "KRITIS"
                                    ? "text-rose-600 dark:text-rose-400 font-black"
                                    : "text-slate-700 dark:text-slate-300"
                                  }`}
                                title={String(display)}
                              >
                                {display}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center gap-3 text-slate-300 dark:text-slate-700">
              <span className="text-4xl">📭</span>
              <p className="font-black italic uppercase tracking-widest text-sm">Data Tidak Ditemukan</p>
              <p className="text-[10px] text-slate-400">Coba ubah rentang tanggal atau filter</p>
            </div>
          )}
          {/* Pagination */}
          {data.length > 0 && !loading && (
            <div className="shrink-0">
              <Pagination
                totalData={data.length}
                limit={limit}
                onLimitChange={setLimit}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Laporan;
