import React from "react";

const TabBukuUtangPiutang = ({
  activeTab,
  filteredPiutang,
  filteredHutang,
  formatRupiah,
  handleViewHistory,
  handleOpenModal,
  onRowClick,
}) => {
  if (activeTab === "histori" || activeTab === "rekap") return null; // support rekap tab too

  const data = activeTab === "piutang" ? filteredPiutang : filteredHutang;

  const handleWhatsApp = (noHp) => {
    if (!noHp) return window.showToast("Nomor HP tidak tersedia", "warning");
    // Bersihkan karakter non-digit
    let cleanNo = noHp.replace(/\D/g, "");
    // Konversi awalan 0 ke 62
    if (cleanNo.startsWith("0")) {
      cleanNo = "62" + cleanNo.slice(1);
    } else if (!cleanNo.startsWith("62")) {
      cleanNo = "62" + cleanNo;
    }
    window.open(`https://wa.me/${cleanNo}`, "_blank");
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                ID Ref
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Pihak / Nama
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                No HP
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                Total
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                Terbayar
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                Sisa
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                Status
              </th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="p-10 text-center text-slate-400 font-medium italic"
                >
                  Tidak ada data ditemukan...
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const total = parseFloat(
                  activeTab === "piutang"
                    ? item.total_tagihan
                    : item.total_hutang || item.total_kewajiban || 0,
                );
                const terbayar = parseFloat(item.total_terbayar || 0);
                const sisa = total - terbayar;
                const status =
                  activeTab === "piutang"
                    ? item.status_piutang
                    : item.status_hutang;
                const pihak =
                  activeTab === "piutang"
                    ? item.nama_channel
                    : item.nama_supplier || item.supplier_name || "Tanpa Nama";
                const idRef =
                  activeTab === "piutang" ? item.outbound_id : item.inbound_id;

                return (
                  <tr
                    key={`${activeTab}-${item.id}`}
                    onClick={() => onRowClick && onRowClick(item, activeTab)}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        #{idRef}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-xs text-slate-700 uppercase">
                        {pihak}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                        <span className="text-xs font-medium text-slate-500">
                          {item.no_hp || "-"}
                        </span>
                        {item.no_hp && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(item.no_hp);
                            }}
                            className="text-emerald-500 hover:text-emerald-600 p-1 hover:bg-emerald-50 rounded-full transition-all"
                            title="Kirim Pesan WA"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right text-xs font-bold text-slate-700">
                      {formatRupiah(total)}
                    </td>
                    <td className="p-4 text-right text-xs font-bold text-emerald-600">
                      {formatRupiah(terbayar)}
                    </td>
                    <td className="p-4 text-right text-xs font-bold text-rose-600">
                      {formatRupiah(sisa)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                          status === "Lunas"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(item, activeTab);
                          }}
                          className="px-2 py-1 bg-blue-600 text-white text-[9px] font-black uppercase rounded hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          💸 Bayar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewHistory(item, activeTab);
                          }}
                          className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded hover:bg-slate-200 active:scale-95 transition-all"
                          title="Lihat Histori"
                        >
                          📜
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabBukuUtangPiutang;
