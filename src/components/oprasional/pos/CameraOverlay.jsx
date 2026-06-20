import React from "react";

const CameraOverlay = ({ isScanning, scanModeRef, stopScan }) => {
  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 dark:bg-black/95 backdrop-blur-sm flex flex-col justify-center items-center p-4">
      <h3 className="text-white font-black italic uppercase tracking-widest mb-4">
        {scanModeRef.current === "resi"
          ? "SCAN BARCODE RESI"
          : scanModeRef.current === "store"
            ? "SCAN BARCODE TOKO"
            : "SCAN BARCODE BARANG"}
      </h3>
      <div
        id="kamera-scanner"
        className="w-full max-w-[250px] sm:max-w-sm rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 border-blue-500 dark:border-blue-600 bg-slate-900 flex items-center justify-center shadow-2xl"
      ></div>
      <button
        onClick={stopScan}
        className="mt-6 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
      >
        Selesai / Tutup Kamera
      </button>
    </div>
  );
};

export default CameraOverlay;
