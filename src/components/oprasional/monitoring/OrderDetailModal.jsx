import React from "react";
import {
  getDisplayName,
  getPhoneExtracted,
  getStatusColor,
} from "../../../hooks/useMonitoring";

const OrderDetailModal = ({
  order,
  onClose,
  items,
  loading,
  renderActionButtons,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex justify-center items-end md:items-center p-4 animate-in fade-in slide-in-from-bottom-10">
      <div className="bg-white w-full max-w-xl p-4 md:p-6 rounded-[1.25rem] md:rounded-[2rem] shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full font-bold transition-all text-xs"
        >
          ✕
        </button>
        <div className="border-b border-slate-100 pb-3 mb-4 pr-8">
          <h3 className="text-lg font-black italic uppercase text-slate-800 leading-none">
            Detail Transaksi
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            INV: {order.no_invoice}
          </p>
        </div>

        {/* Info Transaksi & Customer */}
        <div className="grid grid-cols-2 gap-3 mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <p className="text-[8px] uppercase font-black text-slate-400">
              Tanggal
            </p>
            <p className="text-[10px] font-bold text-slate-800 mt-0.5">
              {order.tanggal_keluar?.split(" ")[0] || "-"}
            </p>
          </div>
          <div>
            <p className="text-[8px] uppercase font-black text-slate-400">
              Status
            </p>
            <span
              className={`inline-block mt-0.5 px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-[8px] uppercase font-black text-slate-400">
              Channel
            </p>
            <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">
              {order.nama_channel}
            </p>
          </div>
          <div>
            <p className="text-[8px] uppercase font-black text-slate-400">
              Pembayaran
            </p>
            <p className="text-[10px] font-bold text-slate-600 uppercase mt-0.5 leading-tight">
              {order.metode_pembayaran}
            </p>
          </div>
          <div className="col-span-2 border-t border-slate-200 pt-3 mt-1">
            <p className="text-[8px] uppercase font-black text-slate-400">
              Toko / Nama Pembeli
            </p>
            <p className="text-xs font-black text-slate-800 uppercase mt-0.5">
              {getDisplayName(order)}
            </p>
            {getPhoneExtracted(order) && (
              <p className="text-[9px] font-bold text-slate-500 mt-0.5">
                📞 {getPhoneExtracted(order)}
              </p>
            )}
          </div>
          {order.no_resi && (
            <div className="col-span-2 bg-blue-50 p-3 rounded-xl mt-1 border border-blue-100 flex items-center gap-3">
              <div className="text-lg">🚚</div>
              <div>
                <p className="text-[8px] uppercase font-black text-blue-400">
                  No. Resi / AWB
                </p>
                <p className="text-xs font-black text-blue-700 tracking-widest mt-0.5">
                  {order.no_resi}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* List Barang */}
        <div className="mb-5">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
            Daftar Barang Dibeli
          </h4>
          {loading ? (
            <div className="py-6 text-center text-[9px] font-bold text-slate-400 animate-pulse uppercase tracking-widest">
              Memuat detail barang...
            </div>
          ) : items && items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:border-blue-200 transition-colors"
                >
                  <div className="flex-1 pr-3">
                    <p className="text-[11px] font-black uppercase text-slate-800 leading-tight">
                      {item.nama_barang}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {item.kode_barang}{" "}
                      <span className="text-slate-200 mx-1">|</span> Size:{" "}
                      {item.size || "-"}
                    </p>
                  </div>
                  <div className="text-right px-3 border-r border-slate-100">
                    <p className="text-[10px] font-black text-slate-800">
                      {item.qty} Pcs
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 mt-0.5">
                      @ Rp {(item.subtotal / item.qty).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="w-20 md:w-24 text-right pl-2">
                    <p className="text-xs font-black text-emerald-600 italic">
                      Rp {parseFloat(item.subtotal).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 rounded-xl">
              Data barang tidak ditemukan
            </div>
          )}
        </div>

        {/* Total Bayar */}
        <div className="flex justify-between items-center bg-slate-900 text-white p-5 md:p-6 rounded-[1.5rem] mb-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-5 text-5xl font-black italic">
            Rp
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 relative z-10">
            Total Keseluruhan
          </p>
          <p className="text-xl md:text-2xl font-black italic tracking-tighter text-emerald-400 relative z-10 leading-none">
            Rp {parseFloat(order.total_bayar).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
          {renderActionButtons(order, false)}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
