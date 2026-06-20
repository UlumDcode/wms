import React from "react";
import { getDisplayName, getStatusColor } from "../../../hooks/useMonitoring";

const OrderMobileCard = ({ order, openDetail, renderCancelButton }) => {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="flex-1 overflow-hidden relative z-10">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-black uppercase truncate text-slate-800">
            {order.no_invoice}
          </p>
          <div className="flex gap-1 shrink-0 ml-2">
            {renderCancelButton && renderCancelButton(order)}
            <button
              onClick={() => openDetail(order)}
              className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              🔍 Detail
            </button>
            <span
              className={`text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase truncate leading-none">
          {getDisplayName(order)} <span className="text-slate-300 mx-1">|</span>{" "}
          Rp {parseFloat(order.total_bayar).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default OrderMobileCard;
