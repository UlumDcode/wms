import React, { useState, useEffect } from "react";

const ReturConditionModal = ({
  isOpen,
  onClose,
  order,
  onSubmit,
  rekeningList = [],
}) => {
  const [claimMode, setClaimMode] = useState(null);
  const [isClaimFull, setIsClaimFull] = useState(true);
  const [claimNominal, setClaimNominal] = useState("");
  const [selectedRekening, setSelectedRekening] = useState("");

  // Reset state setiap kali modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setClaimMode(null);
      setIsClaimFull(true);
      setClaimNominal("");
      setSelectedRekening("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-slate-100">
        <h3 className="text-xl md:text-2xl font-black italic uppercase text-slate-800 mb-1">
          Kondisi <span className="text-amber-500">Retur</span>
        </h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-3">
          INV: {order?.no_invoice}
        </p>

        {claimMode === null ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSubmit({ status: "Retur Selesai" })}
                className="col-span-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-2 border-emerald-200 p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center transition-all group active:scale-95"
              >
                <span className="text-xl md:text-2xl mb-1.5 md:mb-2">📥</span>
                <span className="font-black uppercase text-[9px] md:text-[10px] tracking-widest">
                  Normal & Masuk Gudang
                </span>
              </button>

              <button
                onClick={() => setClaimMode("Claim MP")}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-blue-200 p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center transition-all group active:scale-95"
              >
                <span className="text-xl md:text-2xl mb-1.5 md:mb-2">🛡️</span>
                <span className="font-black uppercase text-[9px] md:text-[10px] tracking-widest text-center leading-tight">
                  Claim
                  <br />
                  MP
                </span>
              </button>

              <button
                onClick={() => setClaimMode("Claim Ekspedisi")}
                className="bg-purple-50 hover:bg-purple-100 text-purple-600 border-2 border-purple-200 p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center transition-all group active:scale-95"
              >
                <span className="text-xl md:text-2xl mb-1.5 md:mb-2">🚚</span>
                <span className="font-black uppercase text-[9px] md:text-[10px] tracking-widest text-center leading-tight">
                  Claim
                  <br />
                  Ekspedisi
                </span>
              </button>

              <button
                onClick={() => onSubmit({ status: "Retur Loss" })}
                className="col-span-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border-2 border-rose-200 p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center transition-all group active:scale-95 mt-1 md:mt-2"
              >
                <span className="text-xl md:text-2xl mb-1.5 md:mb-2">❌</span>
                <span className="font-black uppercase text-[9px] md:text-[10px] tracking-widest">
                  Retur Loss (Rugi/Ikhlas)
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase transition-all mt-5 tracking-widest"
            >
              Batal
            </button>
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Total Tagihan
              </span>
              <span className="text-sm font-black italic text-blue-600">
                Rp {parseFloat(order?.total_bayar || 0).toLocaleString("id-ID")}
              </span>
            </div>

            {claimMode === "Claim Ekspedisi" && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">
                  Rekening Tujuan
                </label>
                <select
                  value={selectedRekening}
                  onChange={(e) => setSelectedRekening(e.target.value)}
                  className="w-full bg-slate-50 p-3 rounded-xl font-bold text-xs outline-none border border-slate-100 focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Pilih Rekening --</option>
                  {rekeningList
                    .filter((r) => {
                      const tipe = (r.tipe_rekening || "").toLowerCase();
                      const nama = (r.nama_rekening || "").toLowerCase();

                      // NUKLIR: Buang semua yang berbau piutang atau escrow
                      if (tipe.includes("piutang") || nama.includes("piutang"))
                        return false;
                      if (tipe.includes("escrow") || nama.includes("escrow"))
                        return false;

                      // Sisanya (Cash, Bank/TF, QRIS) boleh tampil
                      return true;
                    })
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama_rekening}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="claimFull"
                checked={isClaimFull}
                onChange={(e) => setIsClaimFull(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="claimFull"
                className="text-[10px] font-black uppercase text-slate-600 tracking-widest cursor-pointer mt-0.5"
              >
                Claim Full (100%)
              </label>
            </div>

            {!isClaimFull && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">
                  Nominal Claim Cair
                </label>
                <input
                  type="number"
                  value={claimNominal}
                  onChange={(e) => setClaimNominal(e.target.value)}
                  placeholder="Masukkan nominal..."
                  className="w-full bg-slate-50 p-3 rounded-xl font-bold text-xs outline-none border border-slate-100 focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setClaimMode(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase transition-all tracking-widest"
              >
                ⬅ Kembali
              </button>
              <button
                onClick={() => {
                  if (claimMode === "Claim Ekspedisi" && !selectedRekening) {
                    return window.showToast
                      ? window.showToast(
                          "Pilih Rekening Tujuan dulu bro!",
                          "warning",
                        )
                      : alert("Pilih Rekening Tujuan dulu bro!");
                  }
                  if (!isClaimFull && !claimNominal) {
                    return window.showToast
                      ? window.showToast(
                          "Masukkan Nominal Claim nya bro!",
                          "warning",
                        )
                      : alert("Masukkan Nominal Claim nya bro!");
                  }
                  onSubmit({
                    status: claimMode,
                    rekening_id:
                      claimMode === "Claim Ekspedisi" ? selectedRekening : 0,
                    nominal_claim: isClaimFull
                      ? order?.total_bayar
                      : claimNominal,
                  });
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase transition-all tracking-widest shadow-lg shadow-blue-500/30"
              >
                Submit Claim
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturConditionModal;
