import React, { useState } from "react";

const KalkulatorTiktok = () => {
  const [mode, setMode] = useState("srp");

  // 1. Info Produk
  const [cogs, setCogs] = useState(20000);
  const [hargaJual, setHargaJual] = useState("");
  const [targetProfit, setTargetProfit] = useState(20000);
  const [komisiKategori, setKomisiKategori] = useState(7.0);
  const [komisiDinamis, setKomisiDinamis] = useState(4.0);

  // 2. Program Pemasaran
  const [useVoucher, setUseVoucher] = useState(true);
  const [voucherPct, setVoucherPct] = useState(3.5);
  const [voucherMax, setVoucherMax] = useState(60000);
  const [useOngkir, setUseOngkir] = useState(false);
  const [ongkirPct, setOngkirPct] = useState(4.0);
  const [ongkirMax, setOngkirMax] = useState(10000);

  // 3. Biaya Lainnya
  const [afiliasi, setAfiliasi] = useState(0);
  const [biayaOps, setBiayaOps] = useState(0);

  const formatRp = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const calculate = () => {
    const vCogs = Number(cogs) || 0;
    const vTargetProfit = Number(targetProfit) || 0;
    const vHargaJual = Number(hargaJual) || 0;

    const valKat = Number(komisiKategori) || 0;
    const valDin = Number(komisiDinamis) || 0;
    const valVouch = useVoucher ? Number(voucherPct) || 0 : 0;
    const maxVouch = useVoucher ? Number(voucherMax) || 0 : 0;
    const valOngkir = useOngkir ? Number(ongkirPct) || 0 : 0;
    const maxOngkir = useOngkir ? Number(ongkirMax) || 0 : 0;
    const valAfil = Number(afiliasi) || 0;
    const valOps = Number(biayaOps) || 0;

    let finalSrp = 0;
    let finalProfit = 0;

    // Algoritma Binary Search untuk mendapatkan SRP Akurat (karena ada Max Cap)
    if (mode === "srp") {
      let low = vCogs + vTargetProfit;
      let high = (vCogs + vTargetProfit) * 10;
      for (let i = 0; i < 50; i++) {
        let mid = (low + high) / 2;
        let pKat = mid * (valKat / 100);
        let pDin = mid * (valDin / 100);

        let pVouch = mid * (valVouch / 100);
        if (maxVouch > 0 && pVouch > maxVouch) pVouch = maxVouch;

        let pOngkir = mid * (valOngkir / 100);
        if (maxOngkir > 0 && pOngkir > maxOngkir) pOngkir = maxOngkir;

        let pLain = mid * ((valAfil + valOps) / 100);

        let totalDeduction = pKat + pDin + pVouch + pOngkir + pLain;
        let currentProfit = mid - vCogs - totalDeduction;

        if (currentProfit < vTargetProfit) {
          low = mid;
        } else {
          high = mid;
        }
      }
      finalSrp = high;
      finalProfit = vTargetProfit;
    } else {
      finalSrp = vHargaJual;
      let pKat = finalSrp * (valKat / 100);
      let pDin = finalSrp * (valDin / 100);

      let pVouch = finalSrp * (valVouch / 100);
      if (maxVouch > 0 && pVouch > maxVouch) pVouch = maxVouch;

      let pOngkir = finalSrp * (valOngkir / 100);
      if (maxOngkir > 0 && pOngkir > maxOngkir) pOngkir = maxOngkir;

      let pLain = finalSrp * ((valAfil + valOps) / 100);

      let totalDeduction = pKat + pDin + pVouch + pOngkir + pLain;
      finalProfit = finalSrp - vCogs - totalDeduction;
    }

    // Detail Potongan untuk Visualisasi DataPinter
    let detailKategori = finalSrp * (valKat / 100);
    let detailDinamis = finalSrp * (valDin / 100);
    let feePlatform = detailKategori + detailDinamis;

    let detailVoucher = finalSrp * (valVouch / 100);
    if (maxVouch > 0 && detailVoucher > maxVouch) detailVoucher = maxVouch;

    let detailOngkir = finalSrp * (valOngkir / 100);
    if (maxOngkir > 0 && detailOngkir > maxOngkir) detailOngkir = maxOngkir;
    let feeMarketing = detailVoucher + detailOngkir;

    let feeLain = finalSrp * ((valAfil + valOps) / 100);
    let totalBiaya = vCogs + feePlatform + feeMarketing + feeLain;
    let marginLabaPct = finalSrp > 0 ? (finalProfit / finalSrp) * 100 : 0;

    // Kalkulasi Persentase dari Total Biaya (Bukan Harga Jual)
    let pctOps = totalBiaya > 0 ? (vCogs / totalBiaya) * 100 : 0;
    let pctPlatform = totalBiaya > 0 ? (feePlatform / totalBiaya) * 100 : 0;
    let pctMarketing = totalBiaya > 0 ? (feeMarketing / totalBiaya) * 100 : 0;
    let pctLain = totalBiaya > 0 ? (feeLain / totalBiaya) * 100 : 0;

    return {
      finalSrp,
      finalProfit,
      marginLabaPct,
      totalBiaya,
      feePlatform,
      detailKategori,
      detailDinamis,
      feeMarketing,
      detailVoucher,
      detailOngkir,
      feeLain,
      pctOps,
      pctPlatform,
      pctMarketing,
      pctLain,
      vCogs,
    };
  };

  const hasil = calculate();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-in slide-in-from-bottom-2 duration-300">
      {/* ================= BAGIAN KIRI: FORM INPUT ================= */}
      <div className="xl:col-span-7 space-y-6">
        {/* MODE PERHITUNGAN */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-4">
            Pilih Hasil Perhitungan
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <label
              className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${mode === "srp" ? "border-slate-800 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              <input
                type="radio"
                name="mode"
                className="w-4 h-4 accent-slate-800"
                checked={mode === "srp"}
                onChange={() => setMode("srp")}
              />
              <div>
                <p className="text-xs font-black uppercase text-slate-800 dark:text-slate-100">
                  Rekomendasi Harga Ritel (SRP)
                </p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                  Menampilkan harga ritel yang direkomendasikan.
                </p>
              </div>
            </label>
            <label
              className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${mode === "margin" ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:bg-slate-50"}`}
            >
              <input
                type="radio"
                name="mode"
                className="w-4 h-4 accent-emerald-600"
                checked={mode === "margin"}
                onChange={() => setMode("margin")}
              />
              <div>
                <p className="text-xs font-black uppercase text-slate-800 dark:text-slate-100">
                  Margin Laba
                </p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                  Menunjukkan margin laba dari menjual produk.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 1. INFO PRODUK */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
            1. Info Produk
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mode === "margin" && (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Harga Jual Saat Ini (Rp)
                </label>
                <input
                  type="number"
                  value={hargaJual}
                  onChange={(e) => setHargaJual(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:border-rose-500 dark:text-slate-100"
                />
              </div>
            )}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Biaya Pokok Penjualan (COGS)
              </label>
              <input
                type="number"
                value={cogs}
                onChange={(e) => setCogs(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:border-rose-500 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Komisi Kategori (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={komisiKategori}
                onChange={(e) => setKomisiKategori(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:border-rose-500 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Komisi Dinamis (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={komisiDinamis}
                onChange={(e) => setKomisiDinamis(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:border-rose-500 dark:text-slate-100"
              />
            </div>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
            Biaya komisi dinamis {komisiDinamis}% akan digunakan pada simulasi.
          </p>
        </div>

        {/* 2. PROGRAM PEMASARAN */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
            2. Biaya Program Pemasaran
          </h3>
          <div className="space-y-4">
            {/* VOUCHER XTRA */}
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={useVoucher}
                  onChange={(e) => setUseVoucher(e.target.checked)}
                  className="w-4 h-4 accent-rose-500"
                />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                  Voucher Xtra Program
                </span>
              </label>
              {useVoucher && (
                <div className="grid grid-cols-2 gap-4 pl-7">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Persentase (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={voucherPct}
                      onChange={(e) => setVoucherPct(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs font-bold outline-none focus:border-rose-500 mt-1 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Maks. Potongan (Rp)
                    </label>
                    <input
                      type="number"
                      value={voucherMax}
                      onChange={(e) => setVoucherMax(e.target.value)}
                      placeholder="0 = Tanpa batas"
                      className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs font-bold outline-none focus:border-rose-500 mt-1 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* GRATIS ONGKIR */}
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={useOngkir}
                  onChange={(e) => setUseOngkir(e.target.checked)}
                  className="w-4 h-4 accent-rose-500"
                />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                  Program Gratis Ongkir
                </span>
              </label>
              {useOngkir && (
                <div className="grid grid-cols-2 gap-4 pl-7">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Persentase (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={ongkirPct}
                      onChange={(e) => setOngkirPct(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs font-bold outline-none focus:border-rose-500 mt-1 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Maks. Potongan (Rp)
                    </label>
                    <input
                      type="number"
                      value={ongkirMax}
                      onChange={(e) => setOngkirMax(e.target.value)}
                      placeholder="0 = Tanpa batas"
                      className="w-full border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs font-bold outline-none focus:border-rose-500 mt-1 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BAGIAN KANAN: RESULT STICKY ================= */}
      <div className="xl:col-span-5 sticky top-4 space-y-4">
        {/* KOTAK MERAH (SRP) */}
        <div
          className={`p-6 rounded-3xl text-white shadow-xl ${mode === "srp" ? "bg-rose-500" : "bg-emerald-600"}`}
        >
          <h2 className="text-[11px] font-bold text-white/90 tracking-widest mb-1 text-center">
            {mode === "srp" ? "Rekomendasi harga ritel" : "Margin Laba Bersih"}
          </h2>
          <p className="text-4xl font-black text-center mt-2 mb-1 drop-shadow-md">
            {formatRp(mode === "srp" ? hasil?.finalSrp : hasil?.finalProfit)}
          </p>
          <p className="text-[10px] font-bold text-white/80 text-center uppercase tracking-wider mb-6">
            (Margin laba {hasil?.marginLabaPct.toFixed(2)}%)
          </p>

          {mode === "srp" && (
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30">
              <label className="block text-[9px] font-bold text-white mb-2 text-center">
                Tampilkan keuntungan dalam: Nilai tetap
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  value={targetProfit}
                  onChange={(e) => setTargetProfit(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 p-3 pl-10 rounded-xl text-sm font-black text-white outline-none focus:bg-white/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* BREAKDOWN BIAYA (Mirip DataPinter) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-end border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-rose-500">Total biaya</h3>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {formatRp(hasil?.totalBiaya)}
            </span>
          </div>

          <div className="space-y-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {/* BIAYA OPERASIONAL */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Biaya operasional ({hasil?.pctOps.toFixed(2)}%)</span>
                <span className="text-rose-500">{formatRp(hasil?.vCogs)}</span>
              </div>
              <div className="pl-4 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                <div className="flex justify-between">
                  <span>Biaya pokok penjualan (COGS)</span>
                  <span className="text-rose-400">
                    {formatRp(hasil?.vCogs)}
                  </span>
                </div>
              </div>
            </div>

            {/* KOMISI PLATFORM */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Komisi platform ({hasil?.pctPlatform.toFixed(2)}%)</span>
                <span className="text-rose-500">
                  {formatRp(hasil?.feePlatform)}
                </span>
              </div>
              <div className="pl-4 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                <div className="flex justify-between">
                  <span>Komisi dinamis</span>
                  <span className="text-rose-400">
                    {formatRp(hasil?.detailDinamis)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Komisi kategori</span>
                  <span className="text-rose-400">
                    {formatRp(hasil?.detailKategori)}
                  </span>
                </div>
              </div>
            </div>

            {/* PROGRAM PEMASARAN */}
            {hasil?.feeMarketing > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span>
                    Program pemasaran ({hasil?.pctMarketing.toFixed(2)}%)
                  </span>
                  <span className="text-rose-500">
                    {formatRp(hasil?.feeMarketing)}
                  </span>
                </div>
                <div className="pl-4 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                  {useVoucher && (
                    <div className="flex justify-between">
                      <span>Program Voucher Xtra</span>
                      <span className="text-rose-400">
                        {formatRp(hasil?.detailVoucher)}
                      </span>
                    </div>
                  )}
                  {useOngkir && (
                    <div className="flex justify-between">
                      <span>Program Gratis Ongkir</span>
                      <span className="text-rose-400">
                        {formatRp(hasil?.detailOngkir)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              <span className="text-slate-700 dark:text-slate-200 font-black">
                Penafian:
              </span>{" "}
              Hasil yang ditampilkan hanya untuk tujuan simulasi. Kalkulator ini
              menghitung persentase secara proporsional dari Total Biaya, persis
              seperti referensi layar Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KalkulatorTiktok;
