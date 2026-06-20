import React from "react";

const AddAkunModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  handleSubmit,
  rekeningTypes,
  coaList,
  loading,
}) => {
  if (!isOpen) return null;

  const handleSaldoChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setForm({ ...form, saldo_awal: rawValue });
  };

  const formatRupiah = (val) => {
    if (!val) return "";
    return "Rp " + new Intl.NumberFormat("id-ID").format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-5 rounded-xl shadow-xl border border-slate-100 w-full max-w-3xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <h3 className="font-bold uppercase italic text-base mb-4 border-b border-slate-100 pb-3 text-slate-800 shrink-0">
          {form.id ? "Edit Rekening" : "Tambah Rekening Baru"}
        </h3>

        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
          <form
            id="addAkunForm"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1 tracking-wider">
                Nama Rekening / Akun
              </label>
              <input
                type="text"
                value={form.nama_rekening}
                onChange={(e) =>
                  setForm({ ...form, nama_rekening: e.target.value })
                }
                placeholder="Contoh: BCA Operasional"
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg font-semibold text-sm outline-none border border-slate-200 focus:border-rose-500 transition-all shadow-sm"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1 tracking-wider">
                Tipe Rekening
              </label>
              <select
                value={form.tipe_rekening}
                onChange={(e) =>
                  setForm({ ...form, tipe_rekening: e.target.value })
                }
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg font-semibold text-sm outline-none border border-slate-200 focus:border-rose-500 transition-all cursor-pointer shadow-sm text-slate-800"
                disabled={
                  form.id && ["Cash", "MP Escrow"].includes(form.tipe_rekening)
                }
              >
                {rekeningTypes.map((t) => {
                  const isSystem = ["Cash", "MP Escrow"].includes(t.value);
                  if (isSystem) {
                    if (form.id && form.tipe_rekening === t.value) {
                      return (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      );
                    }
                    return null;
                  }
                  return (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1 tracking-wider">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={form.nomor_rekening}
                onChange={(e) =>
                  setForm({ ...form, nomor_rekening: e.target.value })
                }
                placeholder="Opsional"
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg font-semibold text-sm outline-none border border-slate-200 focus:border-rose-500 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1 tracking-wider">
                Saldo Awal
              </label>
              <input
                type="text"
                value={formatRupiah(form.saldo_awal)}
                onChange={handleSaldoChange}
                disabled={form.id && form.mutasi_count > 0}
                placeholder="Rp 0"
                className={`w-full px-3 py-2.5 rounded-lg font-semibold text-sm outline-none transition-all shadow-sm ${form.id && form.mutasi_count > 0 ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" : "bg-emerald-50 text-emerald-700 border border-emerald-200 focus:border-emerald-500"}`}
              />
              {form.id && form.mutasi_count > 0 && (
                <p className="text-[10px] text-rose-500 mt-1.5 leading-tight">
                  * Saldo Awal dikunci karena akun sudah memiliki riwayat
                  mutasi. Gunakan fitur Mutasi / Jurnal Umum untuk tambah saldo.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1 tracking-wider">
                Hubungkan dengan Akun Buku Besar (COA)
              </label>
              <select
                value={form.coa_id || ""}
                onChange={(e) => setForm({ ...form, coa_id: e.target.value })}
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg font-semibold text-sm outline-none border border-slate-200 focus:border-rose-500 transition-all cursor-pointer shadow-sm text-slate-800"
              >
                <option value="">-- {form.id ? "Tidak Terhubung (Kosong)" : "Buat COA Otomatis"} --</option>
                {coaList && coaList.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.kode_akun}] {c.nama_akun}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-400 mt-1 leading-tight ml-1 font-medium">
                Pilih akun COA jika Anda sudah pernah membuatnya secara manual di menu Setup COA.
              </p>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-slate-200 active:scale-95 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            form="addAkunForm"
            disabled={loading}
            className="px-6 bg-slate-900 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Simpan Data"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAkunModal;
