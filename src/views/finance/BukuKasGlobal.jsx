import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import DateRangeFilter from "../../components/DateRangeFilter";
import Pagination from "../../components/Pagination";

const BukuKasGlobal = () => {
  // State management
  const [dataKas, setDataKas] = useState([]);
  const getLocalISODate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalISODate(d);
  });
  const [endDate, setEndDate] = useState(() => getLocalISODate(new Date()));
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalData, setTotalData] = useState(0);
  const [summary, setSummary] = useState({ total_masuk: 0, total_keluar: 0 });

  // Formatting utility
  const formatIDR = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Data Fetching
  const fetchDataKas = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `finance/arus_kas.php?action=read_global&start_date=${startDate}&end_date=${endDate}&page=${currentPage}&limit=${limit}`
      );

      const json = res.data;
      if (json && json.status === "success") {
        setDataKas(json.data || []);
        setTotalData(json.total_data || 0);
        setSummary(json.summary || { total_masuk: 0, total_keluar: 0 });
      } else {
        window.showToast(
          json?.message || "Gagal mengambil data arus kas",
          "error",
        );
      }
    } catch (error) {
      window.showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataKas();
  }, [startDate, endDate, currentPage, limit]);

  // Calculations
  const totalMasuk = summary.total_masuk;
  const totalKeluar = summary.total_keluar;
  const netFlow = totalMasuk - totalKeluar;

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900">
      {/* HEADER ROW 1: TITLE & SUMMARY CARDS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 shrink-0 w-full">
        {/* <div>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            Buku Kas <span className="text-blue-600">Global</span>
          </h2>
          <p className="font-bold text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-1.5 md:mt-2 text-blue-500">
            Monitoring Arus Kas Lintas Rekening
          </p>
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto shrink-0">
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 font-black text-xs">
              IN
            </div>
            <div className="overflow-hidden">
              <p className="text-[8px] font-black text-emerald-600/70 uppercase tracking-widest">
                Total Masuk
              </p>
              <h3 className="text-sm md:text-base font-black italic text-emerald-700 leading-none truncate">
                {formatIDR(totalMasuk)}
              </h3>
            </div>
          </div>
          <div className="bg-rose-50 border border-rose-100 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="bg-rose-100 p-2 rounded-xl text-rose-600 font-black text-xs">
              OUT
            </div>
            <div className="overflow-hidden">
              <p className="text-[8px] font-black text-rose-600/70 uppercase tracking-widest">
                Total Keluar
              </p>
              <h3 className="text-sm md:text-base font-black italic text-rose-700 leading-none truncate">
                {formatIDR(totalKeluar)}
              </h3>
            </div>
          </div>
          <div className="bg-slate-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md">
            <div className="bg-slate-800 p-2 rounded-xl text-slate-400 font-black text-xs">
              NET
            </div>
            <div className="overflow-hidden">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Net Flow
              </p>
              <h3
                className={`text-sm md:text-base font-black italic leading-none truncate ${netFlow >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {formatIDR(netFlow)}
              </h3>
            </div>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <DateRangeFilter
            label="Filter Periode Mutasi"
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </div>
      </div>

      {/* LIST TABLE DATA ARUS KAS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-[400px] overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
          <table className="w-full min-w-[700px] text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-3">Waktu & Pihak</th>
                <th className="py-2 px-3">Rekening Akun</th>
                <th className="py-2 px-3">Keterangan Mutasi</th>
                <th className="py-2 px-3 text-right">Masuk (Debit)</th>
                <th className="py-2 px-3 text-right">Keluar (Kredit)</th>
              </tr>
            </thead>
            <tbody>
              {dataKas.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100">
                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                      {formatDateTime(item.tanggal)}
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Pihak: {item.nama_pihak || "-"}
                    </div>
                  </td>
                  <td className="p-3 bg-slate-50 border-y border-slate-100">
                    <div className="text-[9px] font-black text-blue-600 uppercase italic tracking-tight">
                      {item.nama_rekening || "Unknown Account"}
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                      {item.tipe_rekening} | {item.nomor_rekening || "-"}
                    </div>
                  </td>
                  <td className="p-3 bg-slate-50 border-y border-slate-100 max-w-xs">
                    <div className="text-[9px] font-black text-slate-700 uppercase tracking-tight leading-tight">
                      {item.keterangan}
                    </div>
                  </td>
                  <td className="p-3 bg-slate-50 border-y border-slate-100 text-right">
                    <div className="text-[10px] font-black text-emerald-600 whitespace-nowrap">
                      {item.jenis_mutasi === "Masuk"
                        ? formatIDR(item.nominal)
                        : "-"}
                    </div>
                  </td>
                  <td className="p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-right">
                    <div className="text-[10px] font-black text-rose-600 whitespace-nowrap">
                      {item.jenis_mutasi === "Keluar"
                        ? formatIDR(item.nominal)
                        : "-"}
                    </div>
                  </td>
                </tr>
              ))}
              {dataKas.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="text-slate-300 font-bold text-[10px] uppercase italic tracking-widest">
                      {loading
                        ? "Memuat Data..."
                        : "Tidak ada mutasi dalam periode ini"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION COMPONENT */}
        <Pagination
          totalData={totalData}
          limit={limit}
          onLimitChange={setLimit}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default BukuKasGlobal;
