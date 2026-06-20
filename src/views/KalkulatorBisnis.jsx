import React, { useState } from "react";
import KalkulatorShopee from "../components/kalkulator/KalkulatorShopee";
import KalkulatorTiktok from "../components/kalkulator/KalkulatorTiktok";
import KalkulatorRoas from "../components/kalkulator/KalkulatorRoas";

const KalkulatorBisnis = () => {
  const [activeTab, setActiveTab] = useState("shopee");

  return (
    <div className="p-1 md:p-2 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100 h-full flex flex-col">
      {/* HEADER & TABS */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-end gap-2 mb-3 shrink-0 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shadow-inner overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("shopee")}
            className={`px-5 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === "shopee"
                ? "bg-orange-500 text-white shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            🛒 Shopee
          </button>
          <button
            onClick={() => setActiveTab("tiktok")}
            className={`px-5 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === "tiktok"
                ? "bg-slate-900 dark:bg-slate-950 text-white shadow-md border dark:border-slate-800"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            🎵 TikTok & Tokopedia
          </button>
          <button
            onClick={() => setActiveTab("roas")}
            className={`px-5 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === "roas"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            🚀 Target ROAS (Iklan)
          </button>
        </div>
      </div>

      {/* KONTEN */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "shopee" && <KalkulatorShopee />}
        {activeTab === "tiktok" && <KalkulatorTiktok />}
        {activeTab === "roas" && <KalkulatorRoas />}
      </div>
    </div>
  );
};

export default KalkulatorBisnis;
