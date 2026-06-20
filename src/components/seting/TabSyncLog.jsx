import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../utils/axios";
import { TOKEN_KEY, decodeData } from "../../utils/storage";
const SYNC_HOST = import.meta.env.VITE_SYNC_URL || "https://sync.zulkan.id";

const TabSyncLog = ({ onUpdateBadge }) => {
  const [syncLogs, setSyncLogs] = useState([]);
  const [logFilter, setLogFilter] = useState("all");
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  useEffect(() => {
    fetchSyncLogs();
  }, []);

  // Update badge di tab utama saat jumlah error berubah
  useEffect(() => {
    const failedCount = syncLogs.filter(
      (log) => log.status === "failed",
    ).length;
    if (onUpdateBadge) {
      onUpdateBadge(failedCount);
    }
  }, [syncLogs, onUpdateBadge]);

  const getAuthToken = () => {
    const encodedToken =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const legacyToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return decodeData(encodedToken) || legacyToken || null;
  };

  const authHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSyncLogs = async (isManual = false) => {
    if (isManual) setIsLogsLoading(true);
    try {
      const res = await fetch(`${SYNC_HOST}/api/queue/logs`, {
        method: "GET",
        mode: "cors",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSyncLogs(
        Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [],
      );
      if (isManual) window.showToast("Log sinkronisasi diperbarui!", "success");
    } catch (e) {
      console.error("Gagal load sync logs", e);
      if (isManual) window.showToast("Gagal memuat log sync", "error");
    } finally {
      if (isManual) setIsLogsLoading(false);
    }
  };

  const handleClearSyncLogs = async () => {
    const isConfirmed = await window.showConfirm(
      "Hapus semua log antrean yang sukses?",
    );
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${SYNC_HOST}/api/queue/clear`, {
        method: "POST",
        mode: "cors",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "success") {
        window.showToast(data.message, "success");
        fetchSyncLogs();
      }
    } catch (e) {
      console.error("Gagal membersihkan log");
    }
  };

  const handleClearFailedLogs = async () => {
    const isConfirmed = await window.showConfirm(
      "Hapus semua log antrean yang gagal?",
    );
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${SYNC_HOST}/api/queue/clear_failed`, {
        method: "POST",
        mode: "cors",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "success") {
        window.showToast(data.message, "success");
        fetchSyncLogs();
      }
    } catch (e) {
      console.error("Gagal membersihkan log gagal");
    }
  };

  const handleDeleteSyncLog = async (id) => {
    try {
      const res = await fetch(`${SYNC_HOST}/api/queue/${id}`, {
        method: "DELETE",
        mode: "cors",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "success") {
        window.showToast("Log dihapus", "success");
        fetchSyncLogs();
      }
    } catch (e) {
      console.error("Gagal hapus log");
    }
  };

  const handleRetrySync = async (id) => {
    try {
      const res = await fetch(`${SYNC_HOST}/api/queue/retry/${id}`, {
        method: "POST",
        mode: "cors",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "success") {
        window.showToast("Tugas dikembalikan ke antrean", "success");
        fetchSyncLogs();
      }
    } catch (e) {
      console.error("Gagal retry");
    }
  };

  const filteredLogs = useMemo(() => {
    if (logFilter === "all") return syncLogs;
    return syncLogs.filter((log) => log.status === logFilter);
  }, [syncLogs, logFilter]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-wrap justify-between items-center border-b dark:border-slate-800 pb-2 gap-2">
        <h3 className="font-black italic uppercase text-sm text-slate-800 dark:text-slate-100 tracking-tighter">
          Queue <span className="text-purple-600">Synchronization Log</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer shadow-sm text-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="processing">🔄 Processing</option>
            <option value="success">✅ Success</option>
            <option value="failed">❌ Failed</option>
          </select>

          <button
            onClick={handleClearSyncLogs}
            className="bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
          >
            🧹 Bersihkan Log
          </button>
          <button
            onClick={handleClearFailedLogs}
            className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
          >
            🗑️ Bersihkan Failed
          </button>
          <button
            onClick={() => fetchSyncLogs(true)}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border dark:border-slate-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLogsLoading && (
        <div className="p-4 text-center text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          Memuat Log...
        </div>
      )}

      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
            <tr className="text-slate-400 dark:text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
              <th className="px-3 py-2">Waktu</th>
              <th className="px-3 py-2">Tugas</th>
              <th className="px-3 py-2">Aksi / Sheet</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2">Error Log</th>
              <th className="px-3 py-2 text-center">Opsi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
              >
                <td className="px-3 py-2 rounded-l-xl border-y border-l border-slate-100 dark:border-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                  {new Date(log.created_at).toLocaleString("id-ID")}
                </td>
                <td className="px-3 py-2 border-y border-slate-100 dark:border-slate-800">
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      log.task_type === "fonnte_wa"
                        ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {(log.task_type || "google_sheet").replace("_", " ")}
                  </span>
                </td>
                <td className="px-3 py-2 border-y border-slate-100 dark:border-slate-800">
                  <div className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase">
                    {log.action || "-"}
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    {log.sheet_name || "-"}
                  </div>
                </td>
                <td className="px-3 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      log.status === "success"
                        ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                        : log.status === "pending"
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                          : log.status === "processing"
                            ? "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 animate-pulse"
                            : "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {log.status}
                    {log.retry_count > 0 && ` (${log.retry_count}x)`}
                  </span>
                </td>
                <td className="px-3 py-2 border-y border-slate-100 dark:border-slate-800 max-w-xs">
                  <p
                    className={`text-[8px] font-medium italic line-clamp-2 ${
                      log.error_log
                        ? "text-rose-500 dark:text-rose-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {log.error_log || "-"}
                  </p>
                </td>
                <td className="px-3 py-2 rounded-r-xl border-y border-r border-slate-100 dark:border-slate-800 text-center">
                  {log.status === "failed" ? (
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleRetrySync(log.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase transition-all"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => handleDeleteSyncLog(log.id)}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase transition-all"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteSyncLog(log.id)}
                      className="opacity-0 group-hover:opacity-100 bg-slate-200 hover:bg-slate-300 text-slate-500 px-2 py-1 rounded text-[8px] font-black uppercase transition-all"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-10 text-center text-slate-300 dark:text-slate-600 font-bold uppercase italic text-[10px]"
                >
                  {syncLogs.length === 0
                    ? "Belum ada log antrean"
                    : `Tidak ada data dengan status: ${logFilter.toUpperCase()}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabSyncLog;
