import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";

const TopupDepositModal = ({
  isOpen,
  onClose,
  selectedReseller,
  rekeningList,
  onSuccess,
}) => {
  const [nominal, setNominal] = useState("");
  const [rekeningId, setRekeningId] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setNominal("");
      setRekeningId("");
    }
  }, [isOpen]);

  if (!isOpen || !selectedReseller) return null;

  // Auto-format input menjadi format Rupiah
  const handleNominalChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val) {
      setNominal("Rp " + new Intl.NumberFormat("id-ID").format(val));
    } else {
      setNominal("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean string format Rupiah murni menjadi angka (integer)
    const cleanNominal = parseInt(nominal.replace(/\D/g, "")) || 0;

    if (cleanNominal <= 0) {
      return window.showToast(
        "Nominal Topup tidak boleh kosong atau 0!",
        "warning",
      );
    }
    if (!rekeningId) {
      return window.showToast(
        "Pilih Rekening Tujuan / Sumber Uang!",
        "warning",
      );
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "finance/deposit_reseller.php?action=topup",
        {
          channel_id: selectedReseller.id,
          id_rekening: parseInt(rekeningId),
          nominal: cleanNominal,
        }
      );

      const data = res.data;

      if (data.status === "success") {
        window.showToast(
          `Topup Rp ${cleanNominal.toLocaleString("id-ID")} Berhasil!`,
          "success",
        );
        onSuccess(); // Trigger refresh data di parent
        onClose(); // Tutup modal
      } else {
        window.showToast(
          "Gagal: " + (data.message || "Terjadi kesalahan"),
          "error",
        );
      }
    } catch (err) {
      window.showToast("Server Error / Koneksi Terputus", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 text-slate-900">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 text-center">
          <h3 className="font-black italic uppercase text-lg text-slate-800 tracking-widest">
            Topup Deposit
          </h3>
          <p className="text-xs font-bold text-blue-600 mt-1 uppercase">
            {selectedReseller.nama_channel}
          </p>
          <p className="text-[10px] font-bold text-slate-500 mt-1">
            Saldo saat ini: Rp{" "}
            {parseFloat(
              selectedReseller.saldo_deposit ??
              selectedReseller.saldo_titipan ??
              0,
            ).toLocaleString("id-ID")}
          </p>
        </div>

        {/* BODY / FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Nominal Topup
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Rp 0"
              value={nominal}
              onChange={handleNominalChange}
              className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg font-black text-sm text-blue-600 outline-none focus:border-blue-500 transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Pilih Rekening (Masuk)
            </label>
            <select
              value={rekeningId}
              onChange={(e) => setRekeningId(e.target.value)}
              className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm outline-none focus:border-blue-500 transition-all shadow-sm"
            >
              <option value="" disabled>
                -- Pilih Rekening --
              </option>
              {rekeningList.map((rek) => (
                <option key={rek.id} value={rek.id}>
                  {rek.nama_rekening} - {rek.tipe_rekening}
                </option>
              ))}
            </select>
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Menyimpan..." : "Simpan Topup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TopupDepositModal;
