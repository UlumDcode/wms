import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";

const JurnalDetailModal = ({ isOpen, onClose, jurnal }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && jurnal) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await axiosInstance.get(
            `finance/jurnal_umum.php?action=read_detail&id=${jurnal.id}`
          );
          const data = res.data;
          setDetails(data || []);
        } catch (e) {
          console.error(e);
          window.showToast("Gagal mengambil detail jurnal", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, jurnal]);

  if (!isOpen || !jurnal) return null;

  const formatRp = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const totalDebit = details.reduce(
    (sum, d) => sum + parseFloat(d.debit || 0),
    0,
  );
  const totalKredit = details.reduce(
    (sum, d) => sum + parseFloat(d.kredit || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100 w-full max-w-4xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 shrink-0">
          <div>
            <h3 className="font-black uppercase italic tracking-tight text-sm md:text-base text-slate-800">
              Detail Jurnal
            </h3>
            <p className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
              Ref: {jurnal.no_referensi} | Tgl: {jurnal.tanggal}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors font-bold active:scale-95"
          >
            ✕
          </button>
        </div>

        {jurnal.deskripsi && (
          <div className="mb-4 text-xs font-semibold text-slate-600 italic">
            Deskripsi: {jurnal.deskripsi}
          </div>
        )}

        {/* Body Table */}
        <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest italic animate-pulse">
                Memuat Detail...
              </span>
            </div>
          ) : (
            <table className="w-full min-w-[500px] text-left border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                  <th className="py-2 px-2 md:p-3">Kode Akun</th>
                  <th className="py-2 px-2 md:p-3">Nama Akun</th>
                  <th className="py-2 px-2 md:p-3">Keterangan</th>
                  <th className="py-2 px-2 md:p-3 text-right">Debit</th>
                  <th className="py-2 px-2 md:p-3 text-right">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {details.map((d) => (
                  <tr
                    key={d.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-l border-slate-100 rounded-l-xl text-[8px] md:text-[10px] font-black text-slate-600 whitespace-nowrap">
                      {d.kode_akun}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-[8px] md:text-[10px] font-bold text-slate-700">
                      {d.nama_akun}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 max-w-[150px] md:max-w-xs">
                      <div className="text-[8px] md:text-[10px] text-slate-500 italic truncate">
                        {d.keterangan || "-"}
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-right w-[90px] md:w-[120px]">
                      <div className="text-[9px] md:text-xs font-black text-emerald-600 whitespace-nowrap truncate">
                        {parseFloat(d.debit) > 0 ? formatRp(d.debit) : "-"}
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-r border-slate-100 rounded-r-xl text-right w-[90px] md:w-[120px]">
                      <div className="text-[9px] md:text-xs font-black text-rose-600 whitespace-nowrap truncate">
                        {parseFloat(d.kredit) > 0 ? formatRp(d.kredit) : "-"}
                      </div>
                    </td>
                  </tr>
                ))}
                {details.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                        Belum ada detail jurnal
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Sum */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest shrink-0">
          <div className="text-slate-500">Total</div>
          <div className="flex gap-4 md:gap-8">
            <div className="text-emerald-600">
              Debit: Rp {formatRp(totalDebit)}
            </div>
            <div className="text-rose-600">
              Kredit: Rp {formatRp(totalKredit)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JurnalDetailModal;
