import React from "react";
import PrintHeader from "./PrintHeader";

const ReportDocument = ({
  title,
  subtitle,
  children,
  storeConfig,
  API_URL,
}) => {
  return (
    // overflow-hidden diganti jadi overflow-visible agar konten bisa menembus halaman berikutnya saat diprint
    <div className="bg-white text-slate-900 shadow-2xl mx-auto print:shadow-none print:m-0 w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] relative overflow-visible flex flex-col border border-slate-100 print:border-none print:p-0">
      {/* Header Kop Surat */}
      <PrintHeader storeConfig={storeConfig} API_URL={API_URL} />

      {/* Judul Laporan */}
      <div className="text-center mb-8 uppercase">
        <h2 className="text-[20px] font-black tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 inline-block px-4 pb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[12px] font-bold text-slate-500 mt-2 tracking-widest">
            Periode: {subtitle}
          </p>
        )}
      </div>

      {/* Konten Utama */}
      <div className="flex-1 text-[12px]">{children}</div>
    </div>
  );
};

export default ReportDocument;
