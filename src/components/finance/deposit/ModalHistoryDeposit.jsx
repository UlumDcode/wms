import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";
import DateRangeFilter from "../../DateRangeFilter";

const RiwayatDepositModal = ({ isOpen, onClose, selectedReseller }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (isOpen && selectedReseller) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [isOpen, selectedReseller]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `finance/deposit_reseller.php?action=history&id=${selectedReseller.id}`
      );
      const data = res.data;
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Gagal load history", e);
      window.showToast("Gagal memuat history", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !selectedReseller) return null;

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getJenisStyle = (jenis) => {
    const j = (jenis || "").toLowerCase();
    if (j.includes("masuk") || j.includes("topup"))
      return "bg-emerald-100 text-emerald-600";
    if (j.includes("tarik")) return "bg-rose-100 text-rose-600";
    return "bg-amber-100 text-amber-600";
  };

  const filteredHistory = history.filter((h) => {
    let matchDate = true;
    if (h.tanggal) {
      const hDate = h.tanggal.split(" ")[0];
      if (startDate && hDate < startDate) matchDate = false;
      if (endDate && hDate > endDate) matchDate = false;
    }
    return matchDate;
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 text-slate-900">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black italic uppercase text-base text-slate-800 tracking-widest">
              Riwayat <span className="text-blue-600">Deposit</span>
            </h3>
            <p className="text-xs font-bold text-blue-600 mt-1 uppercase">
              {selectedReseller.nama_channel}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DateRangeFilter
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors font-bold active:scale-95"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1 p-4 pt-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                Memuat Data...
              </span>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Tanggal
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 text-center">
                    Jenis Mutasi
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 text-right">
                    Nominal
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h) => (
                  <tr
                    key={h.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-l border-slate-100 rounded-l-xl text-[7px] md:text-[9px] font-bold text-slate-500 whitespace-nowrap">
                      {formatDate(h.tanggal)}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center w-[60px] md:w-auto">
                      <span
                        className={`px-1.5 py-1 md:px-2.5 md:py-1 rounded-md text-[6px] md:text-[9px] font-black uppercase tracking-widest border whitespace-nowrap inline-block ${getJenisStyle(h.jenis || h.jenis_mutasi)}`}
                      >
                        {h.jenis || h.jenis_mutasi}
                      </span>
                    </td>
                    <td
                      className={`p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-right max-w-[80px] md:max-w-none text-[9px] md:text-xs font-black whitespace-nowrap truncate ${(h.jenis || h.jenis_mutasi)?.toLowerCase().includes("masuk") ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {(h.jenis || h.jenis_mutasi)
                        ?.toLowerCase()
                        .includes("masuk")
                        ? "+"
                        : "-"}{" "}
                      {formatRupiah(h.nominal)}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-r border-slate-100 rounded-r-xl max-w-[150px] md:max-w-xs">
                      <div className="text-[8px] md:text-[10px] font-black text-slate-800 uppercase italic tracking-tight truncate">
                        {h.keterangan || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest"
                    >
                      Belum ada riwayat deposit
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiwayatDepositModal;
