import React, { useState } from "react";

const KalkulatorRoas = () => {
  const [hargaJual, setHargaJual] = useState("");
  const [hpp, setHpp] = useState("");
  const [totalBiayaAdminPct, setTotalBiayaAdminPct] = useState(8.0);
  const [targetProfit, setTargetProfit] = useState("");

  const formatRp = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const hitungRoas = () => {
    const vHarga = Number(hargaJual) || 0;
    const vModal = Number(hpp) || 0;
    const adminFee = (vHarga * (Number(totalBiayaAdminPct) || 0)) / 100;
    const vTarget = Number(targetProfit) || 0;

    const marginKotor = vHarga - vModal - adminFee;
    const maksimalCpa = marginKotor > 0 ? marginKotor : 0;
    const roasBreakEven =
      maksimalCpa > 0 ? (vHarga / maksimalCpa).toFixed(2) : 0;
    const sisaBajetIklan = marginKotor - vTarget;
    const roasTarget =
      sisaBajetIklan > 0 ? (vHarga / sisaBajetIklan).toFixed(2) : 0;

    return {
      marginKotor,
      maksimalCpa,
      roasBreakEven,
      sisaBajetIklan,
      roasTarget,
      adminFee,
    };
  };
  const hasil = hitungRoas();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* INPUT FORM */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
        <h3 className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          Parameter Pengiklanan
        </h3>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Harga Jual Produk (Rp)
          </label>
          <input
            type="number"
            value={hargaJual}
            onChange={(e) => setHargaJual(e.target.value)}
            placeholder="Contoh: 150000"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600 dark:text-slate-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            HPP / Harga Modal (Rp)
          </label>
          <input
            type="number"
            value={hpp}
            onChange={(e) => setHpp(e.target.value)}
            placeholder="Termasuk produksi/packing"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Yuran (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={totalBiayaAdminPct}
              onChange={(e) => setTotalBiayaAdminPct(e.target.value)}
              placeholder="Misal 8.5"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Target Bersih (Rp)
            </label>
            <input
              type="number"
              value={targetProfit}
              onChange={(e) => setTargetProfit(e.target.value)}
              placeholder="Untung bersih"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* RESULT CARD */}
      <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-3xl shadow-xl flex flex-col justify-center space-y-6">
        {/* Break Even Point */}
        <div className="bg-slate-800 dark:bg-slate-900 p-5 rounded-2xl border border-slate-700 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full"></div>
          <h3 className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 relative z-10">
            Sisa Margin (Maks. Biaya Iklan/CPA)
          </h3>
          <p className="text-2xl font-black text-white relative z-10">
            {formatRp(hasil.maksimalCpa)}
          </p>

          <div className="mt-5 flex justify-between items-center border-t border-slate-600/50 pt-3 relative z-10">
            <span className="text-[10px] uppercase font-bold text-slate-300">
              ROAS Break Even
            </span>
            <span className="text-xl font-black text-rose-400">
              {hasil.roasBreakEven}x
            </span>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-bold relative z-10">
            Jika ROAS Dashboard di bawah angka ini, kempen iklan Anda rugi.
          </p>
        </div>

        {/* Target ROAS */}
        <div className="bg-blue-600 p-5 rounded-2xl border border-blue-500 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full"></div>
          <h3 className="text-[10px] text-blue-200 uppercase font-black tracking-widest mb-1 relative z-10">
            Anggaran Iklan (Untuk Capai Target Profit)
          </h3>
          <p className="text-2xl font-black text-white relative z-10">
            {formatRp(hasil.sisaBajetIklan)}
          </p>

          <div className="mt-5 flex justify-between items-center border-t border-blue-400/50 pt-3 relative z-10">
            <span className="text-[10px] uppercase font-bold text-blue-100">
              Target ROAS Iklan
            </span>
            <span className="text-3xl font-black text-white">
              {hasil.roasTarget > 0 ? hasil.roasTarget : 0}x
            </span>
          </div>
          <p className="text-[9px] text-blue-200 mt-1 font-bold relative z-10">
            Ini adalah purata pulangan ROAS yang mesti dicapai di Ads Manager.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KalkulatorRoas;
