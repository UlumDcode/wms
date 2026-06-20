import React from "react";
import { getDisplayName, getStatusColor } from "../../../hooks/useMonitoring";

const OrderCard = ({ order, openDetail, renderActionButtons, renderCancelButton }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
      <div className="p-3 pb-0">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex flex-wrap gap-1.5">
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest truncate max-w-[120px]">
              {getDisplayName(order)}
            </div>
            <button
              onClick={() => openDetail(order)}
              className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-blue-100 active:scale-95 transition-all"
            >
              🔍 Detail
            </button>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm whitespace-nowrap ${getStatusColor(order.status)}`}
          >
            {order.status}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="text-[7px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-widest">
            {order.nama_channel}
          </span>
          <span className="text-[7px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-widest max-w-[120px] truncate">
            {order.metode_pembayaran}
          </span>
          {renderCancelButton && renderCancelButton(order)}
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest w-full mt-1.5">
            {order.no_invoice}
          </p>
        </div>
        <h4 className="text-lg font-black text-slate-800 uppercase italic truncate">
          Rp {parseFloat(order.total_bayar).toLocaleString()}
        </h4>
      </div>

      <div className="p-3 space-y-2">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
          <div className="text-lg">🚚</div>
          <div className="overflow-hidden">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              Resi / Tracking
            </p>
            <p className="text-[10px] font-bold text-blue-600 uppercase truncate">
              {order.no_resi || "Non-Resi (Lokal)"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto p-3 bg-slate-50 border-t border-slate-100 flex gap-2 flex-wrap justify-center rounded-b-xl">
        {renderActionButtons(order, false)}
      </div>
    </div>
  );
};

export default OrderCard;
