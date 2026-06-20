import React from "react";
import Pagination from "../../Pagination";

const TabInbound = ({
  inboundTrxList,
  API_URL,
  setZoomedImage,
  inboundTotal,
  inboundLimit,
  setInboundLimit,
  inboundPage,
  setInboundPage,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-full">
      <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 p-2 md:p-4">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
              <th className="py-2 px-1 md:p-3">Transaksi</th>
              <th className="py-2 px-1 md:p-3">Produk / Asal</th>
              <th className="py-2 px-1 md:p-3 text-center">Qty Masuk</th>
            </tr>
          </thead>
          <tbody>
            {inboundTrxList.map((r) => (
              <tr
                key={r.id_transaksi}
                className="group hover:bg-slate-50 transition-colors"
              >
                <td className="p-2 md:p-3 rounded-l-xl bg-slate-50 border-y border-l border-slate-100 max-w-[100px] md:max-w-[180px]">
                  <div className="font-black text-slate-800 uppercase text-[8px] md:text-[10px] italic truncate">
                    {r.id_transaksi}
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-slate-400 mt-0.5 truncate">
                    {new Date(r.tanggal).toLocaleDateString("id-ID")}
                  </div>
                </td>
                <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white rounded-md border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden relative">
                      <span className="text-[10px] opacity-30">📦</span>
                      {r.foto && (
                        <img
                          src={`${API_URL}/uploads/${r.foto}`}
                          className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
                          onClick={() =>
                            setZoomedImage(`${API_URL}/uploads/${r.foto}`)
                          }
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                    </div>
                    <div className="text-[9px] md:text-xs font-black text-slate-700 truncate flex-1">
                      {r.nama_barang}
                    </div>
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                    {r.customer || "Tanpa Nama"} | PO: {r.origin_po || "-"}
                  </div>
                </td>
                <td className="p-2 md:p-3 bg-slate-50 border-y border-r border-slate-100 rounded-r-xl text-center">
                  <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md text-[9px] font-black tracking-widest inline-block">
                    +{r.qty_masuk}
                  </span>
                </td>
              </tr>
            ))}
            {inboundTrxList.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                    Belum ada data inbound
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        totalData={inboundTotal}
        limit={inboundLimit}
        onLimitChange={setInboundLimit}
        currentPage={inboundPage}
        onPageChange={setInboundPage}
      />
    </div>
  );
};

export default TabInbound;
