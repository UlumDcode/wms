import React from "react";

const ModalDetailRetur = ({
  selectedReturDetail,
  setSelectedReturDetail,
  refundRekeningId,
  setRefundRekeningId,
  rekenings,
  refundNominal,
  setRefundNominal,
  formatRupiah,
  handleSelesaikanRetur,
}) => {
  if (!selectedReturDetail) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex justify-center items-end md:items-center p-4 animate-in fade-in slide-in-from-bottom-10">
      <div className="bg-white w-full max-w-md p-4 md:p-6 rounded-[1.25rem] md:rounded-[2rem] shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
        <button
          onClick={() => setSelectedReturDetail(null)}
          className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full font-bold transition-all text-xs"
        >
          ✕
        </button>
        <div className="border-b border-slate-100 pb-3 mb-4 pr-8">
          <h3 className="text-lg font-black italic uppercase text-slate-800 leading-none">
            Detail Retur
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            ID Transaksi: {selectedReturDetail.id}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="col-span-2">
            <p className="text-[8px] uppercase font-black text-slate-400">
              Produk Terkait
            </p>
            <p className="text-xs font-black text-slate-800 uppercase leading-tight mt-0.5">
              {selectedReturDetail.nama_barang}
            </p>
          </div>
          <div>
            <p className="text-[8px] uppercase font-black text-slate-400">
              Tanggal Lapor
            </p>
            <p className="text-[10px] font-bold text-slate-800 mt-0.5">
              {new Date(selectedReturDetail.tanggal_retur).toLocaleString(
                "id-ID",
              )}
            </p>
          </div>
          <div>
            <p className="text-[8px] uppercase font-black text-slate-400">
              Status
            </p>
            <span
              className={`inline-block mt-0.5 px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest ${selectedReturDetail.status === "Selesai" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
            >
              {selectedReturDetail.status}
            </span>
          </div>
          <div>
            <p className="text-[8px] uppercase font-black text-slate-400">
              Supplier
            </p>
            <p className="text-[10px] font-bold text-rose-600 uppercase mt-0.5">
              {selectedReturDetail.supplier || "-"}
            </p>
          </div>
          <div>
            <p className="text-[8px] uppercase font-black text-slate-400">
              Qty Ditarik
            </p>
            <p className="text-[10px] font-black text-rose-600 mt-0.5">
              {selectedReturDetail.qty_retur} Pcs
            </p>
          </div>
          <div className="col-span-2 border-t border-slate-200 pt-3 mt-1">
            <p className="text-[8px] uppercase font-black text-slate-400">
              Pilihan Kompensasi
            </p>
            <p className="text-[10px] font-black text-blue-600 uppercase mt-0.5">
              {selectedReturDetail.opsi_kompensasi}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[8px] uppercase font-black text-slate-400">
              Alasan Detail
            </p>
            <p className="text-[10px] font-bold text-slate-600 mt-0.5 italic bg-white p-3 rounded-xl border border-slate-200 min-h-[40px] leading-relaxed">
              {selectedReturDetail.alasan || "Tidak ada alasan detail."}
            </p>
          </div>
        </div>

        {selectedReturDetail.status === "Pending" && (
          <div className="w-full mt-4 pt-3 border-t border-slate-200">
            {selectedReturDetail.opsi_kompensasi === "Refund Cash" && (
              <div className="mb-4 bg-emerald-50 p-3 md:p-4 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">
                  Detail Refund Uang
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                      Masuk Ke Rekening
                    </label>
                    <select
                      value={refundRekeningId}
                      onChange={(e) => setRefundRekeningId(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg font-bold text-xs outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Pilih Rekening --</option>
                      {rekenings
                        .filter(
                          (r) =>
                            !["Piutang", "Hutang", "MP Escrow"].includes(
                              r.tipe_rekening,
                            ),
                        )
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nama_rekening}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">
                      Nominal Refund
                    </label>
                    <input
                      type="text"
                      placeholder="Rp 0"
                      value={refundNominal}
                      onChange={(e) =>
                        setRefundNominal(formatRupiah(e.target.value))
                      }
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg font-bold text-xs outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() =>
                handleSelesaikanRetur(
                  selectedReturDetail.id,
                  selectedReturDetail.opsi_kompensasi,
                )
              }
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 md:py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-all mt-2"
            >
              Selesaikan Retur Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalDetailRetur;
