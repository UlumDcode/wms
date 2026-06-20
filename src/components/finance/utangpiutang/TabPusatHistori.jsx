import React from "react";

const TabPusatHistori = ({
  activeTab,
  filteredHistoriHutang,
  filteredHistoriPiutang,
  historiHutangList,
  historiPiutangList,
  formatRupiah,
}) => {
  if (activeTab !== "histori") return null;

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-[400px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[300px]">
        {/* BLOK 1: HISTORI PEMBAYARAN HUTANG */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50 shrink-0">
            <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest text-rose-600">
              Histori Pembayaran Hutang
            </h3>
          </div>
          <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
            <table className="w-full text-left border-separate border-spacing-y-2 mt-2">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Tanggal
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Keterangan / Ref
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 hidden sm:table-cell">
                    Rekening
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 text-right">
                    Nominal
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistoriHutang.length > 0 ? (
                  filteredHistoriHutang.map((h, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 text-[7px] md:text-[9px] font-bold text-slate-500 whitespace-nowrap">
                        {h.tanggal}
                      </td>
                      <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100">
                        <div className="text-[8px] md:text-[10px] font-black text-slate-800 tracking-tight">
                          {h.keterangan}
                        </div>
                        <div className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">
                          {h.pihak || "-"}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 hidden sm:table-cell">
                        <div className="text-[8px] md:text-[10px] font-black text-blue-600">
                          {h.nama_rekening}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-right">
                        <div className="text-[9px] md:text-[11px] font-black text-emerald-600 whitespace-nowrap">
                          {formatRupiah(h.nominal_bayar)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                        {historiHutangList.length === 0
                          ? "Belum Ada Histori Hutang"
                          : "Data Tidak Ditemukan"}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BLOK 2: HISTORI PEMBAYARAN PIUTANG */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50 shrink-0">
            <h3 className="font-black text-[10px] md:text-xs uppercase tracking-widest text-emerald-600">
              Histori Pembayaran Piutang
            </h3>
          </div>
          <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
            <table className="w-full text-left border-separate border-spacing-y-2 mt-2">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Tanggal
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Keterangan / Ref
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 hidden sm:table-cell">
                    Rekening
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 text-right">
                    Nominal
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistoriPiutang.length > 0 ? (
                  filteredHistoriPiutang.map((h, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 text-[7px] md:text-[9px] font-bold text-slate-500 whitespace-nowrap">
                        {h.tanggal}
                      </td>
                      <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100">
                        <div className="text-[8px] md:text-[10px] font-black text-slate-800 tracking-tight">
                          {h.keterangan}
                        </div>
                        <div className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">
                          {h.pihak || "-"}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 hidden sm:table-cell">
                        <div className="text-[8px] md:text-[10px] font-black text-blue-600">
                          {h.nama_rekening}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-right">
                        <div className="text-[9px] md:text-[11px] font-black text-emerald-600 whitespace-nowrap">
                          {formatRupiah(h.nominal_bayar)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                        {historiPiutangList.length === 0
                          ? "Belum Ada Histori Piutang"
                          : "Data Tidak Ditemukan"}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabPusatHistori;
