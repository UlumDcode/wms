import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";

const PayOperationalModal = ({ isOpen, onClose, rekening, fetchRekening }) => {
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [coaId, setCoaId] = useState("");
  const [coaList, setCoaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCoa, setLoadingCoa] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBebanCoa();
    }
  }, [isOpen]);

  const fetchBebanCoa = async () => {
    setLoadingCoa(true);
    try {
      const res = await axiosInstance.get("finance/coa.php?action=read");
      if (res.data && res.data.status === "success") {
        // Filter only Expense accounts (Beban) -> starts with '5' or type 'Expense'
        const bebanAccounts = res.data.data.filter(
          (c) => c.tipe_akun === "Expense" || c.kode_akun.startsWith("5")
        );
        setCoaList(bebanAccounts);
      }
    } catch (error) {
      console.error("Gagal load COA", error);
    } finally {
      setLoadingCoa(false);
    }
  };

  if (!isOpen || !rekening) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nominal || nominal <= 0) {
      window.showToast("Nominal pembayaran harus lebih dari 0", "warning");
      return;
    }
    if (!keterangan) {
      window.showToast("Keterangan wajib diisi!", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("finance/rekening.php?action=pay_operational", {
        rekening_id: rekening.id,
        nominal: parseFloat(nominal),
        keterangan: keterangan,
        coa_id: coaId || 0, // 0 will trigger fallback to Biaya Umum
      });
      if (res.data.status === "success") {
        window.showToast("Pembayaran operasional berhasil dicatat!", "success");
        fetchRekening();
        onClose();
        setNominal("");
        setKeterangan("");
        setCoaId("");
      } else {
        window.showToast(res.data.message || "Gagal melakukan pembayaran", "error");
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
              Bayar Operasional
            </h3>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5">
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
              Kategori Biaya
            </label>
            <select
              value={coaId}
              onChange={(e) => setCoaId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
            >
              <option value="">-- Pilih Kategori (Default: Biaya Umum) --</option>
              {coaList.map((coa) => (
                <option key={coa.id} value={coa.id}>
                  [{coa.kode_akun}] {coa.nama_akun}
                </option>
              ))}
            </select>
            {loadingCoa && <p className="text-[8px] text-slate-400 mt-1 italic">Memuat akun...</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5">
              Nominal Pembayaran
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5">
              Keterangan Biaya (Wajib)
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all resize-none"
              placeholder="Contoh: Bayar Listrik Bulan Ini, Beli Aqua Galon"
              rows="2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Bayar Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayOperationalModal;
