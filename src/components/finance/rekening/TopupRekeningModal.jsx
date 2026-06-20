import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";

const TopupRekeningModal = ({ isOpen, onClose, rekenings, onSuccess }) => {
  const [form, setForm] = useState({
    rekening_id: "",
    nominal: "",
    keterangan: "Topup Kas/Bank",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        rekening_id: "",
        nominal: "",
        keterangan: "Topup Kas/Bank",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatRupiah = (val) => {
    if (!val) return "";
    return "Rp " + new Intl.NumberFormat("id-ID").format(val);
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!form.rekening_id)
      return window.showToast("Pilih rekening tujuan!", "warning");
    if (!form.nominal)
      return window.showToast("Nominal topup wajib diisi!", "warning");

    setLoading(true);
    try {
      const payload = {
        ...form,
        nominal: parseFloat(form.nominal.replace(/\D/g, "")),
      };
      const res = await axiosInstance.post(
        "finance/rekening.php?action=topup",
        payload
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast("Topup dana berhasil!", "success");
        onSuccess();
        onClose();
      } else {
        window.showToast(data.message, "error");
      }
    } catch (e) {
      window.showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-slate-900">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 text-center">
          <h3 className="font-black uppercase italic text-lg text-slate-800 tracking-widest">
            Topup <span className="text-emerald-600">Dana</span>
          </h3>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase">
            Masuk Ke Kas / Bank
          </p>
        </div>

        {/* BODY / FORM */}
        <form
          id="topupForm"
          onSubmit={handleTopup}
          className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
              Ke Rekening (Tujuan)
            </label>
            <select
              className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm text-slate-800 outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
              value={form.rekening_id}
              onChange={(e) =>
                setForm({ ...form, rekening_id: e.target.value })
              }
              required
            >
              <option value="">-- Pilih Rekening Tujuan --</option>
              {rekenings
                .filter(
                  (r) =>
                    !["Piutang", "Hutang", "MP Escrow"].includes(
                      r.tipe_rekening,
                    ),
                )
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_rekening}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
              Nominal Topup
            </label>
            <input
              type="text"
              placeholder="Rp 0"
              className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg font-black text-sm text-emerald-600 outline-none focus:border-emerald-500 transition-all shadow-inner"
              value={form.nominal ? formatRupiah(form.nominal) : ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  nominal: e.target.value.replace(/\D/g, ""),
                })
              }
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
              Keterangan
            </label>
            <input
              type="text"
              placeholder="Contoh: Topup dari Owner..."
              className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm"
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              required
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="col-span-full flex justify-end gap-3 mt-2 md:mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              form="topupForm"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Memproses..." : "Topup Saldo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopupRekeningModal;
