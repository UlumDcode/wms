import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
const SYNC_HOST = import.meta.env.VITE_SYNC_URL || "https://sync.zulkan.id";

const Dashboard = ({ setActiveMenu }) => {
  const [data, setData] = useState({
    stats: [],
    activities: [],
    inventory: [],
  });
  const [syncHealth, setSyncHealth] = useState({
    is_alive: false,
    last_heartbeat: null,
    queue_stats: { pending: 0, failed: 0, processing: 0 },
  });
  const [loading, setLoading] = useState(true);

  // --- 1. AMBIL DATA DARI BACKEND ---
  const fetchDashboardData = async () => {
    try {
      const res = await axiosInstance.get("dashboard.php?action=get_stats");
      const result = res.data;

      setData({
        stats: result.stats || [],
        activities: result.activities || [],
        inventory: result.inventory || [],
      });
    } catch (e) {
      console.error("Gagal sinkronisasi dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncHealth = async () => {
    try {
      const res = await fetch(`${SYNC_HOST}/api/health`, {
        method: "GET",
        mode: "cors",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result && typeof result === "object" && result.queue_stats) {
        setSyncHealth(result);
      }
    } catch (e) {
      console.warn("Gagal memuat status Sync Service dari", SYNC_HOST, e);
    }
  };

  const awakenSyncService = async () => {
    try {
      await fetch(SYNC_HOST, {
        method: "GET",
        mode: "cors",
      });
    } catch (e) {
      // Abaikan error karena tujuannya hanya wake-up ping
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSyncHealth();

    // Real-time updates via Server-Sent Events (SSE)
    let es;
    try {
      if (typeof window !== "undefined" && window.EventSource) {
        es = new EventSource(`${SYNC_HOST}/api/stream`);
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && data.queue_stats) setSyncHealth(data);
          } catch (err) {
            // ignore parse errors
          }
        };
        es.onerror = () => {
          // When SSE fails, keep the fallback polling
          if (es) es.close();
        };
      }
    } catch (err) { }

    // Kurangi polling status sync service menjadi setiap 10 menit
    // agar tidak mengurangi beban MySQL di backend Hostinger
    const healthInterval = setInterval(() => {
      if (!document.hidden) {
        fetchSyncHealth();
      }
    }, 600000);

    return () => {
      clearInterval(healthInterval);
      if (es) es.close();
    };
  }, []);

  // --- 2. LOADING STATE ---
  if (loading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-black italic uppercase tracking-widest animate-pulse text-[10px]">
            Sinkronisasi System...
          </p>
        </div>
      </div>
    );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* SYNC STATUS BAR */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-lg">
        <button
          onClick={async () => {
            if (!syncHealth.is_alive) {
              try {
                window.showToast("Mencoba menyalakan Sync Service...", "info");
                await fetch(SYNC_HOST, {
                  method: "GET",
                  mode: "cors",
                });
                window.showToast(
                  "Sinyal manual telah dikirim ke Sync Service!",
                  "success",
                );
                setTimeout(fetchSyncHealth, 2000); // Cek status baru setelah 2 detik
              } catch (e) {
                window.showToast(
                  "Gagal mengirim sinyal ke Sync Service",
                  "error",
                );
              }
            }
          }}
          className={`flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg transition-all ${!syncHealth.is_alive ? "hover:bg-slate-700 cursor-pointer active:scale-95" : "cursor-default"}`}
          title={
            !syncHealth.is_alive
              ? "Klik untuk mencoba menyalakan Sync Service secara manual"
              : "Sync Service berjalan normal"
          }
        >
          <div
            className={`w-2 h-2 rounded-full ${syncHealth.is_alive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" : "bg-rose-500"}`}
          ></div>
          <span className="text-[10px] font-black uppercase text-slate-300">
            Sync Service:{" "}
            {syncHealth.is_alive ? "Active" : "Offline (Click to Start)"}
          </span>
        </button>

        <div className="flex items-center gap-4 ml-auto px-4">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
              Pending
            </span>
            <span
              className={`text-xs font-black ${(syncHealth?.queue_stats?.pending || 0) > 0 ? "text-blue-400" : "text-slate-600"}`}
            >
              {syncHealth?.queue_stats?.pending || 0}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
              Processing
            </span>
            <span
              className={`text-xs font-black ${(syncHealth?.queue_stats?.processing || 0) > 0 ? "text-emerald-400 animate-pulse" : "text-slate-600"}`}
            >
              {syncHealth?.queue_stats?.processing || 0}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
              Failed
            </span>
            <span
              className={`text-xs font-black ${(syncHealth?.queue_stats?.failed || 0) > 0 ? "text-rose-500" : "text-slate-600"}`}
            >
              {syncHealth?.queue_stats?.failed || 0}
            </span>
          </div>

          {(syncHealth?.queue_stats?.failed || 0) > 0 && (
            <button
              onClick={() => setActiveMenu("settings")}
              className="ml-2 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
            >
              Fix Errors
            </button>
          )}
        </div>
      </div>

      {/* 3. STATS GRID (4 KARTU UTAMA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {data.stats.map((item, i) => (
          <div
            key={i}
            onClick={() =>
              item.link && setActiveMenu && setActiveMenu(item.link)
            }
            className={`bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border flex flex-col relative overflow-hidden group transition-all duration-300 ${item.link ? "cursor-pointer hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 border-slate-50 dark:border-slate-800" : "border-slate-50 dark:border-slate-800"}`}
          >
            <div
              className={`absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-5 ${item.bg}`}
            ></div>

            <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
              <div
                className={`${item.bg} w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-inner group-hover:scale-110 transition-transform`}
              >
                {item.icon}
              </div>
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                {item.unit}
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                {item.label}
              </p>
              <h3
                className={`text-xl md:text-2xl font-black ${item.color} tracking-tighter leading-none`}
              >
                {item.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* 4. BOTTOM SECTION: AKTIVITAS & QUICK ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
        {/* LEFT COLUMN: STOK & AKTIVITAS */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
          {/* PERINGATAN STOK MENIPIS */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-rose-50 dark:border-rose-900/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <div className="flex justify-between items-center mb-5 md:mb-6">
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase italic">
                Stok <span className="text-rose-600">Menipis</span>
              </h3>
              <button
                onClick={() => setActiveMenu && setActiveMenu("inventory")}
                className="text-[9px] font-black text-rose-600 bg-rose-50 px-4 py-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest"
              >
                Lihat Stok →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.inventory.length > 0 ? (
                data.inventory.map((inv, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm truncate">
                        {inv.nama_barang}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5 truncate">
                        {inv.nama_kategori || "Tanpa Kategori"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`font-black text-sm md:text-base ${parseInt(inv.stok) === 0 ? "text-rose-600" : "text-orange-500"}`}
                      >
                        {inv.stok}
                      </p>
                      <p
                        className="text-[8px] text-slate-400 uppercase tracking-widest font-bold whitespace-nowrap"
                        title="Batas Stok Menipis"
                      >
                        / {inv.batas_stok_rendah || 20} Pcs
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-6 text-center italic text-slate-300 font-black uppercase text-xs tracking-widest">
                  Semua stok aman
                </div>
              )}
            </div>
          </div>

          {/* TABEL AKTIVITAS TERAKHIR */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-800">
            <div className="flex justify-between items-center mb-5 md:mb-6">
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase italic">
                Aktivitas <span className="text-blue-600">Terakhir</span>
              </h3>
              <button
                onClick={() => setActiveMenu && setActiveMenu("monitoring")}
                className="text-[9px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"
              >
                Semua Data →
              </button>
            </div>

            <div className="space-y-3">
              {data.activities.length > 0 ? (
                data.activities.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 md:p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
                  >
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                      <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[8px] md:text-[9px] font-black italic text-slate-400 dark:text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                        {act.time}
                      </div>
                      <div className="overflow-hidden pr-2">
                        <p className="font-black text-slate-800 dark:text-slate-200 text-xs md:text-sm uppercase italic leading-none truncate">
                          {act.desc}
                        </p>
                        <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase mt-1 md:mt-1.5 tracking-tight truncate">
                          Inv: {act.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-blue-600 text-sm md:text-base leading-none">
                        {act.qty} Pcs
                      </p>
                      <p
                        className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-1 md:mt-1.5 italic ${act.status === "Sukses" ? "text-emerald-500" : "text-amber-500"}`}
                      >
                        {act.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center italic text-slate-300 font-black uppercase text-xs tracking-widest">
                  Belum ada transaksi hari ini
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. QUICK ACTION (KARTU HITAM) */}
        <div className="bg-[#111827] p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl text-white relative overflow-hidden group h-fit sticky top-4">
          <div className="relative z-10 flex flex-col">
            <h3 className="text-blue-400 font-black uppercase tracking-[0.2em] text-[9px] mb-4 md:mb-6">
              Quick Action
            </h3>
            <p className="text-2xl md:text-3xl font-black leading-[1.1] mb-4 md:mb-5 text-white italic uppercase tracking-tighter">
              Siap Kirim <br /> Barang, Bro?
            </p>
            <p className="text-slate-400 text-[10px] md:text-xs font-bold leading-relaxed uppercase tracking-tight opacity-70 mb-6 md:mb-8">
              Gunakan scanner untuk validasi resi dan update stok otomatis ke
              Database.
            </p>

            {/* ACTION: PINDAH KE MENU POS */}
            <button
              onClick={() => setActiveMenu("pos")}
              className="w-full bg-blue-600 text-white py-3 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/50 hover:bg-blue-500 transition-all active:scale-95"
            >
              🚀 Buka Scanner Sekarang
            </button>
          </div>
          <div className="absolute -bottom-6 -right-6 text-[8rem] md:text-[10rem] opacity-[0.05] font-black italic pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            📦
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
