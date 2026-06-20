import React from "react";
import { getDisplayName, getStatusColor } from "../../../hooks/useMonitoring";

const OrderList = ({ order, openDetail, renderActionButtons, renderCancelButton }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2.5 flex flex-col lg:flex-row items-center gap-3 group hover:shadow-md transition-all duration-300">
      <div className="flex-1 w-full flex flex-col md:flex-row items-start md:items-center gap-3 lg:gap-4">
        <div className="w-full lg:w-48 xl:w-56 shrink-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest truncate max-w-[120px]">
              {getDisplayName(order)}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
            <button
              onClick={() => openDetail(order)}
              className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-blue-100 active:scale-95 transition-all"
            >
              🔍 Detail
            </button>
          </div>
          <h4 className="text-base font-black text-slate-800 uppercase italic truncate mt-1">
            Rp {parseFloat(order.total_bayar).toLocaleString()}
          </h4>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
            {order.no_invoice}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-widest">
              {order.nama_channel}
            </span>
            <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-widest">
              {order.metode_pembayaran}
            </span>
            {renderCancelButton && renderCancelButton(order)}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-48 xl:w-56 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 shrink-0">
        <div className="text-lg">🚚</div>
        <div className="overflow-hidden min-w-0">
          <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">
            Resi / Tracking
          </p>
          <p className="text-[10px] font-bold text-blue-600 uppercase truncate">
            {order.no_resi || "Non-Resi (Lokal)"}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-60 xl:w-72 flex shrink-0 justify-end">
        {renderActionButtons(order, true)}
      </div>
    </div>
  );
};

export default OrderList;
