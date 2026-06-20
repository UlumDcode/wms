import React from "react";

const ModalScanner = ({ isScanning, stopScan }) => {
  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex flex-col justify-center items-center p-4">
      <h3 className="text-white font-black italic uppercase tracking-widest mb-4">
        SCAN BARCODE BARANG
      </h3>
      <div
        id="inventory-scanner"
        className="w-full max-w-[300px] sm:max-w-md rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-4 border-emerald-500 bg-slate-900 flex items-center justify-center shadow-2xl"
      ></div>
      <button
        onClick={stopScan}
        className="mt-8 bg-rose-500 text-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-lg"
      >
        Tutup Kamera
      </button>
    </div>
  );
};

export default ModalScanner;
