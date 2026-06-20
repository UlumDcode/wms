import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import DateRangeFilter from "../../components/DateRangeFilter";
import Pagination from "../../components/Pagination";

const KartuMutasiBank = () => {
  const [rekeningList, setRekeningList] = useState([]);
  const [selectedRekeningId, setSelectedRekeningId] = useState("");
  const [mutasiData, setMutasiData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Fetch Daftar Rekening untuk Dropdown
  useEffect(() => {
    const fetchRekenings = async () => {
      try {
        const res = await axiosInstance.get("finance/rekening.php?action=read");
        const data = res.data;
        setRekeningList(Array.isArray(data) ? data : []); // Mengambil array dari properti 'data'
      } catch (e) {
        console.error("Gagal muat daftar rekening:", e);
      }
    };
    fetchRekenings();
  }, []);

  // Fetch Detail Mutasi jika ada rekening yang dipilih
  useEffect(() => {
    if (!selectedRekeningId) {
      setMutasiData(null);
      return;
    }

    const fetchMutasiDetail = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          action: "mutasi",
          id: selectedRekeningId,
          page,
          limit,
          start_date: startDate,
          end_date: endDate
        });
        const res = await axiosInstance.get(
          `finance/rekening.php?${params.toString()}`
        );
        const data = res.data;
        if (data.status === "success") {
          setMutasiData(data);
        } else {
          window.showToast(data.message || "Gagal muat data mutasi", "error");
          setMutasiData(null);
        }
      } catch (e) {
        console.error("Error muat mutasi:", e);
        window.showToast("Terjadi kesalahan sistem", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMutasiDetail();
  }, [selectedRekeningId, page, startDate, endDate]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedRekeningId, startDate, endDate]);

  const formatRp = (num) => {
    if (!num && num !== 0) return "";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900 bg-slate-50">
      {/* HEADER & FILTER AREA */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 md:mb-6 gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto items-start sm:items-center">
          <DateRangeFilter
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </div>
        <div className="w-full xl:w-80 shrink-0">
          <select
            className="w-full bg-white border border-slate-200 py-2.5 px-3 rounded-xl font-bold text-sm shadow-sm outline-none focus:border-emerald-500 transition-all cursor-pointer text-slate-800"
            value={selectedRekeningId}
            onChange={(e) => setSelectedRekeningId(e.target.value)}
          >
            <option value="">-- Pilih Rekening --</option>
            {(Array.isArray(rekeningList) ? rekeningList : [])
              .filter((r) => !["Piutang", "Hutang"].includes(r.tipe_rekening))
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_rekening} - {r.tipe_rekening}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-[400px]">
        {!selectedRekeningId ? (
          <div className="flex-1 flex justify-center items-center p-6 text-center bg-slate-50/50">
            <div className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest italic">
              Silakan pilih rekening terlebih dahulu
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex justify-center items-center text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">
            Memuat Mutasi...
          </div>
        ) : mutasiData ? (
          <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
            <table className="w-full min-w-[800px] text-left border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                  <th className="py-2 px-2 md:p-3">Tanggal</th>
                  <th className="py-2 px-2 md:p-3">Keterangan</th>
                  <th className="py-2 px-2 md:p-3 text-right">Masuk (Debit)</th>
                  <th className="py-2 px-2 md:p-3 text-right">Keluar (Kredit)</th>
                  <th className="py-2 px-2 md:p-3 text-right">Saldo Berjalan</th>
                </tr>
              </thead>
              <tbody>
                {mutasiData.data && mutasiData.data.length > 0 ? (
                  mutasiData.data.map((m) => {
                    const isMasuk = m.jenis_mutasi === "Masuk";
                    const nominal = parseFloat(m.nominal || 0);
                    const currentBalance = parseFloat(m.saldo_berjalan || 0);

                    return (
                      <tr key={m.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 font-bold text-[8px] md:text-[10px] text-slate-500 whitespace-nowrap">
                          {m.tanggal}
                        </td>
                        <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-[8px] md:text-[10px] max-w-[200px] truncate">
                          <div className="font-black text-slate-800 uppercase italic tracking-tight truncate">
                            {m.keterangan}
                          </div>
                          {m.nama_pihak && (
                            <div className="text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">
                              {m.nama_pihak}
                            </div>
                          )}
                        </td>
                        <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-right w-[120px]">
                          {isMasuk && nominal > 0 && (
                            <span className="text-[9px] md:text-xs font-black text-emerald-600 truncate">
                              Rp {formatRp(nominal)}
                            </span>
                          )}
                        </td>
                        <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-right w-[120px]">
                          {!isMasuk && nominal > 0 && (
                            <span className="text-[9px] md:text-xs font-black text-rose-600 truncate">
                              Rp {formatRp(nominal)}
                            </span>
                          )}
                        </td>
                        <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-right w-[130px]">
                          <div className="text-[10px] md:text-xs font-black text-slate-800 truncate">
                            Rp {formatRp(currentBalance)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                        Belum ada mutasi
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Pagination Controls */}
        {mutasiData && (
          <Pagination
            totalData={mutasiData.total_data || 0}
            limit={limit}
            onLimitChange={setLimit}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default KartuMutasiBank;
