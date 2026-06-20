import React, { useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axios";

const ModalQuickJurnal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const rekenings = useSelector((state) => state.data.rekening);
  const [form, setForm] = useState({
    type: "biaya_umum",
    rekening_id: "",
    nominal: "",
    keterangan: "",
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rekening_id)
      return window.showToast("Pilih sumber dana!", "warning");

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "finance/jurnal_umum.php?action=quick_transaction",
        {
          ...form,
          nominal: parseFloat(form.nominal.replace(/\D/g, "")),
        }
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast(data.message, "success");
        onSuccess();
        onClose();
        setForm({
          type: "biaya_umum",
          rekening_id: "",
          nominal: "",
          keterangan: "",
        });
      } else {
        window.showToast(data.message, "error");
      }
    } catch (e) {
      window.showToast("Gagal memproses transaksi", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 bg-amber-500 text-white flex justify-between items-center">
          <h3 className="font-black uppercase italic tracking-tighter">
            ⚡ Transaksi Cepat
          </h3>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Jenis Pengeluaran
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-amber-500"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="biaya_umum">🛠️ Biaya Operasional / Umum</option>
              <option value="gaji">👥 Pembayaran Gaji Karyawan</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Sumber Dana (Rekening)
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-amber-500"
              value={form.rekening_id}
              onChange={(e) =>
                setForm({ ...form, rekening_id: e.target.value })
              }
              required
            >
              <option value="">-- Pilih Rekening --</option>
              {rekenings.filter(r => r.coa_id && r.coa_id !== "0").map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_rekening} (Sisa: Rp{" "}
                  {new Intl.NumberFormat("id-ID").format(r.saldo_sekarang)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Nominal (Rp)
            </label>
            <input
              type="text"
              placeholder="Contoh: 500.000"
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-black text-lg text-emerald-600 outline-none focus:border-amber-500 shadow-inner"
              value={form.nominal}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setForm({
                  ...form,
                  nominal: val
                    ? new Intl.NumberFormat("id-ID").format(val)
                    : "",
                });
              }}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Keterangan / Catatan
            </label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none focus:border-amber-500 h-20 resize-none"
              placeholder="Tulis detail transaksi di sini..."
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "⚙️ MEMPROSES..." : "✅ SIMPAN TRANSAKSI"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ModalQuickJurnal;
