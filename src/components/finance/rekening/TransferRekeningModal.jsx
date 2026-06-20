import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";

const TransferRekeningModal = ({ isOpen, onClose, rekenings, onSuccess }) => {
  const [transferForm, setTransferForm] = useState({
    from_rekening_id: "",
    to_rekening_id: "",
    nominal: "",
    keterangan: "Pindah Saldo",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTransferForm({
        from_rekening_id: "",
        to_rekening_id: "",
        nominal: "",
        keterangan: "Pindah Saldo",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatRupiah = (val) => {
    if (!val) return "";
    return "Rp " + new Intl.NumberFormat("id-ID").format(val);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (transferForm.from_rekening_id === transferForm.to_rekening_id) {
      return window.showToast(
        "Rekening asal dan tujuan tidak boleh sama!",
        "warning",
      );
    }
    if (!transferForm.nominal) {
      return window.showToast("Nominal wajib diisi!", "warning");
    }

    setLoading(true);
    try {
      const payload = {
        ...transferForm,
        nominal: parseFloat(transferForm.nominal.replace(/\D/g, "")),
      };
      const res = await axiosInstance.post(
        "finance/rekening.php?action=transfer",
        payload
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast("Mutasi antar rekening berhasil!", "success");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-5 rounded-xl shadow-xl border border-slate-100 w-full max-w-3xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <h3 className="font-bold uppercase italic text-base mb-4 border-b border-slate-100 pb-3 text-slate-800 shrink-0">
          Mutasi <span className="text-blue-600">Internal</span>
        </h3>

        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
          <form
            id="transferForm"
            onSubmit={handleTransfer}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1 tracking-wider">
                Dari Rekening (Sumber)
              </label>
              <select
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg font-semibold text-sm outline-none border border-slate-200 focus:border-blue-500 transition-all cursor-pointer shadow-sm text-slate-800"
                value={transferForm.from_rekening_id}
                onChange={(e) =>
                  setTransferForm({
                    ...transferForm,
                    from_rekening_id: e.target.value,
                  })
                }
                required
              >
                <option value="">-- Pilih Rekening Sumber --</option>
                {rekenings
                  .filter(
                    (r) => !["Piutang", "Hutang"].includes(r.tipe_rekening),
                  )
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama_rekening} (Saldo: {formatRupiah(r.saldo_sekarang)}
                      )
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1 tracking-wider">
                Ke Rekening (Tujuan)
              </label>
              <select
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg font-semibold text-sm outline-none border border-slate-200 focus:border-blue-500 transition-all cursor-pointer shadow-sm text-slate-800"
                value={transferForm.to_rekening_id}
                onChange={(e) =>
                  setTransferForm({
                    ...transferForm,
                    to_rekening_id: e.target.value,
                  })
                }
                required
              >
                <option value="">-- Pilih Rekening Tujuan --</option>
                {rekenings
                  .filter(
                    (r) => !["Piutang", "Hutang"].includes(r.tipe_rekening),
                  )
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama_rekening}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1 tracking-wider">
                Nominal Transfer
              </label>
              <input
                type="text"
                placeholder="Rp 0"
                className="w-full bg-emerald-50 text-emerald-700 px-3 py-2.5 rounded-lg font-semibold text-sm outline-none border border-emerald-200 focus:border-emerald-500 transition-all shadow-sm"
                value={
                  transferForm.nominal ? formatRupiah(transferForm.nominal) : ""
                }
                onChange={(e) =>
                  setTransferForm({
                    ...transferForm,
                    nominal: e.target.value.replace(/\D/g, ""),
                  })
                }
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1 tracking-wider">
                Keterangan
              </label>
              <input
                type="text"
                placeholder="Catatan..."
                className="w-full bg-slate-50 px-3 py-2.5 rounded-lg font-semibold text-sm outline-none border border-slate-200 focus:border-blue-500 transition-all shadow-sm"
                value={transferForm.keterangan}
                onChange={(e) =>
                  setTransferForm({
                    ...transferForm,
                    keterangan: e.target.value,
                  })
                }
                required
              />
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
            form="transferForm"
            disabled={loading}
            className="px-6 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all disabled:opacity-50 hover:bg-blue-700"
          >
            {loading ? "Memproses..." : "Transfer Saldo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferRekeningModal;
