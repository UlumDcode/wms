import React, { useState, useEffect } from "react";

const ManualSettleModal = ({ isOpen, onClose, order, onSubmit }) => {
  const [nominalCair, setNominalCair] = useState("");

  useEffect(() => {
    if (isOpen && order) {
      setNominalCair(
        order.total_bayar
          ? Number(order.total_bayar).toLocaleString("id-ID")
          : "",
      );
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleNominalChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw) {
      setNominalCair(Number(raw).toLocaleString("id-ID"));
    } else {
      setNominalCair("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanNominal = parseFloat(nominalCair.replace(/\D/g, "")) || 0;
    if (cleanNominal <= 0) {
      return window.showToast("Nominal aktual harus lebih dari 0!", "warning");
    }

    onSubmit(cleanNominal);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-slate-100 flex flex-col">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl md:text-2xl font-black italic uppercase text-slate-800 leading-none">
            Pencairan Manual MP
          </h3>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
            INV: {order.no_invoice}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-5 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">
            Total Tagihan
          </span>
          <span className="text-lg font-black italic text-blue-600">
            Rp {Number(order.total_bayar).toLocaleString("id-ID")}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Nominal Aktual Cair (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={nominalCair}
              onChange={handleNominalChange}
              placeholder="Contoh: 150000"
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none focus:border-blue-500 transition-all text-slate-700 shadow-sm"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 rounded-xl font-black text-[10px] uppercase transition-all tracking-widest"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/30 transition-all tracking-widest flex items-center justify-center gap-2"
            >
              <span>🤝</span> CAIRKAN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualSettleModal;
