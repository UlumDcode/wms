import React from "react";

const PrintHeader = ({ storeConfig, API_URL }) => {
  return (
    <div className="flex items-center gap-6 border-b-[4px] border-double border-slate-900 pb-4 mb-6">
      {/* LOGO */}
      <div className="w-24 h-24 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 rounded-md bg-white">
        {storeConfig?.company_logo_url ? (
          <img
            src={`${API_URL}/uploads/${storeConfig.company_logo_url}`}
            className="w-full h-full object-contain p-1"
            alt="Logo"
          />
        ) : (
          <span className="text-[10px] font-black text-slate-300 uppercase">
            Logo
          </span>
        )}
      </div>

      {/* TEXT HIERARCHY */}
      <div className="flex-1 text-center pr-24">
        <h1 className="text-[22px] font-black uppercase tracking-tighter leading-none text-slate-900">
          {storeConfig?.company_name || "NAMA INSTANSI PERUSAHAAN"}
        </h1>
        {storeConfig?.company_tagline && (
          <p className="text-[12px] font-bold uppercase text-slate-700 mt-1 tracking-widest">
            {storeConfig.company_tagline}
          </p>
        )}
        <div className="mt-2 space-y-0.5">
          <p className="text-[10px] font-medium text-slate-600 leading-tight italic">
            {storeConfig?.company_address ||
              "Alamat lengkap kantor pusat belum diatur..."}
          </p>
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
            {[
              storeConfig?.company_whatsapp &&
                `WA: ${storeConfig.company_whatsapp}`,
              storeConfig?.company_email &&
                `Email: ${storeConfig.company_email}`,
              storeConfig?.company_website &&
                `Web: ${storeConfig.company_website}`,
            ]
              .filter(Boolean)
              .join("   |   ") || "Kontak Belum Diatur"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintHeader;
