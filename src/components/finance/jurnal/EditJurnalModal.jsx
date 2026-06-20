import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";
import CoaSearchSelect from "./CoaSearchSelect";

const EditJurnalModal = ({ isOpen, onClose, coaList = [], onSuccess, jurnalData }) => {
  if (!isOpen || !jurnalData) return null;

  const [formMaster, setFormMaster] = useState({
    id: jurnalData.id,
    tanggal: jurnalData.tanggal || new Date().toISOString().split("T")[0],
    no_referensi: jurnalData.no_referensi || "",
    deskripsi: jurnalData.deskripsi || "",
  });

  const [formDetails, setFormDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const isAuto = parseInt(jurnalData.is_auto || 0) === 1;

  useEffect(() => {
    if (jurnalData && isOpen) {
      setFormMaster({
        id: jurnalData.id,
        tanggal: jurnalData.tanggal || new Date().toISOString().split("T")[0],
        no_referensi: jurnalData.no_referensi || "",
        deskripsi: jurnalData.deskripsi || "",
      });
      fetchJurnalDetail(jurnalData.id);
    }
  }, [jurnalData, isOpen]);

  const fetchJurnalDetail = async (id) => {
    setFetchingData(true);
    try {
      const res = await axiosInstance.get(`finance/jurnal_umum.php?action=read_detail&id=${id}`);
      if (res.data && Array.isArray(res.data)) {
        const details = res.data.map(d => ({
          id: d.id || Date.now() + Math.random(),
          coa_id: d.coa_id || "",
          debit: parseFloat(d.debit) || "",
          kredit: parseFloat(d.kredit) || "",
          keterangan: d.keterangan || "",
        }));
        // Pastikan minimal ada 2 baris
        while (details.length < 2) {
          details.push({ id: Date.now() + Math.random(), coa_id: "", debit: "", kredit: "", keterangan: "" });
        }
        setFormDetails(details);
      }
    } catch (e) {
      console.error(e);
      window.showToast("Gagal memuat detail jurnal", "error");
    } finally {
      setFetchingData(false);
    }
  };

  // LOGIKA KALKULASI
  const totalDebit = formDetails.reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0);
  const totalKredit = formDetails.reduce((sum, d) => sum + (parseFloat(d.kredit) || 0), 0);
  const isBalance = totalDebit === totalKredit && totalDebit > 0;

  // HANDLERS
  const handleAddRow = () => {
    setFormDetails([
      ...formDetails,
      { id: Date.now() + Math.random(), coa_id: "", debit: "", kredit: "", keterangan: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (formDetails.length <= 2) {
      window.showToast("Jurnal minimal membutuhkan 2 baris akun", "warning");
      return;
    }
    setFormDetails(formDetails.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...formDetails];

    if (field === "debit" || field === "kredit") {
      const cleanValue = value.toString().replace(/\D/g, "");
      newDetails[index][field] = cleanValue;

      if (field === "debit" && cleanValue > 0) newDetails[index].kredit = "";
      if (field === "kredit" && cleanValue > 0) newDetails[index].debit = "";
    } else {
      newDetails[index][field] = value;
    }

    setFormDetails(newDetails);
  };

  const formatRp = (num) => {
    if (!num) return "";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBalance) {
      window.showToast("Jurnal tidak seimbang!", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formMaster,
        total_debit: totalDebit,
        total_kredit: totalKredit,
        details: formDetails.map((d) => ({
          coa_id: parseInt(d.coa_id),
          debit: parseFloat(d.debit) || 0,
          kredit: parseFloat(d.kredit) || 0,
          keterangan: d.keterangan,
        })),
      };

      const res = await axiosInstance.post("finance/jurnal_umum.php?action=update", payload);
      const data = res.data;
      if (data.status === "success") {
        window.showToast("Jurnal berhasil diperbarui!", "success");
        onSuccess();
        onClose();
      } else {
        window.showToast(data.message || "Gagal memperbarui jurnal.", "error");
      }
    } catch (error) {
      console.error(error);
      window.showToast("Terjadi kesalahan koneksi ke server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div>
            <h3 className="font-black uppercase tracking-widest text-slate-800 text-lg">
              Edit Jurnal {isAuto && <span className="text-amber-500 ml-2 text-sm">(Otomatis)</span>}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Koreksi Transaksi {isAuto ? "Sistem" : "Manual"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white hover:bg-rose-50 text-rose-500 w-8 h-8 rounded-full flex justify-center items-center font-bold shadow-sm border border-rose-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Warning Banner for Auto Journals */}
        {isAuto && (
          <div className="bg-amber-50 border-y border-amber-200 px-6 py-3 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>Perhatian:</strong> Ini adalah jurnal otomatis yang di-generate oleh sistem. Sangat disarankan Anda <strong>HANYA</strong> mengganti COA (Akun) saja agar bisa memindahkan dari akun Fallback ke akun yang benar. Mengubah nominal Debit/Kredit dapat menyebabkan ketidaksesuaian dengan data sumber aslinya.
            </p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
          {fetchingData ? (
            <div className="flex items-center justify-center h-40">
              <span className="animate-spin text-4xl">⚙️</span>
            </div>
          ) : (
            <form id="form-edit-jurnal" onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Form Master Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formMaster.tanggal}
                    onChange={(e) => setFormMaster({ ...formMaster, tanggal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm focus:border-blue-500 shadow-sm outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-1">No Referensi</label>
                  <input
                    type="text"
                    value={formMaster.no_referensi}
                    disabled={isAuto} // No referensi jurnal otomatis tidak boleh diganti
                    onChange={(e) => setFormMaster({ ...formMaster, no_referensi: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm focus:border-blue-500 shadow-sm outline-none transition-colors disabled:opacity-50"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase block mb-1">Deskripsi</label>
                  <input
                    type="text"
                    value={formMaster.deskripsi}
                    onChange={(e) => setFormMaster({ ...formMaster, deskripsi: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm focus:border-blue-500 shadow-sm outline-none transition-colors"
                    placeholder="Deskripsi transaksi..."
                  />
                </div>
              </div>

              {/* Form Details Grid/Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px] border-separate border-spacing-y-0">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="py-3 px-4 w-1/4">Pilih Akun (COA)</th>
                        <th className="py-3 px-4">Keterangan</th>
                        <th className="py-3 px-4 w-44">Debit</th>
                        <th className="py-3 px-4 w-44">Kredit</th>
                        <th className="py-3 px-4 w-12 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formDetails.map((row, idx) => (
                        <tr key={row.id} className="bg-white">
                          <td className="py-2 px-2">
                            <CoaSearchSelect
                              value={row.coa_id}
                              onChange={(val) => handleDetailChange(idx, "coa_id", val)}
                              options={coaList}
                              required={true}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.keterangan}
                              onChange={(e) => handleDetailChange(idx, "keterangan", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm focus:border-blue-500 shadow-sm outline-none"
                              placeholder="Catatan..."
                            />
                          </td>
                          <td className="py-2 px-2">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rp</span>
                              <input
                                type="text"
                                value={row.debit ? formatRp(row.debit) : ""}
                                onChange={(e) => handleDetailChange(idx, "debit", e.target.value)}
                                className={`w-full bg-slate-50 border border-slate-200 py-2 pl-8 pr-3 rounded-lg font-black text-sm focus:border-blue-500 shadow-sm outline-none text-emerald-600 ${isAuto ? 'bg-amber-50' : ''}`}
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rp</span>
                              <input
                                type="text"
                                value={row.kredit ? formatRp(row.kredit) : ""}
                                onChange={(e) => handleDetailChange(idx, "kredit", e.target.value)}
                                className={`w-full bg-slate-50 border border-slate-200 py-2 pl-8 pr-3 rounded-lg font-black text-sm focus:border-blue-500 shadow-sm outline-none text-rose-600 ${isAuto ? 'bg-amber-50' : ''}`}
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              disabled={formDetails.length <= 2}
                              className="bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-slate-50 p-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="w-full border-2 border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 hover:border-blue-300 hover:text-blue-600 font-black text-[10px] tracking-widest uppercase py-2 rounded-lg transition-all flex justify-center items-center gap-2"
                  >
                    <span>➕</span> Tambah Baris
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 w-full md:w-auto text-center md:text-left">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Total Debit</span>
              <span className={`text-lg font-black ${!isBalance ? "text-rose-600" : "text-emerald-600"}`}>
                Rp {formatRp(totalDebit)}
              </span>
            </div>
            <div className="text-slate-300 text-2xl font-light">|</div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Total Kredit</span>
              <span className={`text-lg font-black ${!isBalance ? "text-rose-600" : "text-emerald-600"}`}>
                Rp {formatRp(totalKredit)}
              </span>
            </div>
            <div className={`hidden md:block ml-4 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isBalance ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"}`}>
              {isBalance ? "✓ BALANCE" : "✕ TIDAK SEIMBANG"}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-black tracking-widest uppercase text-[10px] hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              form="form-edit-jurnal"
              type="submit"
              disabled={!isBalance || loading || fetchingData}
              className={`w-full md:w-auto px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex justify-center items-center gap-2 ${!isBalance || loading || fetchingData ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-50" : "bg-blue-600 text-white hover:bg-slate-900 active:scale-95"}`}
            >
              {loading ? "Menyimpan..." : "💾 Update Jurnal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJurnalModal;
