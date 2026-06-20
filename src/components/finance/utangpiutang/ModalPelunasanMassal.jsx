import React, { useEffect } from "react";

const ModalPelunasanMassal = ({
  showMassPayModal,
  setShowMassPayModal,
  activeTab,
  handleMassPaySubmit,
  massPayPihak,
  setMassPayPihak,
  massPayNoHp,
  setMassPayNoHp,
  uniquePihak,
  massPayTotal,
  formatRupiah,
  massPayRekening,
  setMassPayRekening,
  massPayNominal,
  setMassPayNominal,
  rekenings,
  loading,
}) => {
  if (!showMassPayModal) return null;

  const isPiutang = activeTab === "piutang";
  const themeColor = isPiutang ? "emerald" : "rose";

  const selectedAccount = rekenings.find((r) => r.id == massPayRekening);
  const accountBalance = selectedAccount
    ? parseFloat(selectedAccount.saldo_sekarang)
    : 0;

  // AUTO-FILL NOMINAL JIKA SALDO MENCUKUPI
  useEffect(() => {
    if (
      showMassPayModal &&
      massPayRekening &&
      massPayTotal > 0 &&
      !massPayNominal
    ) {
      // Jika Saldo Rekening >= Total Tagihan, isi otomatis
      if (accountBalance >= massPayTotal) {
        const formatted =
          "Rp " + new Intl.NumberFormat("id-ID").format(massPayTotal);
        setMassPayNominal(formatted);
      }
    }
  }, [massPayRekening, massPayPihak, massPayTotal, showMassPayModal]);

  const cleanNominal =
    parseFloat(massPayNominal?.toString().replace(/\D/g, "")) || 0;
  const isInsufficientBalance =
    !isPiutang && selectedAccount && accountBalance < cleanNominal;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 text-slate-900">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 text-center">
          <h3 className="font-black italic uppercase text-lg text-slate-800 tracking-widest">
            Pelunasan <span className={`text-${themeColor}-600`}>Massal</span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Metode Lump Sum (FIFO Distribution) -{" "}
            {isPiutang ? "Penerimaan Piutang" : "Pembayaran Hutang"}
          </p>
        </div>

        {/* BODY / FORM */}
        <form
          onSubmit={handleMassPaySubmit}
          className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
              Pilih {activeTab === "piutang" ? "Customer" : "Supplier"}
            </label>
            <select
              value={massPayPihak}
              onChange={(e) => setMassPayPihak(e.target.value)}
              className={`w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg font-bold text-xs md:text-sm outline-none focus:border-${themeColor}-500 transition-all shadow-sm`}
              required
            >
              <option value="">-- Pilih Pihak / Perusahaan --</option>
              {uniquePihak.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
              No WhatsApp Notifikasi
            </label>
            <input
              type="text"
              value={massPayNoHp}
              onChange={(e) => setMassPayNoHp(e.target.value)}
              placeholder="0812..."
              className={`w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg font-bold text-xs md:text-sm outline-none focus:border-${themeColor}-500 transition-all shadow-sm`}
            />
          </div>

          {massPayPihak ? (
            <>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center h-fit self-end mb-0.5">
                <span className="text-[9px] font-black uppercase text-slate-400">
                  Total Tagihan
                </span>
                <span
                  className={`text-xs md:text-sm font-black text-${themeColor}-600`}
                >
                  {formatRupiah(massPayTotal)}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1 tracking-widest">
                  Jumlah yang Dibayar Sekarang
                </label>
                <input
                  type="text"
                  value={massPayNominal}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setMassPayNominal(
                      val
                        ? "Rp " + new Intl.NumberFormat("id-ID").format(val)
                        : "",
                    );
                  }}
                  placeholder="Ketik jumlah bayar..."
                  className={`w-full bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg font-black text-xs md:text-sm text-${themeColor}-600 outline-none focus:border-${themeColor}-500 transition-all shadow-inner`}
                  required
                />
                <p className="text-[8px] text-slate-400 mt-1 italic">
                  * Pembayaran otomatis ke invoice tertua (FIFO)
                </p>
              </div>
            </>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
              Dari / Ke Rekening
            </label>
            <select
              value={massPayRekening}
              onChange={(e) => setMassPayRekening(e.target.value)}
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
                    {r.nama_rekening} ({r.tipe_rekening})
                  </option>
                ))}
            </select>
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
                  accountBalance <
                    (parseFloat(massPayNominal.replace(/\D/g, "")) || 0) && (
                    <div className="text-[7px] text-rose-500 font-bold uppercase tracking-tighter leading-none mt-0.5 animate-pulse">
                      Saldo Tidak Cukup!
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="col-span-full flex justify-end gap-2 mt-2 md:mt-4">
            <button
              type="button"
              onClick={() => {
                setShowMassPayModal(false);
                setMassPayPihak("");
                setMassPayRekening("");
                setMassPayNoHp("");
              }}
              className="px-3 py-2 bg-slate-100 text-slate-500 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !massPayPihak ||
                !massPayNominal ||
                isInsufficientBalance
              }
              className={`px-3 py-2 bg-${themeColor}-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-${themeColor}-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {loading
                ? "Memproses..."
                : isPiutang
                  ? "Terima Piutang"
                  : "Bayar Hutang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPelunasanMassal;
