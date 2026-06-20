import React, { useState } from "react";

const KalkulatorShopee = () => {
  const [mode, setMode] = useState("margin"); // 'margin' = Hitung dari Harga, 'srp' = Rekomendasi

  // 1. Biaya Proses
  const [qty, setQty] = useState(1);
  const [bppTrx, setBppTrx] = useState(1250);

  // 2. Harga (Mode Margin)
  const [hargaJual, setHargaJual] = useState(270000);
  const [adaDiskon, setAdaDiskon] = useState("Tidak");
  const [diskon, setDiskon] = useState(0);

  // 2B. HPP (Mode SRP)
  const [cogs, setCogs] = useState(100000);
  const [targetProfit, setTargetProfit] = useState(50000);

  // 3. Layanan & Platform
  const [adminPct, setAdminPct] = useState(5.75);
  const [programPromosi, setProgramPromosi] = useState(
    "Promo XTRA dan Gratis Ongkir XTRA",
  );

  const [promoXtraPct, setPromoXtraPct] = useState(4.5);
  // TIPS: Ubah ke 0 jika ingin mereplikasi bug salah hitung milik DataPinter
  const [promoXtraMax, setPromoXtraMax] = useState(0);

  const [gratisOngkirPct, setGratisOngkirPct] = useState(4.0);
  const [gratisOngkirMax, setGratisOngkirMax] = useState(20000);

  const [isLive, setIsLive] = useState("Tidak");
  const [biayaLain, setBiayaLain] = useState(350);

  const formatRp = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const calculate = () => {
    const vQty = Number(qty) || 1;
    const vBppTrx = Number(bppTrx) || 0;
    const vBiayaLain = Number(biayaLain) || 0;
    const vAdminPct = Number(adminPct) || 0;

    const usePromoXtra = programPromosi.includes("Promo XTRA");
    const useGratisOngkir = programPromosi.includes("Gratis Ongkir");

    const vPromoPct = usePromoXtra ? Number(promoXtraPct) || 0 : 0;
    const vPromoMax = usePromoXtra ? Number(promoXtraMax) || 0 : 0;

    const vOngkirPct = useGratisOngkir ? Number(gratisOngkirPct) || 0 : 0;
    const vOngkirMax = useGratisOngkir ? Number(gratisOngkirMax) || 0 : 0;

    let vHargaAkhir = 0;
    let vTotalPembayaran = 0;
    let finalSrp = 0;

    if (mode === "srp") {
      const vCogs = Number(cogs) || 0;
      const vTarget = Number(targetProfit) || 0;

      let low = vCogs;
      let high = (vCogs + vTarget) * 10;
      let mid = 0;

      for (let i = 0; i < 50; i++) {
        mid = (low + high) / 2;
        let totalMid = mid * vQty;

        let admin = totalMid * (vAdminPct / 100);
        let promo = totalMid * (vPromoPct / 100);
        if (vPromoMax > 0 && promo > vPromoMax * vQty) promo = vPromoMax * vQty;

        let ongkir = totalMid * (vOngkirPct / 100);
        if (vOngkirMax > 0 && ongkir > vOngkirMax * vQty)
          ongkir = vOngkirMax * vQty;

        let potongan = admin + promo + ongkir + vBppTrx + vBiayaLain;
        let profit = totalMid - potongan - vCogs * vQty;

        if (profit < vTarget) low = mid;
        else high = mid;
      }
      finalSrp = high;
      vHargaAkhir = finalSrp;
      vTotalPembayaran = finalSrp * vQty;
    } else {
      const vHarga = Number(hargaJual) || 0;
      const vDiskon = adaDiskon === "Ya" ? Number(diskon) || 0 : 0;
      vHargaAkhir = vHarga - vDiskon;
      vTotalPembayaran = vHargaAkhir * vQty;
      finalSrp = vHarga;
    }

    let valAdmin = vTotalPembayaran * (vAdminPct / 100);

    let valPromoXtra = vTotalPembayaran * (vPromoPct / 100);
    if (vPromoMax > 0 && valPromoXtra > vPromoMax * vQty)
      valPromoXtra = vPromoMax * vQty;

    let valGratisOngkir = vTotalPembayaran * (vOngkirPct / 100);
    if (vOngkirMax > 0 && valGratisOngkir > vOngkirMax * vQty)
      valGratisOngkir = vOngkirMax * vQty;

    let totalBiayaLayanan =
      valAdmin + vBppTrx + valPromoXtra + valGratisOngkir + vBiayaLain;
    let danaDiterima = vTotalPembayaran - totalBiayaLayanan;

    return {
      vTotalPembayaran,
      valAdmin,
      valPromoXtra,
      valGratisOngkir,
      valBpp: vBppTrx,
      valBiayaLain: vBiayaLain,
      totalBiayaLayanan,
      danaDiterima,
      finalSrp,
      vHargaAkhir,
      vDiskon: adaDiskon === "Ya" ? Number(diskon) || 0 : 0,
    };
  };

  const hasil = calculate();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-2 duration-300 font-sans">
      {/* ================= BAGIAN KIRI: FORM INPUT ================= */}
      <div className="xl:col-span-7 space-y-6">
        {/* MODE PERHITUNGAN */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="block text-sm font-bold text-rose-500 dark:text-rose-400 mb-3">
            Mode Perhitungan
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-lg text-sm font-semibold outline-none focus:border-rose-500 dark:text-slate-100"
          >
            <option value="margin">Hitung dari Harga Barang</option>
            <option value="srp">Rekomendasi Harga Barang</option>
          </select>
        </div>

        {/* BIAYA PROSES PESANAN */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-rose-500 dark:text-rose-400 mb-2">
            Biaya Proses Pesanan
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Jumlah Barang Dipesan
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  BPP per Transaksi
                </label>
                <input
                  type="number"
                  value={bppTrx}
                  onChange={(e) => setBppTrx(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  BPP per Unit
                </label>
                <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm text-rose-500 dark:text-rose-400 font-medium">
                  {formatRp(Number(bppTrx) / (Number(qty) || 1))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HARGA PRODUK (MARGIN) OR INFO PRODUK (SRP) */}
        {mode === "margin" ? (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-rose-500 dark:text-rose-400 mb-2">
              Harga Produk
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Harga Jual Produk (Sebelum Diskon, per Unit, Rp)
                </label>
                <input
                  type="number"
                  value={hargaJual}
                  onChange={(e) => setHargaJual(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Diskon Penjual
                </label>
                <select
                  value={adaDiskon}
                  onChange={(e) => setAdaDiskon(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                >
                  <option value="Tidak">Tidak</option>
                  <option value="Ya">Ya</option>
                </select>
              </div>
              {adaDiskon === "Ya" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Nominal Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    value={diskon}
                    onChange={(e) => setDiskon(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-rose-500 dark:text-rose-400 mb-2">
              Info Produk (Target Profit)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Biaya Pokok (COGS)
                </label>
                <input
                  type="number"
                  value={cogs}
                  onChange={(e) => setCogs(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Target Untung Bersih (Rp)
                </label>
                <input
                  type="number"
                  value={targetProfit}
                  onChange={(e) => setTargetProfit(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* BIAYA LAYANAN & ADMINISTRASI */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-rose-500 dark:text-rose-400 mb-2">
            Biaya Layanan/Administrasi Platform
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Persentase Biaya Administrasi (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={adminPct}
                onChange={(e) => setAdminPct(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Pilihan Program Promosi
              </label>
              <select
                value={programPromosi}
                onChange={(e) => setProgramPromosi(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
              >
                <option value="Promo XTRA dan Gratis Ongkir XTRA">
                  Promo XTRA dan Gratis Ongkir XTRA
                </option>
                <option value="Hanya Promo XTRA">Hanya Promo XTRA</option>
                <option value="Hanya Gratis Ongkir XTRA">
                  Hanya Gratis Ongkir XTRA
                </option>
                <option value="Tidak Ada">Tidak Ada</option>
              </select>
            </div>

            {programPromosi.includes("Promo XTRA") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Biaya Program Promo XTRA (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={promoXtraPct}
                    onChange={(e) => setPromoXtraPct(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Maks. Promo XTRA (0 = Tanpa Batas)
                  </label>
                  <input
                    type="number"
                    value={promoXtraMax}
                    onChange={(e) => setPromoXtraMax(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            {programPromosi.includes("Gratis Ongkir") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Biaya Program Gratis Ongkir XTRA (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={gratisOngkirPct}
                    onChange={(e) => setGratisOngkirPct(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Maks. Gratis Ongkir XTRA
                  </label>
                  <input
                    type="number"
                    value={gratisOngkirMax}
                    onChange={(e) => setGratisOngkirMax(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Penjualan Live?
              </label>
              <select
                value={isLive}
                onChange={(e) => setIsLive(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
              >
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Biaya Program Lainnya (Rp)
              </label>
              <input
                type="number"
                value={biayaLain}
                onChange={(e) => setBiayaLain(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= BAGIAN KANAN: RESULT STICKY ================= */}
      <div className="xl:col-span-5 sticky top-4 space-y-6">
        {mode === "srp" && (
          <div className="bg-rose-500 p-6 rounded-xl text-white shadow-md">
            <h2 className="text-sm font-semibold mb-2 text-center">
              Rekomendasi Harga Jual (SRP)
            </h2>
            <p className="text-4xl font-bold text-center">
              {formatRp(hasil.finalSrp)}
            </p>
          </div>
        )}

        {/* RINGKASAN INPUT */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-rose-500 dark:text-rose-400 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            Ringkasan Input
          </h3>
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-200">
            <div className="flex justify-between">
              <span>Jumlah Barang Dipesan:</span>
              <span className="font-semibold">{qty}</span>
            </div>
            <div className="flex justify-between">
              <span>Harga Jual Produk (per unit, sebelum diskon):</span>
              <span className="font-semibold">
                {formatRp(mode === "srp" ? hasil.finalSrp : hargaJual)}
              </span>
            </div>
            {hasil.vDiskon > 0 && (
              <div className="flex justify-between">
                <span className="dark:text-slate-300">
                  Diskon Penjual (per unit):
                </span>
                <span className="font-semibold">{formatRp(hasil.vDiskon)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="dark:text-slate-300">
                Biaya Proses Pesanan (per transaksi):
              </span>
              <span className="font-semibold">{formatRp(hasil.valBpp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="dark:text-slate-300">
                Biaya Proses Pesanan (per unit):
              </span>
              <span className="font-semibold">
                {formatRp(hasil.valBpp / (Number(qty) || 1))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="dark:text-slate-300">
                Persentase Biaya Administrasi:
              </span>
              <span className="font-semibold">{adminPct}%</span>
            </div>

            {programPromosi.includes("Promo XTRA") && (
              <>
                <div className="flex justify-between">
                  <span className="dark:text-slate-300">Biaya Promo XTRA:</span>
                  <span className="font-semibold">{promoXtraPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-slate-300">
                    Maks. Biaya Promo XTRA:
                  </span>
                  <span className="font-semibold">
                    {Number(promoXtraMax) === 0
                      ? "Tanpa Batas"
                      : formatRp(promoXtraMax)}
                  </span>
                </div>
              </>
            )}

            {programPromosi.includes("Gratis Ongkir") && (
              <>
                <div className="flex justify-between">
                  <span className="dark:text-slate-300">
                    Biaya Gratis Ongkir XTRA:
                  </span>
                  <span className="font-semibold">{gratisOngkirPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-slate-300">
                    Maks. Biaya Gratis Ongkir XTRA:
                  </span>
                  <span className="font-semibold">
                    {Number(gratisOngkirMax) === 0
                      ? "Tanpa Batas"
                      : formatRp(gratisOngkirMax)}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span className="dark:text-slate-300">
                Biaya Program Lainnya:
              </span>
              <span className="font-semibold">
                {formatRp(hasil.valBiayaLain)}
              </span>
            </div>

            <div className="border-t-2 border-rose-500 pt-3 mt-3 flex justify-between items-center text-sm">
              <span className="font-semibold dark:text-slate-100">
                Total Pembayaran Pembeli:
              </span>
              <span className="font-bold">
                {formatRp(hasil.vTotalPembayaran)}
              </span>
            </div>
          </div>
        </div>

        {/* DETAIL POTONGAN */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-rose-500 dark:text-rose-400 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            Detail Potongan
          </h3>
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-200">
            <div className="flex justify-between">
              <span className="dark:text-slate-300">Biaya Administrasi:</span>
              <span className="font-semibold text-rose-500">
                {formatRp(hasil.valAdmin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="dark:text-slate-300">Biaya Proses Pesanan:</span>
              <span className="font-semibold text-rose-500">
                {formatRp(hasil.valBpp)}
              </span>
            </div>

            {programPromosi.includes("Promo XTRA") && (
              <div className="flex justify-between">
                <span className="dark:text-slate-300">
                  Biaya Layanan Promo XTRA:
                </span>
                <span className="font-semibold text-rose-500">
                  {formatRp(hasil.valPromoXtra)}
                </span>
              </div>
            )}

            {programPromosi.includes("Gratis Ongkir") && (
              <div className="flex justify-between">
                <span className="dark:text-slate-300">
                  Biaya Layanan Gratis Ongkir XTRA:
                </span>
                <span className="font-semibold text-rose-500">
                  {formatRp(hasil.valGratisOngkir)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="dark:text-slate-300">
                Biaya Program Lainnya:
              </span>
              <span className="font-semibold text-rose-500">
                {formatRp(hasil.valBiayaLain)}
              </span>
            </div>

            <div className="border-t-2 border-rose-500 pt-3 mt-3 flex justify-between items-center text-sm">
              <span className="font-semibold dark:text-slate-100">
                Total Biaya Layanan:
              </span>
              <span className="font-bold text-rose-500">
                {formatRp(hasil.totalBiayaLayanan)}
              </span>
            </div>
          </div>
        </div>

        {/* DANA DITERIMA PENJUAL */}
        <div className="bg-rose-500 p-8 rounded-xl text-white shadow-md flex flex-col items-center justify-center">
          <h2 className="text-sm font-semibold mb-3">Dana Diterima Penjual:</h2>
          <p className="text-4xl font-bold text-center">
            {formatRp(hasil.danaDiterima)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KalkulatorShopee;
