import React from "react";

const TabAkuntansi = ({
  storeConfig,
  setStoreConfig,
  coaList,
  saveStoreConfig,
  isSaving,
}) => {
  const mappings = [
    {
      label: "Akun Kas Utama",
      key: "acc_code_kas",
      icon: "💰",
      desc: "Digunakan untuk penerimaan tunai & pembayaran biaya",
    },
    {
      label: "Akun Persediaan",
      key: "acc_code_persediaan",
      icon: "📦",
      desc: "Digunakan untuk nilai stok barang masuk & keluar",
    },
    {
      label: "Akun Hutang Usaha",
      key: "acc_code_hutang",
      icon: "🤝",
      desc: "Digunakan untuk mencatat kewajiban ke supplier",
    },
    {
      label: "Akun Piutang Usaha",
      key: "acc_code_piutang",
      icon: "📝",
      desc: "Digunakan untuk mencatat tagihan ke pembeli",
    },
    {
      label: "Akun Pendapatan",
      key: "acc_code_pendapatan",
      icon: "📈",
      desc: "Digunakan untuk mencatat hasil penjualan POS",
    },
    {
      label: "Akun Beban Gaji",
      key: "acc_code_gaji",
      icon: "👥",
      desc: "Digunakan untuk pembayaran gaji karyawan",
    },
    {
      label: "Akun Harga Pokok (HPP)",
      key: "acc_code_hpp",
      icon: "📉",
      desc: "Digunakan untuk mencatat nilai modal barang yang terjual",
    },
    {
      label: "Akun Biaya Operasional",
      key: "acc_code_biaya_umum",
      icon: "🛠️",
      desc: "Digunakan untuk biaya listrik, air, sewa, dsb",
    },
    {
      label: "Akun Beban Reject",
      key: "acc_code_beban_reject",
      icon: "⚠️",
      desc: "Digunakan untuk pencatatan kerugian barang cacat",
    },
    {
      label: "Akun Deposit Reseller",
      key: "acc_code_deposit",
      icon: "💳",
      desc: "Digunakan untuk mencatat titipan uang reseller",
    },
    {
      label: "Akun Modal Utama",
      key: "acc_code_modal",
      icon: "🏛️",
      desc: "Digunakan untuk mencatat ekuitas/modal awal",
    },
    {
      label: "Akun Penarikan Saldo (Prive)",
      key: "acc_code_penarikan",
      icon: "🏧",
      desc: "Digunakan untuk mencatat penarikan/prive owner",
    },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      <div className="border-b dark:border-slate-800 pb-3">
        <h3 className="font-black italic uppercase text-sm text-slate-800 dark:text-slate-100 tracking-tighter">
          Pemetaan <span className="text-amber-600">Akuntansi (COA)</span>
        </h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
          Hubungkan jenis transaksi ke Kode Akun Buku Besar untuk Jurnal
          Otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mappings.map((m) => (
          <div
            key={m.key}
            className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 hover:border-amber-200 transition-colors group"
          >
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
              {m.icon}
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                {m.label}
              </label>
              <select
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-amber-500 shadow-sm"
                value={storeConfig[m.key] || ""}
                onChange={(e) =>
                  setStoreConfig({ ...storeConfig, [m.key]: e.target.value })
                }
              >
                <option value="">-- Pilih Akun --</option>
                {coaList.map((coa) => (
                  <option key={coa.kode_akun} value={coa.kode_akun}>
                    [{coa.kode_akun}] {coa.nama_akun} - {coa.tipe_akun}
                  </option>
                ))}
              </select>
              <p className="text-[9px] font-medium text-slate-400 italic">
                {m.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t dark:border-slate-800 flex gap-4 flex-wrap">
        <button
          onClick={saveStoreConfig}
          disabled={isSaving}
          className="flex-1 md:flex-none bg-slate-900 dark:bg-amber-600 text-white px-12 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-amber-600 dark:hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? "⌛ MENYIMPAN..." : "💾 SIMPAN PEMETAAN AKUN"}
        </button>
        <button
          onClick={async () => {
            try {
              const { default: axiosInstance } = await import("../../utils/axios");
              const res = await axiosInstance.post("finance/rekening.php?action=sync_coa_rekening");
              if (res.data.status === "success") {
                window.showToast(res.data.message, "success");
              } else {
                window.showToast("Gagal sync COA Rekening", "error");
              }
            } catch (e) {
              window.showToast("Terjadi kesalahan saat sync", "error");
            }
          }}
          className="flex-1 md:flex-none bg-indigo-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
          title="Gunakan ini jika rekening Anda belum terhubung dengan akun Buku Besar"
        >
          🔄 SINKRONKAN REKENING LAMA
        </button>
      </div>
    </div>
  );
};

export default TabAkuntansi;
