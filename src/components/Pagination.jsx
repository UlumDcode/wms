import React, { useState, useEffect } from "react";

const OPTIONS = [50, 100, 150, 200, 250];

const Pagination = ({
  totalData,
  limit,
  onLimitChange,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalData / limit) || 1;

  const [isCustom, setIsCustom] = useState(!OPTIONS.includes(limit));

  useEffect(() => {
    setIsCustom(!OPTIONS.includes(limit));
  }, [limit]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 rounded-b-2xl transition-colors duration-300">
      <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        <span>Tampilkan:</span>
        <select
          value={isCustom ? "custom" : limit}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setIsCustom(true);
            } else {
              setIsCustom(false);
              onLimitChange(Number(e.target.value));
              onPageChange(1);
            }
          }}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer transition-all"
        >
          {OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt} Data
            </option>
          ))}
          <option value="custom">Kustom</option>
        </select>

        {isCustom && (
          <input
            type="number"
            placeholder="Jumlah..."
            value={limit}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > 0) {
                onLimitChange(val);
                onPageChange(1);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = Number(e.target.value);
                if (val > 0) {
                  onLimitChange(val);
                  onPageChange(1);
                }
              }
            }}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3 py-1 w-20 outline-none font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        )}
        <span className="ml-2 text-slate-400 dark:text-slate-500 font-bold italic normal-case">
          Total:{" "}
          <span className="text-slate-700 dark:text-slate-300 not-italic font-black">
            {totalData}
          </span>{" "}
          Baris
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] md:text-xs uppercase tracking-widest shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          Prev
        </button>
        <div className="flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200/40 dark:border-slate-700/30 shadow-inner">
          <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Hal{" "}
            <span className="text-blue-600 dark:text-blue-400 font-black">
              {currentPage}
            </span>{" "}
            /{" "}
            <span className="text-slate-800 dark:text-slate-200">
              {totalPages}
            </span>
          </span>
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] md:text-xs uppercase tracking-widest shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
