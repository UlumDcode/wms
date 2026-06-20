import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";

const TabRekapitulasiTagihan = ({
  activeTab,
  channels,
  suppliers,
  formatRupiah,
}) => {
  if (activeTab !== "rekap") return null;

  const [jenisTagihan, setJenisTagihan] = useState("Piutang");
  const [pihakId, setPihakId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [loading, setLoading] = useState(false);
  const [rekapData, setRekapData] = useState(null);

  // Reset pihakId when jenisTagihan changes
  useEffect(() => {
    setPihakId("");
    setRekapData(null);
  }, [jenisTagihan]);

  const handleFetchRekap = async () => {
    if (!pihakId) {
      return window.showToast("Pilih pihak/vendor terlebih dahulu!", "warning");
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `finance/get_rekap_tagihan.php?jenis_tagihan=${jenisTagihan}&pihak_id=${pihakId}&start_date=${startDate}&end_date=${endDate}`
      );
      if (res.data.status === "success") {
        setRekapData(res.data.data);
      } else {
        window.showToast(res.data.message || "Gagal mengambil rekap", "error");
      }
    } catch (e) {
      window.showToast("Terjadi kesalahan koneksi server", "error");
    } finally {
      setLoading(false);
    }
  };

  const currentPihakList = jenisTagihan === "Piutang" ? channels : suppliers;

  return (
    <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* FILTER PANEL */}
      <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b dark:border-slate-800 pb-3 gap-3">
          <h3 className="font-black italic uppercase text-[11px] text-blue-600 dark:text-blue-400 tracking-widest">
            📊 Filter Rekapitulasi Tagihan
          </h3>

          <div className="flex items-center gap-2">
            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">
              Periode:
            </label>
            <input
              type="date"
              className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg font-bold text-[10px] text-slate-800 dark:text-slate-200 focus:border-blue-500 outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-slate-400 text-[10px] font-bold">-</span>
            <input
              type="date"
              className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg font-bold text-[10px] text-slate-800 dark:text-slate-200 focus:border-blue-500 outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 space-y-1 min-w-[200px]">
            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">
              Jenis Tagihan
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-bold text-[11px] text-slate-800 dark:text-slate-200 focus:border-blue-500 outline-none"
              value={jenisTagihan}
              onChange={(e) => setJenisTagihan(e.target.value)}
            >
              <option value="Piutang">Piutang (Pelanggan / Channel)</option>
              <option value="Utang">Utang (Supplier / Vendor)</option>
            </select>
          </div>

          <div className="flex-1 space-y-1 min-w-[200px]">
            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">
              Pihak / Target
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-bold text-[11px] text-slate-800 dark:text-slate-200 focus:border-blue-500 outline-none"
              value={pihakId}
              onChange={(e) => setPihakId(e.target.value)}
            >
              <option value="">-- Pilih Pihak --</option>
              {currentPihakList.filter(item => jenisTagihan !== "Piutang" || item.tipe !== "Marketplace").map((item) => (
                <option key={item.id} value={item.id}>
                  {jenisTagihan === "Piutang" ? item.nama_channel : (item.customer || "Supplier " + item.id)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFetchRekap}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "MEMUAT..." : "Tampilkan Rekap"}
          </button>
        </div>
      </div>

      {/* REKAP RESULTS */}
      {rekapData && (
        <div className="space-y-6">
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl shadow-lg text-white">
              <p className="text-[8px] font-black uppercase opacity-60 tracking-wider">
                Pihak / Target
              </p>
              <h4 className="text-xl font-black uppercase mt-1">
                {rekapData.nama_pihak}
              </h4>
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">
                Jenis: {rekapData.jenis_tagihan}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                Sisa Tagihan Belum Lunas
              </p>
              <h4 className="text-2xl font-black text-rose-600 dark:text-rose-450 mt-1">
                {formatRupiah(rekapData.total_sisa_tagihan)}
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Aktif / Outstanding
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                Jumlah Invoice
              </p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                {rekapData.jumlah_invoice} Transaksi
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Total Belum Lunas
              </p>
            </div>
          </div>

          {/* TABLE DETAIL BARANG */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                📦 Rincian Barang & Mutasi Tagihan
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/20 dark:bg-slate-850/10 border-b border-slate-100 dark:border-slate-800">
                    <th className="p-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Tanggal
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      No Ref / Invoice
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Nama Barang
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                      Qty
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right">
                      Subtotal
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                      Status Tagihan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {rekapData.detail_barang.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-10 text-center text-slate-400 font-medium italic"
                      >
                        Tidak ada rincian barang ditemukan untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    rekapData.detail_barang.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4 text-xs font-semibold text-slate-500">
                          {item.tanggal}
                        </td>
                        <td className="p-4 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          #{item.no_invoice || item.no_referensi}
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                            {item.nama_barang || "-"}
                          </div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                            {item.kode_barang}
                          </div>
                        </td>
                        <td className="p-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400">
                          {item.qty} Pcs
                        </td>
                        <td className="p-4 text-right text-xs font-bold text-slate-700 dark:text-slate-350">
                          {formatRupiah(item.subtotal)}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide ${(item.status_piutang || item.status_hutang) === "Lunas"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                              }`}
                          >
                            {item.status_piutang || item.status_hutang || "-"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabRekapitulasiTagihan;
