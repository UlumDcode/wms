import React, { useState, useEffect, useMemo } from "react";

const SalaryPaymentModal = ({
  isOpen,
  onClose,
  user,
  rekeningList = [],
  onSubmit,
}) => {
  const [form, setForm] = useState({
    gaji_pokok: 0,
    bonus: 0,
    total_diterima: 0,
    metode_pembayaran: "Transfer",
    rekening_id: "",
  });

  // Ambil tipe rekening unik dari list (Transfer Bank, Cash, dll)
  const availableTypes = useMemo(() => {
    // Pastikan rekeningList tidak kosong sebelum mapping
    return rekeningList.length > 0
      ? [...new Set(rekeningList.map((r) => r.tipe_rekening))]
      : [];
  }, [rekeningList]);

  // Filter list rekening berdasarkan metode yang dipilih
  const filteredRekening = useMemo(() => {
    return rekeningList.filter(
      (r) => r.tipe_rekening === form.metode_pembayaran,
    );
  }, [rekeningList, form.metode_pembayaran]);

  useEffect(() => {
    if (isOpen && user) {
      const gp = parseFloat(user.gaji) || 0;
      // Set metode_pembayaran default ke tipe pertama yang tersedia, atau kosong jika tidak ada
      const defaultMethod = availableTypes.length > 0 ? availableTypes[0] : "";
      setForm({
        user_id: user.id,
        nama_user: user.nama,
        gaji_pokok: gp,
        bonus: 0, // Reset bonus saat modal dibuka
        total_diterima: gp,
        metode_pembayaran: defaultMethod,
        rekening_id: "",
      });
    }
  }, [isOpen, user, availableTypes]);

  const handleBonusChange = (val) => {
    const bonusVal = parseInt(val.replace(/\D/g, "")) || 0;
    setForm((prev) => ({
      ...prev,
      bonus: bonusVal,
      total_diterima: prev.gaji_pokok + bonusVal,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-black italic uppercase text-slate-800 dark:text-white leading-none">
              Pembayaran <span className="text-emerald-600">Gaji Digital</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Karyawan: {form.nama_user}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="space-y-4"
        >
          {/* DETAIL GAJI */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-500">
                Gaji Pokok
              </label>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Rp {form.gaji_pokok.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-blue-500 ml-1">
                + Lembur / Bonus
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-800/50 p-2 rounded-lg font-black text-xs text-blue-600 outline-none focus:border-blue-400"
                placeholder="Masukkan bonus..."
                value={form.bonus ? form.bonus.toLocaleString("id-ID") : ""}
                onChange={(e) => handleBonusChange(e.target.value)}
              />
            </div>

            <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-emerald-600">
                Total Transfer
              </label>
              <span className="text-lg font-black text-emerald-600">
                Rp {form.total_diterima.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* PEMBAYARAN */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                Metode
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none"
                value={form.metode_pembayaran}
                onChange={(e) =>
                  setForm({
                    ...form,
                    metode_pembayaran: e.target.value,
                    rekening_id: "",
                  })
                }
              >
                <option value="">Pilih Metode...</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                Sumber Rekening
              </label>
              <select
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-emerald-500"
                value={form.rekening_id}
                onChange={(e) =>
                  setForm({ ...form, rekening_id: e.target.value })
                }
              >
                <option value="">Pilih...</option>
                {filteredRekening.length === 0 ? (
                  <option value="">Tidak ada rekening untuk metode ini</option>
                ) : (
                  filteredRekening.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama_rekening} (Rp{" "}
                      {parseFloat(r.saldo_sekarang).toLocaleString()})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-600/30 tracking-widest transition-all"
            >
              Proses Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryPaymentModal;
