import React from "react";

const ModalPelunasan = ({
  isOpen,
  onClose,
  selectedItem,
  form,
  setForm,
  rekenings,
  loading,
  handleSubmit,
  formatRupiah,
  handleNominalChange,
}) => {
  if (!isOpen || !selectedItem) return null;

  const isPiutang = selectedItem.type === "piutang";
  const themeColor = isPiutang ? "emerald" : "rose";

  const idRef = isPiutang ? selectedItem.outbound_id : selectedItem.inbound_id;
  const pihak = isPiutang
    ? selectedItem.nama_channel
    : selectedItem.nama_supplier || selectedItem.supplier_name || "Tanpa Nama";
  const total = isPiutang
    ? parseFloat(selectedItem.total_tagihan)
    : parseFloat(
        selectedItem.total_hutang || selectedItem.total_kewajiban || 0,
      );
  const terbayar = parseFloat(selectedItem.total_terbayar || 0);
  const sisa = total - terbayar;

  const selectedAccount = rekenings.find((r) => r.id == form.rekening_id);
  const accountBalance = selectedAccount
    ? parseFloat(selectedAccount.saldo_sekarang)
    : 0;
  const isInsufficientBalance =
    !isPiutang &&
    selectedAccount &&
    accountBalance < (parseFloat(form.nominal) || 0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 text-slate-900">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 bg-slate-50 text-center">
          <h3 className="font-black italic uppercase text-lg text-slate-800 tracking-widest">
            Pelunasan{" "}
            <span className={`text-${themeColor}-600`}>
              {isPiutang ? "Piutang" : "Hutang"}
            </span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
            ID REF: #{idRef} - {pihak}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div className="col-span-full grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">
                Total Tagihan
              </span>
              <span className="text-xs font-bold text-slate-700">
                {formatRupiah(total)}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-right">
              <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">
                Sisa Tagihan
              </span>
              <span className={`text-xs font-black text-${themeColor}-600`}>
                {formatRupiah(sisa)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
              No WhatsApp Notifikasi
            </label>
            <input
              type="text"
              value={form.no_hp || ""}
              onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              placeholder="0812..."
              className={`w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg font-bold text-xs md:text-sm outline-none focus:border-${themeColor}-500 transition-all shadow-sm`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
              Pilih Rekening
            </label>
            <select
              value={form.rekening_id}
              onChange={(e) =>
                setForm({ ...form, rekening_id: e.target.value })
              }
              className={`w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg font-bold text-xs md:text-sm outline-none focus:border-${themeColor}-500 transition-all shadow-sm`}
              required
            >
              <option value="">-- Pilih Rekening Dana --</option>
              {rekenings
                .filter(
                  (r) =>
                    !["Piutang", "Hutang", "MP Escrow"].includes(
                      r.tipe_rekening,
                    ),
                )
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_rekening} ({formatRupiah(r.saldo_sekarang)})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
              Nominal Bayar
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={new Intl.NumberFormat("id-ID").format(form.nominal || 0)}
                onChange={handleNominalChange}
                className={`w-full bg-slate-50 border border-slate-200 py-1.5 pl-8 pr-3 rounded-lg font-black text-xs md:text-sm text-${themeColor}-600 outline-none focus:border-${themeColor}-500 transition-all shadow-inner`}
                required
              />
            </div>
          </div>

          {selectedAccount && (
            <div className="col-span-full bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center mt-1">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter leading-none">
                  Saldo Tersedia
                </span>
                <span className="text-[10px] font-bold text-slate-200 truncate max-w-[150px]">
                  {selectedAccount.nama_rekening}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs md:text-sm font-black italic ${accountBalance <= 0 ? "text-rose-500" : "text-emerald-400"}`}
                >
                  {formatRupiah(accountBalance)}
                </span>
                {!isPiutang &&
                  accountBalance < (parseFloat(form.nominal) || 0) && (
                    <div className="text-[7px] text-rose-500 font-bold uppercase tracking-tighter leading-none mt-0.5 animate-pulse">
                      Saldo Tidak Cukup!
                    </div>
                  )}
              </div>
            </div>
          )}

          <div className="col-span-full flex justify-end gap-2 mt-2 md:mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 text-slate-500 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || isInsufficientBalance}
              className={`px-3 py-2 bg-${themeColor}-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-${themeColor}-700 active:scale-95 transition-all disabled:opacity-50`}
            >
              {loading ? "Memproses..." : "Konfirmasi Bayar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPelunasan;
