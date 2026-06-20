import React from "react";

const MarketplaceModals = ({
  checkoutStep,
  tipeChannel,
  setCheckoutStep,
  storeScanInput,
  setStoreScanInput,
  handleStepStoreScan,
  selectedStore,
  setSelectedStore,
  filteredStores,
  startScanKamera,
  noResi,
  setNoResi,
  handleStepResiScan,
}) => {
  if (tipeChannel !== "Marketplace") return null;

  return (
    <>
      {/* MODAL ALUR MARKETPLACE - 1. TOKO */}
      {checkoutStep === "store" && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <h3 className="font-black italic uppercase text-xl mb-1 text-slate-800">
              1. Identitas <span className="text-blue-600">Toko</span>
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-3">
              Scan Barcode / Pilih Toko MP
            </p>

            <input
              autoFocus
              type="text"
              placeholder="Scan Barcode Toko..."
              className="w-full bg-blue-50 text-blue-600 p-3 md:p-4 rounded-xl font-black text-xs outline-none focus:ring-2 focus:ring-blue-500 mb-3 placeholder-blue-300"
              value={storeScanInput}
              onChange={(e) => setStoreScanInput(e.target.value)}
              onKeyDown={handleStepStoreScan}
            />
            <p className="text-center text-[9px] font-black text-slate-300 uppercase mb-3">
              - ATAU PILIH MANUAL -
            </p>
            <select
              className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs outline-none border border-slate-100 cursor-pointer focus:border-blue-500 transition-all"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <option value="">-- List Toko Sesuai Channel --</option>
              {filteredStores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_store}
                </option>
              ))}
            </select>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCheckoutStep(null)}
                className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black uppercase text-[9px]"
              >
                Batal
              </button>
              <button
                onClick={handleStepStoreScan}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[9px] shadow-lg"
              >
                Lanjut Resi ➔
              </button>
              <button
                onClick={() => startScanKamera("store")}
                className="bg-slate-900 text-white px-4 rounded-xl font-black text-[10px]"
              >
                📷
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ALUR MARKETPLACE - 2. RESI */}
      {checkoutStep === "resi" && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <h3 className="font-black italic uppercase text-xl mb-1 text-slate-800">
              2. Input <span className="text-blue-600">Resi</span>
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-3">
              Scan Barcode Resi / AWB
            </p>

            <input
              autoFocus
              type="text"
              placeholder="Tembak Scanner ke Resi..."
              className="w-full bg-blue-50 text-blue-600 p-3 md:p-4 rounded-xl font-black text-xs outline-none focus:ring-2 focus:ring-blue-500 uppercase placeholder-blue-300"
              value={noResi}
              onChange={(e) => setNoResi(e.target.value)}
              onKeyDown={handleStepResiScan}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCheckoutStep("store")}
                className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black uppercase text-[9px]"
              >
                ⬅ Kembali
              </button>
              <button
                onClick={handleStepResiScan}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[9px] shadow-lg"
              >
                Lanjut Bayar ➔
              </button>
              <button
                onClick={() => startScanKamera("resi")}
                className="bg-slate-900 text-white px-4 rounded-xl font-black text-[10px]"
              >
                📷
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketplaceModals;
