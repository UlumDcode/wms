import React from "react";
import Pagination from "../../Pagination";
import FotoBarang from "../../FotoBarang";

const TabStock = ({
  inventoryItems,
  API_URL,
  setZoomedImage,
  setSelectedItem,
  setInputQty,
  setTotalBiaya,
  setSupplier,
  setSelectedPo,
  setRekeningId,
  setNominalBayar,
  setShowModal,
  setMaxReturQty,
  setFormRetur,
  setShowReturModal,
  totalData,
  limit,
  setLimit,
  page,
  setPage,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-full">
      <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
              <th className="p-4">Nama Barang / Kode</th>
              <th className="p-4 text-center">Stok Saat Ini</th>
              <th className="p-4 text-center">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {inventoryItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-all">
                <td className="p-2.5 md:p-4 max-w-[140px] md:max-w-none">
                  <div className="flex items-center gap-3">
                    <FotoBarang
                      foto={item.foto}
                      apiUrl={API_URL}
                      containerClass="w-8 h-8 bg-slate-50 rounded-lg border border-slate-100 shrink-0 flex items-center justify-center overflow-hidden relative shadow-sm"
                      iconClass="text-xs opacity-40"
                      onClick={() =>
                        setZoomedImage(item.foto ? `${API_URL}/uploads/${item.foto}` : "no-image")
                      }
                    />
                    <div className="overflow-hidden">
                      <div className="text-[9px] md:text-xs font-black uppercase italic text-slate-800 line-clamp-2 leading-tight">
                        {item.nama_barang}
                      </div>
                      <div className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">
                        {item.kode_barang} | Size {item.size}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-2 md:p-4 text-center font-black text-sm md:text-xl text-slate-800 w-[50px] md:w-auto">
                  {item.stok}{" "}
                  <span className="text-[7px] md:text-[10px] text-slate-400 block sm:inline">
                    Pcs
                  </span>
                </td>
                <td className="p-2 md:p-4 text-center w-[70px] sm:w-[120px] md:w-auto">
                  <div className="flex flex-col sm:flex-row gap-1 md:gap-1.5 justify-center">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setInputQty("");
                        setTotalBiaya("");
                        setSupplier("");
                        setSelectedPo("");
                        setRekeningId("");
                        setNominalBayar("");
                        setShowModal(true);
                      }}
                      className="bg-emerald-500 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-md md:rounded-lg font-black text-[7px] md:text-[9px] uppercase shadow-sm active:scale-95 transition-all w-full sm:w-auto"
                    >
                      + Inb
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setMaxReturQty(item.stok);
                        setFormRetur({
                          id_transaksi: "",
                          qty_retur: "",
                          supplier: "",
                          alasan: "",
                          opsi_kompensasi: "Ganti Barang",
                        });
                        setShowReturModal(true);
                      }}
                      className="bg-rose-100 text-rose-600 px-2 py-1.5 md:px-3 md:py-2 rounded-md md:rounded-lg font-black text-[7px] md:text-[9px] uppercase shadow-sm hover:bg-rose-200 active:scale-95 transition-all w-full sm:w-auto"
                    >
                      - Ret
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        totalData={totalData}
        limit={limit}
        onLimitChange={setLimit}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
};

export default TabStock;
