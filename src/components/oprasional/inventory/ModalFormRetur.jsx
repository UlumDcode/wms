import React from "react";

const ModalFormRetur = ({
  showReturModal,
  setShowReturModal,
  selectedItem,
  submitRetur,
  maxReturQty,
  setMaxReturQty,
  formRetur,
  setFormRetur,
  inboundTrxList,
  loading,
}) => {
  if (!showReturModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-slate-100 p-5 md:p-8 animate-in zoom-in-95 duration-300">
        <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1 text-slate-800">
          Form <span className="text-rose-500">Retur</span>
        </h3>
        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-3">
          {selectedItem?.nama_barang} (Stok: {selectedItem?.stok} Pcs)
        </p>
        <form onSubmit={submitRetur}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* KOLOM KIRI */}
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">
                  Jumlah Retur (Pcs)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={maxReturQty}
                  placeholder={`Maksimal ${maxReturQty} Pcs`}
                  className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-black text-xl text-rose-500 border border-slate-100 focus:border-rose-500 outline-none transition-all"
                  value={formRetur.qty_retur}
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) {
                      setFormRetur({ ...formRetur, qty_retur: "" });
                      return;
                    }
                    if (val > maxReturQty) val = maxReturQty;
                    if (val < 1) val = 1;
                    setFormRetur({
                      ...formRetur,
                      qty_retur: val,
                    });
                  }}
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">
                  Pilih Sumber (Otomatis Isi Supplier)
                </label>
                <select
                  className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs text-slate-800 border border-slate-100 focus:border-rose-500 outline-none transition-all cursor-pointer mb-2"
                  value={formRetur.id_transaksi || ""}
                  onChange={(e) => {
                    const trxId = e.target.value;
                    const trxData = inboundTrxList.find(
                      (p) => p.id_transaksi === trxId,
                    );

                    let suplierName = "";
                    let maxQty = selectedItem?.stok || 1;

                    if (trxData) {
                      suplierName = trxData.customer || "";
                      maxQty = Math.min(
                        selectedItem?.stok,
                        parseInt(trxData.sisa_retur || maxQty),
                      );
                    } else {
                      suplierName = "";
                      maxQty = selectedItem?.stok || 1;
                    }

                    setMaxReturQty(maxQty);

                    let currentQty = parseInt(formRetur.qty_retur) || "";
                    if (currentQty > maxQty) currentQty = maxQty.toString();

                    setFormRetur({
                      ...formRetur,
                      id_transaksi: trxId,
                      // supplier: suplierName, // Dihapus sesuai permintaan agar tidak auto-fill model HPP
                      qty_retur: currentQty,
                    });
                  }}
                >
                  <option value="">-- Ketik Manual di Bawah --</option>
                  {inboundTrxList
                    .filter(
                      (trx) =>
                        parseInt(trx.inventory_id) ===
                        parseInt(selectedItem?.id),
                    )
                    .map((trx) => {
                      const sisa = Math.min(
                        selectedItem?.stok,
                        parseInt(trx.sisa_retur),
                      );
                      return (
                        <option key={trx.id_transaksi} value={trx.id_transaksi}>
                          {trx.origin_po
                            ? `PO: ${trx.origin_po}`
                            : `TRX: ${trx.id_transaksi}`}{" "}
                          - {trx.customer || "Tanpa Nama"} (Maks: {sisa} Pcs)
                        </option>
                      );
                    })}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Ketik Nama Supplier / Penjahit..."
                  className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs text-slate-800 border border-slate-100 focus:border-rose-500 outline-none transition-all"
                  value={formRetur.supplier}
                  onChange={(e) =>
                    setFormRetur({ ...formRetur, supplier: e.target.value })
                  }
                />
              </div>
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-4 flex flex-col">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">
                  Opsi Kompensasi
                </label>
                <select
                  className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs text-slate-800 border border-slate-100 focus:border-rose-500 outline-none transition-all cursor-pointer"
                  value={formRetur.opsi_kompensasi}
                  onChange={(e) =>
                    setFormRetur({
                      ...formRetur,
                      opsi_kompensasi: e.target.value,
                    })
                  }
                >
                  <option value="Ganti Barang">
                    Ganti Barang (Stok Kembali)
                  </option>
                  <option value="Refund Cash">
                    Refund Tunai (Stok Tetap Hilang)
                  </option>
                </select>
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">
                  Alasan Detail (Opsional)
                </label>
                <textarea
                  rows="4"
                  placeholder="Cacat produksi, sleting rusak, dll..."
                  className="w-full flex-1 bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs text-slate-800 border border-slate-100 focus:border-rose-500 outline-none transition-all resize-none"
                  value={formRetur.alasan}
                  onChange={(e) =>
                    setFormRetur({ ...formRetur, alasan: e.target.value })
                  }
                ></textarea>
              </div>
            </div>
          </div>
          <div className="flex gap-2.5 pt-4 md:pt-5 border-t border-slate-100 mt-5 md:mt-6">
            <button
              type="button"
              onClick={() => setShowReturModal(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-rose-500 hover:bg-rose-600 text-white py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-md active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? "PROSES..." : "TARIK STOK"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalFormRetur;
