import React, { useState, useEffect } from "react";
import BukuBesar from "../../components/finance/laporan/BukuBesar";
import LaporanFinansial from "../../components/finance/laporan/LaporanFinansial";

const LaporanKeuangan = () => {
  const [activeTab, setActiveTab] = useState("finansial");

  // State Periode (Dropdown Bulan & Tahun)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [bulan, setBulan] = useState(currentMonth.toString().padStart(2, "0"));
  const [tahun, setTahun] = useState(currentYear.toString());

  const [calculatedStartDate, setCalculatedStartDate] = useState("");
  const [calculatedEndDate, setCalculatedEndDate] = useState("");

  const daftarBulan = [
    { val: "01", label: "Januari" },
    { val: "02", label: "Februari" },
    { val: "03", label: "Maret" },
    { val: "04", label: "April" },
    { val: "05", label: "Mei" },
    { val: "06", label: "Juni" },
    { val: "07", label: "Juli" },
    { val: "08", label: "Agustus" },
    { val: "09", label: "September" },
    { val: "10", label: "Oktober" },
    { val: "11", label: "November" },
    { val: "12", label: "Desember" },
  ];

  // Generate 5 tahun ke belakang dan 1 tahun ke depan
  const daftarTahun = Array.from(
    new Array(7),
    (val, index) => currentYear - 5 + index,
  );

  useEffect(() => {
    const year = parseInt(tahun);
    const month = parseInt(bulan);

    if (!isNaN(year) && !isNaN(month)) {
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      setCalculatedStartDate(firstDay.toISOString().slice(0, 10));
      setCalculatedEndDate(lastDay.toISOString().slice(0, 10));
    }
  }, [bulan, tahun]);

  return (
    // TAMBAHAN: print:bg-white print:h-auto print:overflow-visible
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans print:bg-white print:h-auto print:overflow-visible">
      {/* SIDEBAR: TAMBAHAN print:hidden */}
      <div className="w-full md:w-56 shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-6 overflow-y-auto z-10 shadow-sm md:shadow-none print:hidden">
        <div className="space-y-2">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">
            Menu Laporan
          </h3>
          <button
            onClick={() => setActiveTab("finansial")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
              activeTab === "finansial"
                ? "bg-slate-900 text-white shadow-md dark:bg-blue-600"
                : "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Laba Rugi & Neraca
          </button>
          <button
            onClick={() => setActiveTab("buku_besar")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
              activeTab === "buku_besar"
                ? "bg-slate-900 text-white shadow-md dark:bg-blue-600"
                : "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Buku Besar
          </button>
        </div>

        {activeTab === "finansial" && (
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Filter Periode
            </h3>

            <div className="space-y-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1 uppercase">
                  Bulan
                </label>
                <select
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                >
                  {daftarBulan.map((b) => (
                    <option key={b.val} value={b.val}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1 ml-1 uppercase">
                  Tahun
                </label>
                <select
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                >
                  {daftarTahun.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[8px] text-slate-400 font-medium leading-relaxed mt-2 text-justify">
              *Laba Rugi ditarik selama bulan terpilih. Neraca memotret posisi
              aset hingga akhir bulan terpilih.
            </p>
          </div>
        )}
      </div>

      {/* KONTEN KANAN: TAMBAHAN print:p-0 print:overflow-visible print:bg-white */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative print:p-0 print:overflow-visible print:bg-white">
        {activeTab === "finansial" && (
          <LaporanFinansial bulan={bulan} tahun={tahun} />
        )}
        {activeTab === "buku_besar" && <BukuBesar />}
      </div>
    </div>
  );
};

export default LaporanKeuangan;
