import React from "react";

const ModalHistoriCicilan = ({
  showHistoryModal,
  setShowHistoryModal,
  selectedItem,
  historyLoading,
  historyData,
  formatRupiah,
}) => {
  if (!showHistoryModal || !selectedItem) return null;

  const tagihan =
    selectedItem.type === "piutang"
      ? parseFloat(selectedItem.total_tagihan || 0)
      : parseFloat(
          selectedItem.total_kewajiban || selectedItem.total_hutang || 0,
        );
  const terbayar = parseFloat(selectedItem.total_terbayar || 0);
  const sisa = tagihan - terbayar;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-start mb-4 md:mb-6 border-b border-slate-100 pb-3 md:pb-4">
          <div>
            <h3 className="font-black uppercase italic text-sm md:text-base text-slate-800">
              Histori Pembayaran{" "}
              <span
                className={
                  selectedItem.type === "piutang"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              >
                {selectedItem.outbound_id || selectedItem.inbound_id}
              </span>
            </h3>
            <div className="mt-2">
              <span
                className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${sisa <= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
              >
                SISA TAGIHAN: {formatRupiah(sisa)} {sisa <= 0 && "✓ LUNAS"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowHistoryModal(false)}
            className="text-slate-400 hover:text-rose-500 font-bold p-1 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1 mb-4">
          {historyLoading ? (
            <div className="p-10 text-center font-bold text-xs text-slate-400 uppercase tracking-widest animate-pulse">
              Memuat histori...
            </div>
          ) : historyData.length > 0 ? (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Tanggal
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Keterangan
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Rekening
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 text-right">
                    Nominal
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((h) => (
                  <tr
                    key={h.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-l border-slate-100 rounded-l-xl text-[7px] md:text-[9px] font-bold text-slate-500 whitespace-nowrap">
                      {h.tanggal}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 max-w-[150px]">
                      <div className="text-[8px] md:text-[10px] font-black text-slate-800 truncate tracking-tight">
                        {h.keterangan}
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 max-w-[100px]">
                      <div className="text-[8px] md:text-[10px] font-black text-blue-600 truncate">
                        {h.nama_rekening}
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-r border-slate-100 rounded-r-xl text-right">
                      <div className="text-[9px] md:text-[11px] font-black text-emerald-600 whitespace-nowrap">
                        {formatRupiah(h.nominal)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center font-bold text-xs text-slate-400 uppercase tracking-widest italic">
              Belum ada histori pelunasan pada nota ini
            </div>
          )}
        </div>

        <button
          onClick={() => setShowHistoryModal(false)}
          className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ModalHistoriCicilan;
