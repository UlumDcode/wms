import React from "react";
import FotoBarang from "../../FotoBarang";

const CatalogPanel = ({
  searchTerm,
  setSearchTerm,
  filteredItems,
  selectItemManual,
  API_URL,
  isLoading,
  setZoomedImage,
}) => {
  return (
    <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col overflow-hidden transition-colors duration-300">
      <div className="relative mb-2 md:mb-3 shrink-0">
        <input
          type="text"
          placeholder="🔍 Cari Manual (Nama/Kode)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 focus:border-blue-500 dark:focus:border-blue-500 p-2 md:p-2.5 rounded-lg font-bold text-xs outline-none transition-all pr-10 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {filteredItems.map((item) => {
          const isStokNipis = parseInt(item.stok) <= 5;
          return (
            <div
              key={item.id}
              onClick={() => selectItemManual(item.kode_barang)}
              className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/60 p-2 rounded-xl flex items-center justify-between cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FotoBarang
                  foto={item.foto}
                  apiUrl={API_URL}
                  containerClass="w-10 h-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-center rounded-lg relative overflow-hidden shadow-inner"
                  iconClass="text-lg opacity-30"
                  onClick={() => setZoomedImage && setZoomedImage(item.foto ? `${API_URL}/uploads/${item.foto}` : "no-image")}
                />

                <div className="overflow-hidden">
                  <p className="font-black italic uppercase text-[10px] md:text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-tight truncate">
                    {item.nama_barang}
                  </p>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {item.kode_barang}{" "}
                    <span className="text-slate-300 dark:text-slate-700 mx-1">
                      |
                    </span>{" "}
                    Size: {item.size || "-"}
                  </p>
                </div>
              </div>

              <span
                className={`text-[9px] font-black uppercase px-2 py-1 rounded-md shrink-0 border ${
                  isStokNipis
                    ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30 animate-pulse"
                    : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                }`}
              >
                Stok: {item.stok}
              </span>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase italic tracking-widest">
            Barang tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPanel;
