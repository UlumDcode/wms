import React, { useState } from "react";
import axiosInstance from "../../../utils/axios";

const WithdrawRekeningModal = ({ isOpen, onClose, rekening, fetchRekening }) => {
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !rekening) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nominal || nominal <= 0) {
      window.showToast("Nominal penarikan harus lebih dari 0", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("finance/rekening.php?action=withdraw", {
        rekening_id: rekening.id,
        nominal: parseFloat(nominal),
        keterangan: keterangan || "Penarikan Dana / Prive",
      });
      if (res.data.status === "success") {
        window.showToast("Penarikan dana berhasil dicatat!", "success");
        fetchRekening();
        onClose();
        setNominal("");
        setKeterangan("");
      } else {
        window.showToast(res.data.message || "Gagal melakukan penarikan", "error");
      }
    } catch (error) {
      console.error(error);
      window.showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-5 rounded-xl shadow-xl border border-slate-100 w-full max-w-sm animate-in zoom-in-95 duration-300 flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 shrink-0">
          <div>
            <h3 className="font-black uppercase italic tracking-tight text-sm text-slate-800">
              Tarik Saldo (Prive)
            </h3>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">
              {rekening.nama_rekening}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors font-bold active:scale-95"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5">
              Nominal Penarikan
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5">
              Keterangan
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
              placeholder="Contoh: Keperluan pribadi / Prive"
              rows="2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Tarik Saldo"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawRekeningModal;
