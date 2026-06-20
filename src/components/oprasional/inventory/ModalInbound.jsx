import React from "react";

const ModalInbound = ({
  showModal,
  setShowModal,
  selectedItem,
  scanInput,
  setScanInput,
  processBarcode,
  startScan,
  selectedPo,
  handlePoSelect,
  activePOs,
  remainingPoQty,
  supplier,
  setSupplier,
  noHpSupplier,
  setNoHpSupplier,
  inputQty,
  setInputQty,
  totalBiaya,
  setTotalBiaya,
  formatRupiah,
  submitInbound,
  loading,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-slate-100 overflow-y-auto animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
        {/* KIRI: INFO PRODUK & SCANNER */}
        <div className="bg-emerald-500 p-5 md:p-8 text-white relative w-full md:w-5/12 flex flex-col shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black italic leading-none">
            INB
          </div>
          <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none relative z-10">
            Inbound
          </h3>
          <p className="text-[9px] md:text-[10px] font-bold mt-2 uppercase opacity-80 tracking-widest relative z-10">
            ID: AUTO | TGL: {new Date().toLocaleDateString("id-ID")}
          </p>

          <div className="bg-white/10 p-4 md:p-5 rounded-2xl border border-white/20 mt-6 md:mt-8 relative z-10">
            <p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest mb-2">
              Produk Terpilih
            </p>
            <p className="text-lg md:text-xl font-black text-white uppercase italic leading-tight">
              {selectedItem?.nama_barang}
            </p>
            <p className="text-[10px] md:text-[11px] font-bold text-emerald-200 mt-2">
              {selectedItem?.kode_barang} | Size {selectedItem?.size}
            </p>
          </div>

          <div className="mt-auto pt-6 relative z-10">
            <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-90">
              Scan Barcode (+1 Qty)
            </p>
            <div className="flex gap-1.5">
              <input
                autoFocus
                type="text"
                placeholder="Tembak scanner ke sini..."
                className="w-full bg-slate-900/40 text-white placeholder-emerald-200/50 p-3 rounded-xl font-bold text-[10px] md:text-xs outline-none focus:ring-2 focus:ring-white border border-white/20 transition-all"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    processBarcode(scanInput.trim());
                    setScanInput("");
                  }
                }}
              />
              <button
                onClick={startScan}
                title="Scan Pakai Kamera HP"
                className="bg-slate-900 text-white px-4 rounded-xl font-black flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-md"
              >
                📷
              </button>
            </div>
          </div>
        </div>

        {/* KANAN: FORM INPUT */}
        <div className="p-5 md:p-8 space-y-4 md:space-y-5 w-full md:w-7/12">
          {remainingPoQty !== null && (
            <div className="bg-blue-50 p-3 rounded-xl mb-2 flex justify-between items-center border border-blue-100 animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-blue-400 leading-none mb-1">
                  Sisa Kuota PO Ini
                </span>
                <span className="text-xs font-bold text-blue-800">
                  Harus masuk sesuai HPP
                </span>
              </div>
              <span className="text-xl font-black text-blue-600">
                {remainingPoQty}{" "}
                <span className="text-[10px] uppercase">Pcs</span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">
                Pilih PO (Tarik Dari HPP)
              </label>
              <select
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs text-slate-800 border border-slate-100 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-sm"
                value={activePOs.find((p) => p.no_po === selectedPo)?.id || ""}
                onChange={handlePoSelect}
              >
                <option value="">-- Inbound Bebas (Tanpa PO) --</option>
                {activePOs.map((po) => {
                  const sisa =
                    (parseFloat(po.qty_produksi) || 0) -
                    (parseFloat(po.qty_inbound_aktual) || 0);
                  return (
                    <option key={po.id} value={po.id}>
                      {po.no_po} - {po.nama_barang || po.produk} (Sisa:{" "}
                      {Math.max(0, sisa)} Pcs)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">
                Nama Vendor / Supplier (Opsional)
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs text-slate-800 border border-slate-100 focus:border-emerald-500 outline-none transition-all shadow-sm"
                placeholder="Vendor / Penjahit / Toko"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">
                Jumlah Masuk (Qty)
              </label>
              <input
                type="text"
                className={`w-full bg-slate-50 p-3 md:p-4 rounded-xl font-black text-xl md:text-2xl outline-none transition-all border ${remainingPoQty !== null && parseInt(inputQty) >= remainingPoQty ? "border-blue-400 text-blue-600" : "border-slate-100 text-slate-800 focus:border-emerald-500"}`}
                placeholder="0"
                value={inputQty}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  const numVal = parseInt(val || 0);

                  // Validasi: Cek jika ada PO terpilih dan input melebihi sisa kuota
                  if (remainingPoQty !== null && numVal > remainingPoQty) {
                    val = remainingPoQty.toString();
                    if (window.showToast) {
                      window.showToast(
                        `Batas input! Sisa kuota PO ini hanya ${remainingPoQty} Pcs`,
                        "warning",
                      );
                    }
                  }

                  setInputQty(val);
                  const hpp = selectedItem?.harga_beli
                    ? parseFloat(selectedItem.harga_beli)
                    : 0;
                  const autoTotal = parseInt(val || 0) * hpp;
                  setTotalBiaya(formatRupiah(autoTotal));
                }}
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-4 md:pt-5 border-t border-slate-100">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all"
            >
              Batal
            </button>
            <button
              onClick={submitInbound}
              disabled={loading}
              className="flex-[2] bg-slate-900 hover:bg-emerald-600 text-white py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-lg active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? "SAVING..." : "SIMPAN STOK KE GUDANG"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalInbound;
