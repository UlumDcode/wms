import React, { useState } from "react";

const BulkUpdateModal = ({ isOpen, onClose, onUpload, isUploading }) => {
  const [parsedData, setParsedData] = useState([]);
  const [fileName, setFileName] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setParsedData([]);
      setFileName("");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r);

      if (rows.length < 2) {
        window.showToast("CSV Kosong atau format salah!", "error");
        setParsedData([]);
        return;
      }

      const parsed = [];
      // Mulai iterasi dari indeks 1 untuk mengabaikan baris Header
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i]
          .split(",")
          .map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length >= 2) {
          let nominalStr = cols[1];
          let cleanNominal = 0;

          // Cek jika angkanya sudah murni standar / format float (contoh: 150000 atau 150000.5)
          if (/^\d+(\.\d+)?$/.test(nominalStr)) {
            cleanNominal = parseFloat(nominalStr);
          } else {
            // Bersihkan format Rupiah manual (Hapus "Rp", spasi, koma desimal, dan titik ribuan)
            let cleanStr = nominalStr.replace(/Rp/gi, "").trim();
            cleanStr = cleanStr.split(",")[0]; // Buang koma (,00) jika ada
            cleanStr = cleanStr.replace(/\./g, "").replace(/\D/g, ""); // Hapus titik dan sisakan angka murni
            cleanNominal = parseFloat(cleanStr) || 0;
          }

          parsed.push({
            no_resi: cols[0],
            nominal: cleanNominal,
          });
        }
      }
      setParsedData(parsed);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (parsedData.length === 0) {
      return window.showToast(
        "Data CSV kosong atau belum diupload!",
        "warning",
      );
    }
    onUpload(parsedData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 border border-slate-100 flex flex-col">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl md:text-2xl font-black italic uppercase text-slate-800 leading-none">
            Pencairan Masal <span className="text-blue-600">MP</span>
          </h3>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
            Upload CSV Resi & Nominal
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              File Data CSV (Resi, Nominal)
            </label>
            <label
              className={`w-full relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200" : "bg-blue-50/50 hover:bg-blue-50 border-blue-200 hover:border-blue-400 group"}`}
            >
              <div
                className={`text-4xl mb-2 transition-transform ${!isUploading && "group-hover:scale-110"}`}
              >
                📄
              </div>
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest text-center">
                {fileName ? fileName : "Pilih File CSV"}
              </div>
              <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest text-center">
                {parsedData.length > 0
                  ? `${parsedData.length} baris data siap`
                  : "Kolom 1: Resi, Kolom 2: Nominal"}
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* FORMAT CSV EXAMPLE */}
          {parsedData.length === 0 && !isUploading && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4 text-amber-800">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span>💡</span> Contoh Format CSV:
              </p>
              <div className="bg-white rounded-lg border border-amber-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-[9px] md:text-[10px]">
                  <thead className="bg-amber-100/50 font-bold text-amber-700">
                    <tr>
                      <th className="p-2 border-b border-r border-amber-100 w-1/2">
                        Nomor Resi (Kolom A)
                      </th>
                      <th className="p-2 border-b border-amber-100 w-1/2">
                        Nominal Cair (Kolom B)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-slate-600">
                    <tr>
                      <td className="p-2 border-b border-r border-amber-50">
                        JX123456789
                      </td>
                      <td className="p-2 border-b border-amber-50">150000</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-amber-50">
                        JP987654321
                      </td>
                      <td className="p-2 border-amber-50">75500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[8px] md:text-[9px] mt-2 text-amber-600 font-bold italic leading-relaxed">
                * Pastikan file berformat <strong>.csv</strong> (bukan .xlsx).
                Sistem kini sudah pintar! Teks "Rp" atau tanda titik pada
                nominal akan dibersihkan otomatis. Baris pertama (Header /
                Judul) akan diabaikan.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => {
                setParsedData([]);
                setFileName("");
                onClose();
              }}
              disabled={isUploading}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 rounded-xl font-black text-[10px] uppercase transition-all tracking-widest disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || parsedData.length === 0}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-500/30 transition-all tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  MEMPROSES...
                </>
              ) : (
                <>
                  <span className="text-sm">⚡</span>
                  EKSEKUSI MASAL
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateModal;
