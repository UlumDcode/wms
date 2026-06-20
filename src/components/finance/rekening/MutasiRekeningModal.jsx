import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";

const MutasiRekeningModal = ({ isOpen, onClose, rekening }) => {
  const [mutasiList, setMutasiList] = useState([]);
  const [loadingMutasi, setLoadingMutasi] = useState(false);

  useEffect(() => {
    if (isOpen && rekening) {
      const fetchMutasi = async () => {
        setMutasiList([]);
        setLoadingMutasi(true);
        try {
          const res = await axiosInstance.get(
            `finance/rekening.php?action=mutasi&id=${rekening.id}`
          );
          const data = res.data;
          if (data && data.status === "success") {
            setMutasiList(data.data || []);
          } else if (Array.isArray(data)) {
            setMutasiList(data);
          } else {
            setMutasiList([]);
          }
        } catch (e) {
          console.error(e);
          window.showToast("Gagal mengambil riwayat mutasi", "error");
        } finally {
          setLoadingMutasi(false);
        }
      };
      fetchMutasi();
    }
  }, [isOpen, rekening]);

  if (!isOpen || !rekening) return null;

  const formatRupiah = (val) => {
    if (!val) return "";
    return "Rp " + new Intl.NumberFormat("id-ID").format(val);
  };

  const selectedRekeningName =
    rekening.tipe_rekening === "MP Escrow"
      ? rekening.nama_rekening.replace(/Escrow\s*-\s*/i, "")
      : rekening.nama_rekening;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-5 rounded-xl shadow-xl border border-slate-100 w-full max-w-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 shrink-0">
          <div>
            <h3 className="font-black uppercase italic tracking-tight text-sm md:text-base text-slate-800">
              Riwayat Mutasi
            </h3>
            <p className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
              {selectedRekeningName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors font-bold active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-2">
          {loadingMutasi ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest italic animate-pulse">
                Memuat Riwayat...
              </span>
            </div>
          ) : (
            <table className="w-full min-w-[400px] text-left border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                  <th className="py-2 px-2 md:p-3">Tanggal</th>
                  <th className="py-2 px-2 md:p-3">Keterangan</th>
                  <th className="py-2 px-2 md:p-3 text-center">Jenis</th>
                  <th className="py-2 px-2 md:p-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {mutasiList.map((m) => (
                  <tr
                    key={m.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-l border-slate-100 rounded-l-xl text-[7px] md:text-[9px] font-bold text-slate-500 whitespace-nowrap">
                      {m.tanggal}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 max-w-[150px] md:max-w-xs">
                      <div className="text-[8px] md:text-[10px] font-black text-slate-800 uppercase italic tracking-tight truncate">
                        {m.keterangan}
                      </div>
                      {m.nama_pihak && (
                        <div className="text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">
                          {m.nama_pihak}
                        </div>
                      )}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center w-[60px] md:w-auto">
                      <span
                        className={`px-1.5 py-1 md:px-2.5 md:py-1 rounded-md text-[6px] md:text-[9px] font-black uppercase tracking-widest border whitespace-nowrap inline-block ${m.jenis_mutasi === "Masuk" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                      >
                        {m.jenis_mutasi}
                      </span>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-r border-slate-100 rounded-r-xl text-right max-w-[80px] md:max-w-none">
                      <div
                        className={`text-[9px] md:text-xs font-black whitespace-nowrap truncate ${m.jenis_mutasi === "Masuk" ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {m.jenis_mutasi === "Masuk" ? "+" : "-"}{" "}
                        {formatRupiah(m.nominal)}
                      </div>
                    </td>
                  </tr>
                ))}
                {mutasiList.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                        Belum ada transaksi di rekening ini
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MutasiRekeningModal;
