import React from "react";
import Pagination from "../../Pagination";

const TabRetur = ({
  returHistory,
  API_URL,
  setZoomedImage,
  setRefundNominal,
  setRefundRekeningId,
  setSelectedReturDetail,
  handleSelesaikanRetur,
  returTotal,
  returLimit,
  setReturLimit,
  returPage,
  setReturPage,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-full">
      <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 p-2 md:p-4">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
              <th className="py-2 px-1 md:p-3">Produk/Tgl</th>
              <th className="py-2 px-1 md:p-3">Qty/Supplier</th>
              <th className="py-2 px-1 md:p-3 text-center">Status</th>
              <th className="py-2 px-1 md:p-3 text-center min-w-[70px]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {returHistory.map((r) => (
              <tr
                key={r.id}
                className="group hover:bg-slate-50 transition-colors"
              >
                <td className="p-2 md:p-3 rounded-l-xl bg-slate-50 border-y border-l border-slate-100 max-w-[80px] md:max-w-[150px]">
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
                    <div className="overflow-hidden">
                      <div className="font-black text-slate-800 uppercase text-[8px] md:text-[10px] italic truncate">
                        {r.nama_barang}
                      </div>
                      <div className="text-[7px] md:text-[9px] font-bold text-slate-400 mt-0.5 truncate">
                        {new Date(r.tanggal_retur).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 max-w-[80px] md:max-w-[150px]">
                  <div className="text-[9px] md:text-xs font-black text-rose-600">
                    {r.qty_retur} Pcs
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-widest truncate">
                    {r.supplier || "Tanpa Nama"}{" "}
                    <span className="hidden md:inline text-slate-300 mx-1">
                      |
                    </span>{" "}
                    <span className="md:hidden">
                      <br />
                    </span>
                    {r.opsi_kompensasi}
                  </div>
                </td>
                <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center w-[50px] md:w-auto">
                  {r.status === "Selesai" ? (
                    <span className="bg-emerald-100 text-emerald-600 px-1.5 py-1 md:px-3 md:py-1.5 rounded-full text-[6px] md:text-[9px] font-black uppercase tracking-widest block md:inline-block">
                      ✓ <span className="hidden md:inline">Selesai</span>
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-600 px-1.5 py-1 md:px-3 md:py-1.5 rounded-full text-[6px] md:text-[9px] font-black uppercase tracking-widest block md:inline-block">
                      ⏳ <span className="hidden md:inline">Pending</span>
                    </span>
                  )}
                </td>
                <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center w-[70px] md:w-auto">
                  <div className="flex flex-col gap-1 md:gap-1.5 justify-center">
                    <button
                      onClick={() => {
                        setRefundNominal("");
                        setRefundRekeningId("");
                        setSelectedReturDetail(r);
                      }}
                      className="bg-blue-50 text-blue-600 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-100 active:scale-95 transition-all w-full"
                    >
                      🔍 Detail
                    </button>
                    {r.status === "Pending" && (
                      <button
                        onClick={() => {
                          if (r.opsi_kompensasi === "Refund Cash") {
                            setRefundNominal("");
                            setRefundRekeningId("");
                            setSelectedReturDetail(r);
                          } else {
                            handleSelesaikanRetur(r.id, r.opsi_kompensasi);
                          }
                        }}
                        className="bg-emerald-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-emerald-600 active:scale-95 transition-all w-full"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {returHistory.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                    Belum ada data retur
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        totalData={returTotal}
        limit={returLimit}
        onLimitChange={setReturLimit}
        currentPage={returPage}
        onPageChange={setReturPage}
      />
    </div>
  );
};

export default TabRetur;
