import React from "react";

const AlarmOverlay = ({ alarmConfig, stopAlarm }) => {
  if (!alarmConfig) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-rose-900/95 dark:bg-rose-950/95 backdrop-blur-md flex flex-col justify-center items-center p-6 animate-in fade-in zoom-in-95">
      <div className="text-[6rem] md:text-[8rem] mb-4 animate-bounce drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]">
        {alarmConfig.type === "not_found"
          ? "🛑"
          : alarmConfig.type === "empty_stock"
            ? "📦"
            : alarmConfig.type === "no_price"
              ? "💰"
              : alarmConfig.type === "duplicate_resi"
                ? "⚠️"
                : "🚨"}
      </div>
      <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter text-center mb-3">
        {alarmConfig.type === "not_found"
          ? "BARANG TIDAK ADA!"
          : alarmConfig.type === "empty_stock"
            ? "STOK HABIS!"
            : alarmConfig.type === "no_price"
              ? "HARGA BELUM DISET!"
              : alarmConfig.type === "duplicate_resi"
                ? "RESI SUDAH ADA!"
                : "SALAH SCAN!"}
      </h2>
      <p className="text-base md:text-xl font-bold text-rose-200 dark:text-rose-300 text-center max-w-2xl mb-8 px-4 leading-relaxed">
        {alarmConfig.message}
      </p>
      <button
        autoFocus
        onClick={stopAlarm}
        className="bg-white dark:bg-slate-100 text-rose-600 dark:text-rose-700 font-black text-xs md:text-sm px-10 py-4 rounded-2xl uppercase tracking-widest shadow-2xl hover:bg-rose-50 dark:hover:bg-slate-200 transition-all active:scale-95"
      >
        Oke, Paham!
      </button>
    </div>
  );
};

export default AlarmOverlay;
