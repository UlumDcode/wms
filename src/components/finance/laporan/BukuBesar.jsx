import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../utils/axios";
import DateRangeFilter from "../../DateRangeFilter";

const BukuBesar = () => {
  // ✅ BENAR: Semua state harus di DALAM fungsi BukuBesar
  const [storeConfig, setStoreConfig] = useState(null);

  // State Management
  const [coaList, setCoaList] = useState([]);
  const [selectedCoa, setSelectedCoa] = useState("");

  const getLocalISODate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getLocalISODate(d);
  });

  const [endDate, setEndDate] = useState(() => getLocalISODate(new Date()));
  const [laporanData, setLaporanData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Formatting Utility
  const formatIDR = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const formatTanggal = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // 1. Fetch COA List on Mount
  useEffect(() => {
    const fetchCoaList = async () => {
      try {
        const res = await axiosInstance.get("finance/coa.php?action=read");
        const json = res.data;
        if (json && json.status === "success") {
          setCoaList(json.data || []);
          if (json.data.length > 0) {
            setSelectedCoa(json.data[0].id);
          }
        }
      } catch (error) {
        console.error("Gagal memuat daftar COA:", error);
      }
    };

    fetchCoaList();
  }, []);

  // 2. Fetch Buku Besar Data
  const fetchBukuBesar = useCallback(async () => {
    if (!selectedCoa) return;

    setLoading(true);
    setLaporanData(null);

    try {
      const res = await axiosInstance.get(
        `finance/laporan.php?action=buku_besar&coa_id=${selectedCoa}&start_date=${startDate}&end_date=${endDate}`
      );
      const json = res.data;
      if (json && json.status === "success") {
        setLaporanData(json);
      } else {
        window.showToast(
          json?.message || "Gagal mengambil data buku besar",
          "error",
        );
      }
    } catch (error) {
      window.showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedCoa, startDate, endDate]);

  // 3. Trigger fetch ketika akun dipilih
  useEffect(() => {
    if (selectedCoa) {
      fetchBukuBesar();
    }
  }, [selectedCoa, fetchBukuBesar]);

  let currentBalance = laporanData
    ? parseFloat(laporanData.saldo_awal || 0)
    : 0;

  return (
    <div className="h-full flex flex-col min-h-0 text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-3 shrink-0 w-full">
        <div className="w-full md:w-auto flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
            Pilih Akun (COA)
          </label>
          <select
            className="w-full bg-white border border-slate-200 py-2.5 px-3 rounded-xl font-bold text-sm shadow-sm focus:border-purple-500 outline-none transition-all cursor-pointer"
            value={selectedCoa}
            onChange={(e) => setSelectedCoa(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Pilih Akun --</option>
            {coaList.map((coa) => (
              <option key={coa.id} value={coa.id}>
                {coa.kode_akun} - {coa.nama_akun} ({coa.tipe_akun})
              </option>
            ))}
          </select>
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
        <button
          onClick={fetchBukuBesar}
          disabled={loading || !selectedCoa}
          className="w-full md:w-auto bg-slate-900 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
        >
          {loading ? "MEMPROSES..." : "TAMPILKAN"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1 min-h-0 p-2 md:p-4 pt-0">
          {laporanData && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Akun: {laporanData.akun} ({laporanData.kategori})
              </p>
            </div>
          )}

          <table className="w-full min-w-[800px] text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-3">Tanggal</th>
                <th className="py-2 px-3">No. Ref</th>
                <th className="py-2 px-3">Keterangan</th>
                <th className="py-2 px-3 text-right">Debit</th>
                <th className="py-2 px-3 text-right">Kredit</th>
                <th className="py-2 px-3 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {laporanData?.data.length > 0 ? (
                laporanData.data.map((item, index) => {
                  const debit = parseFloat(item.debit || 0);
                  const kredit = parseFloat(item.kredit || 0);

                  if (
                    laporanData.kategori === "Asset" ||
                    laporanData.kategori === "Expense" ||
                    laporanData.kategori === "Harta" ||
                    laporanData.kategori === "Beban"
                  ) {
                    currentBalance += debit - kredit;
                  } else {
                    currentBalance += kredit - debit;
                  }

                  return (
                    <tr
                      key={index}
                      className="bg-slate-50 hover:bg-slate-100 transition-colors group"
                    >
                      <td className="p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 text-[10px] font-bold text-slate-800">
                        {formatTanggal(item.tanggal)}
                      </td>
                      <td className="p-3 bg-slate-50 border-y border-slate-100 text-[10px] font-bold text-blue-600 uppercase">
                        {item.no_referensi}
                      </td>
                      <td className="p-3 bg-slate-50 border-y border-slate-100 max-w-xs text-[10px] font-medium text-slate-700">
                        {item.keterangan}
                      </td>
                      <td className="p-3 bg-slate-50 border-y border-slate-100 text-right text-[10px] font-black text-emerald-600">
                        {debit > 0 ? formatIDR(debit) : "-"}
                      </td>
                      <td className="p-3 bg-slate-50 border-y border-slate-100 text-right text-[10px] font-black text-rose-600">
                        {kredit > 0 ? formatIDR(kredit) : "-"}
                      </td>
                      <td className="p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-right text-[10px] font-black text-slate-800">
                        {formatIDR(currentBalance)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="text-slate-400 font-bold text-[10px] uppercase italic tracking-widest">
                      {loading
                        ? "Memuat Data..."
                        : laporanData
                          ? "Tidak ada mutasi untuk akun ini dalam periode yang dipilih."
                          : "Pilih akun dan periode untuk menampilkan buku besar."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BukuBesar;
