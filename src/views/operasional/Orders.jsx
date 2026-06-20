import { useState, useEffect } from "react";

/**
 * Orders View - Mockup Orderan Masuk Marketplace
 * Didesain selaras dengan Pos.jsx dan Monitoring.jsx
 */
const Orders = () => {
  const [viewMode, setViewMode] = useState("card"); // "card" atau "list"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMp, setFilterMp] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Data Orders jadikan state agar reaktif saat di-scan/proses
  const [orders, setOrders] = useState([
    {
      id: 1,
      mp: "Shopee",
      orderId: "240614SHP01",
      resi: "SPXID04221922",
      storeName: "Toko Budi Jaya",
      items: "Kulot Cargo Hitam (2)",
      total: 130000,
      status: "Baru",
      time: "10 Menit Lalu",
    },
    {
      id: 2,
      mp: "TikTok",
      orderId: "TT-9921029",
      resi: "JX-128821920",
      storeName: "Fashion Siti",
      items: "Kulot Cargo Navy (1)",
      total: 65000,
      status: "Baru",
      time: "25 Menit Lalu",
    },
    {
      id: 3,
      mp: "Lazada",
      orderId: "LZD-882192",
      resi: "LELX-9921022",
      storeName: "Grosir Agus",
      items: "Kulot Cargo Cream (3)",
      total: 195000,
      status: "Diproses",
      time: "1 Jam Lalu",
    },
    {
      id: 4,
      mp: "Tokopedia",
      orderId: "TKP-112233",
      resi: "TKP-RESI-001",
      storeName: "Dewi Collection",
      items: "Kulot Cargo Black (1)",
      total: 65000,
      status: "Baru",
      time: "5 Menit Lalu",
    },
    {
      id: 5,
      mp: "Shopee",
      orderId: "240614SHP02",
      resi: "SPXID0992812",
      storeName: "Rian Mode",
      items: "Kulot Cargo Army (2)",
      total: 130000,
      status: "Baru",
      time: "2 Menit Lalu",
    },
  ]);

  // Menghitung data secara langsung tanpa useMemo untuk kesederhanaan mockup
  const filteredOrders = orders.filter(
    (o) =>
      (o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.resi.toLowerCase().includes(searchTerm.toLowerCase()) || // Cari berdasarkan resi
        o.storeName.toLowerCase().includes(searchTerm.toLowerCase())) && // Cari berdasarkan nama toko
      (filterMp === "" || o.mp === filterMp),
  );

  const stats = {
    total: orders.length,
    baru: orders.filter((o) => o.status === "Baru").length,
    siapKirim: orders.filter((o) => o.status === "Diproses").length,
    // batal: 3,
  };

  const handleProcessOrder = (id) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: "Diproses" } : order,
      ),
    );
    if (window.showToast)
      window.showToast("Orderan Berhasil Diproses!", "success");
  };

  const handleScanResi = (resi) => {
    const order = orders.find((o) => o.resi === resi);
    if (order) {
      handleProcessOrder(order.id);
      setIsScanning(false);
    } else {
      if (window.showToast)
        window.showToast("Resi tidak ditemukan di daftar orderan!", "error");
    }
  };

  // Styling Utility Class
  const btnClass = `font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center text-center px-2.5 py-1.5 text-[8px] md:text-[9px] rounded-lg shadow-sm whitespace-nowrap`;

  return (
    <div className="p-4 animate-in fade-in duration-500 h-full flex flex-col relative text-slate-900">
      {/* ================= HEADER STATS (RINGKASAN) ================= */}
      <div className="grid w-full justify-between grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Orderan
          </div>
          <div className="text-2xl font-black text-blue-600">{stats.total}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Belum Diproses
          </div>
          <div className="text-2xl font-black text-amber-500">{stats.baru}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Siap Kirim
          </div>
          <div className="text-2xl font-black text-emerald-500">
            {stats.siapKirim}
          </div>
        </div>
        {/* <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-rose-500">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Batal/Retur
          </div>
          <div className="text-2xl font-black text-rose-500">{stats.batal}</div>
        </div> */}
      </div>

      {/* ================= FILTER & ACTIONS ================= */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
          {/* KIRI: VIEW MODE */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner w-full lg:w-auto">
            <button
              onClick={() => setViewMode("card")}
              className={`flex-1 lg:flex-none px-4 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === "card" ? "bg-white shadow-sm text-blue-600" : "text-slate-400"}`}
            >
              🖼️ GRID
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 lg:flex-none px-4 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-400"}`}
            >
              📄 LIST
            </button>
          </div>

          {/* KANAN: SEARCH & MP FILTER */}
          <div className="flex gap-2 w-full lg:w-auto">
            <select
              className="flex-1 lg:w-40 bg-white border border-slate-200 py-2 px-3 rounded-lg font-bold text-[9px] uppercase outline-none focus:ring-2 focus:ring-blue-500"
              value={filterMp}
              onChange={(e) => setFilterMp(e.target.value)}
            >
              <option value="">Semua MP</option>
              <option value="Shopee">Shopee</option>
              <option value="TikTok">TikTok</option>
              <option value="Tokopedia">Tokopedia</option>
              <option value="Lazada">Lazada</option>
            </select>
            <div className="relative flex-1 lg:w-64 group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40">
                🔍
              </span>
              <input
                type="text"
                placeholder="Cari Order ID / Nama..."
                className="w-full bg-white border border-slate-200 py-2.5 pl-9 pr-4 rounded-lg font-bold text-[11px] outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsScanning(true)}
              className="bg-slate-900 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-[0.15em] shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              📷 <span className="hidden sm:inline">SCAN RESI</span>
              <span className="sm:hidden">SCAN</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= ORDERS DISPLAY ================= */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-2 py-1 rounded text-[7px] font-black uppercase tracking-tighter ${
                        order.mp === "Shopee"
                          ? "bg-orange-100 text-orange-600"
                          : order.mp === "TikTok"
                            ? "bg-slate-900 text-white"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {order.mp}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {order.time}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="text-[10px] font-black text-slate-800 tracking-tight leading-none mb-1">
                      <span className="text-slate-400">ID:</span> #
                      {order.orderId}
                      <div className="text-[9px] text-emerald-600 font-bold mt-1 uppercase tracking-tighter">
                        📦 {order.resi}
                      </div>
                    </div>
                    <div className="text-xs font-black text-blue-600 truncate">
                      {order.storeName}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">
                      Items:
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 leading-tight">
                      {order.items}
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        Total Tagihan
                      </div>
                      <div className="text-sm font-black text-slate-900">
                        Rp {order.total.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${order.status === "Baru" ? "bg-amber-100 text-amber-600 animate-pulse" : "bg-blue-100 text-blue-600"}`}
                    >
                      {order.status}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleProcessOrder(order.id)}
                    disabled={order.status === "Diproses"}
                    className={`${btnClass} ${
                      order.status === "Diproses"
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } flex-1`}
                  >
                    📦 PROSES
                  </button>
                  <button
                    className={`${btnClass} bg-white text-slate-600 border border-slate-200 flex-1 hover:bg-slate-100`}
                  >
                    🖨️ CETAK
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all group"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-[10px] uppercase text-white shadow-inner ${
                    order.mp === "Shopee"
                      ? "bg-orange-500"
                      : order.mp === "TikTok"
                        ? "bg-slate-900"
                        : "bg-blue-600"
                  }`}
                >
                  {order.mp.substring(0, 2)}
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase">
                      Order ID
                    </div>
                    <div className="text-[10px] font-black text-slate-800 leading-none">
                      <div className="text-[8px] text-emerald-600 mb-0.5">
                        {order.resi}
                      </div>
                      #{order.orderId}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Toko / Store
                    </div>
                    <div className="text-[10px] font-black text-blue-600 leading-none truncate">
                      {order.storeName}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-[8px] font-black text-slate-400 uppercase">
                      Items
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 truncate">
                      {order.items}
                    </div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase">
                      Total
                    </div>
                    <div className="text-[10px] font-black text-slate-900">
                      Rp {order.total.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest whitespace-nowrap ${order.status === "Baru" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    {order.status}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleProcessOrder(order.id)}
                      disabled={order.status === "Diproses"}
                      className={`p-1.5 rounded-lg ${
                        order.status === "Diproses"
                          ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                      }`}
                      title="Proses"
                    >
                      📦
                    </button>
                    <button
                      className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-200"
                      title="Cetak Label"
                    >
                      🖨️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL SCANNER (MOCKUP SIMULATION) ================= */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col justify-center items-center p-4">
          <h3 className="text-white font-black italic uppercase tracking-widest mb-4">
            SCAN BARCODE RESI
          </h3>
          <div className="w-full max-w-[250px] sm:max-w-sm aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 border-blue-500 bg-slate-900 flex flex-col items-center justify-center shadow-2xl p-6 text-center">
            <div className="text-4xl mb-4 animate-bounce">📷</div>
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-4 leading-tight">
              Arahkan kamera ke resi atau masukkan nomor resi di bawah ini untuk
              simulasi proses
            </p>
            <input
              type="text"
              placeholder="Input Resi (Simulasi)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-3 text-white text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleScanResi(e.target.value);
              }}
            />
          </div>
          <button
            onClick={() => setIsScanning(false)}
            className="mt-6 bg-rose-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
          >
            Tutup Kamera
          </button>
        </div>
      )}

      {/* ================= FOOTER ACTIONS ================= */}
      <div className="mt-4 p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="text-[10px] font-bold text-slate-400 italic">
          Menampilkan{" "}
          <span className="text-blue-600 font-black">
            {filteredOrders.length}
          </span>{" "}
          orderan masuk terbaru dari integrasi API Marketplace.
        </div>
        <button className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2">
          🔄 TARIK DATA MARKETPLACE
        </button>
      </div>
    </div>
  );
};

export default Orders;
