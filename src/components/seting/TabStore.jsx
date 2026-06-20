import React from "react";
import axiosInstance, { API_URL } from "../../utils/axios";

const TabStore = ({
  storeConfig,
  setStoreConfig,
  isSaving,
  saveStoreConfig,
  handleBackup,
  isBackingUp,
  handleRestoreClick,
  isRestoring,
  handleFileChange,
}) => {
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await axiosInstance.post("settings.php?action=upload_logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      if (data.status === "success") {
        setStoreConfig((prev) => ({ ...prev, company_logo_url: data.url }));
        window.showToast("Logo perusahaan berhasil diunggah!", "success");
      } else {
        window.showToast(data.message || "Gagal mengunggah logo", "error");
      }
    } catch (error) {
      window.showToast("Terjadi kesalahan saat mengunggah logo", "error");
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BAGIAN KIRI: IDENTITAS */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: TOKO (POS) */}
          <section className="space-y-4">
            <h3 className="font-black italic uppercase text-[11px] text-slate-400 dark:text-slate-500 border-b dark:border-slate-800 pb-1 tracking-widest flex justify-between items-center">
              <span>
                Store Profile{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  (POS Struk)
                </span>
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                  App Name
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  value={storeConfig.app_name}
                  onChange={(e) =>
                    setStoreConfig({ ...storeConfig, app_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                  Nama Toko
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  value={storeConfig.nama_toko}
                  onChange={(e) =>
                    setStoreConfig({
                      ...storeConfig,
                      nama_toko: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-blue-600 ml-1">
                  Default Alert No (System)
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  placeholder="0821..."
                  value={storeConfig.owner_no_default || ""}
                  onChange={(e) =>
                    setStoreConfig({
                      ...storeConfig,
                      owner_no_default: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-full space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                  Alamat Nota
                </label>
                <textarea
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold h-12 text-xs resize-none outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  value={storeConfig.alamat}
                  onChange={(e) =>
                    setStoreConfig({ ...storeConfig, alamat: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: PERUSAHAAN (LAPORAN) */}
          <section className="space-y-4 pt-4 border-t-2 border-dashed border-slate-100 dark:border-slate-800">
            <h3 className="font-black italic uppercase text-[11px] text-slate-400 dark:text-slate-500 border-b dark:border-slate-800 pb-1 tracking-widest flex justify-between items-center">
              <span>
                Company Profile{" "}
                <span className="text-amber-600">(Kop Laporan)</span>
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                  Logo Kop
                </label>
                <div
                  className="aspect-square bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer"
                  onClick={() => document.getElementById("logoInput").click()}
                >
                  {storeConfig.company_logo_url ? (
                    <img
                      src={`${API_URL}/uploads/${storeConfig.company_logo_url}`}
                      className="w-full h-full object-contain p-2"
                      alt="Logo"
                    />
                  ) : (
                    <div className="text-center opacity-30">
                      <span className="text-2xl">🖼️</span>
                      <p className="text-[8px] font-black uppercase">Upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="logoInput"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>

              <div className="md:col-span-3 grid grid-cols-2 gap-3">
                <div className="col-span-full space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                    Baris 1: Nama Instansi Utama
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100"
                    value={storeConfig.company_name}
                    onChange={(e) =>
                      setStoreConfig({
                        ...storeConfig,
                        company_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                    Baris 2: Detail Tambahan / Tagline (Opsional)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100"
                    placeholder="Contoh: Bidang Usaha, Slogan, Moto, dll."
                    value={storeConfig.company_tagline || ""}
                    onChange={(e) =>
                      setStoreConfig({
                        ...storeConfig,
                        company_tagline: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                      No. WhatsApp
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100"
                      placeholder="0812..."
                      value={storeConfig.company_whatsapp || ""}
                      onChange={(e) =>
                        setStoreConfig({
                          ...storeConfig,
                          company_whatsapp: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                      Email Resmi
                    </label>
                    <input
                      type="email"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100"
                      placeholder="info@bisnis.com"
                      value={storeConfig.company_email || ""}
                      onChange={(e) =>
                        setStoreConfig({
                          ...storeConfig,
                          company_email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                      Website / Sosmed
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-xs outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100"
                      placeholder="www.bisnis.com"
                      value={storeConfig.company_website || ""}
                      onChange={(e) =>
                        setStoreConfig({
                          ...storeConfig,
                          company_website: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="col-span-full space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                    Baris 4: Alamat Resmi Lengkap
                  </label>
                  <textarea
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold h-16 text-xs resize-none outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100"
                    value={storeConfig.company_address}
                    onChange={(e) =>
                      setStoreConfig({
                        ...storeConfig,
                        company_address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* PAJAK */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-emerald-600 ml-1">
                  Pajak (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 p-2 rounded-lg font-black text-xs outline-none text-emerald-600"
                  value={storeConfig.tax_percentage}
                  onChange={(e) =>
                    setStoreConfig({
                      ...storeConfig,
                      tax_percentage: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-emerald-600 ml-1">
                  Tipe Pajak
                </label>
                <select
                  className="w-full bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/30 p-2 rounded-lg font-black text-[10px] outline-none text-emerald-600 cursor-pointer"
                  value={storeConfig.tax_type}
                  onChange={(e) =>
                    setStoreConfig({ ...storeConfig, tax_type: e.target.value })
                  }
                >
                  <option value="gross_revenue">DARI OMZET (PPH FINAL)</option>
                  <option value="net_profit">DARI LABA BERSIH</option>
                </select>
              </div>
            </div>
          </section>

          <button
            onClick={saveStoreConfig}
            disabled={isSaving}
            className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 w-full md:w-auto"
          >
            {isSaving ? "MENYIMPAN..." : "SIMPAN SEMUA PERUBAHAN"}
          </button>
        </div>

        {/* PREVIEW KOP */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Preview Kop Laporan
            </h4>
            <div className="border-2 border-slate-100 dark:border-slate-800 p-6 rounded-xl bg-white dark:bg-slate-900 shadow-inner overflow-hidden">
              {/* OFFICIAL HEADER STRUCTURE */}
              <div className="flex justify-between items-center w-full border-b-[3px] border-double border-slate-900 pb-4">
                {/* 1. KIRI: LOGO */}
                <div className="w-20 h-20 shrink-0 flex items-center justify-center overflow-hidden border border-slate-100 bg-white rounded-lg">
                  {storeConfig.company_logo_url ? (
                    <img
                      src={`${API_URL}/uploads/${storeConfig.company_logo_url}`}
                      className="w-full h-full object-contain"
                      alt="Logo"
                    />
                  ) : (
                    <span className="text-[6px] font-bold text-slate-300">
                      LOGO
                    </span>
                  )}
                </div>

                {/* 2. TENGAH: TEKS HIERARKI (Ukuran dikembalikan ke asli, pr-20 dihapus) */}
                <div className="flex-1 w-full text-center px-2">
                  <h5 className="text-[10px] font-black uppercase tracking-tight leading-tight text-slate-900">
                    {storeConfig.company_name || "INSTANSI UTAMA"}
                  </h5>

                  {storeConfig.company_tagline && (
                    <h6 className="text-[6px] font-bold uppercase text-slate-700 mt-0.5">
                      {storeConfig.company_tagline}
                    </h6>
                  )}

                  <div className="mt-1 space-y-0.5">
                    <p className="text-[4px] font-medium text-slate-600 leading-tight italic">
                      {storeConfig.company_address ||
                        "Alamat lengkap kantor pusat..."}
                    </p>
                    <p className="text-[4px] font-black text-slate-500 uppercase tracking-tight">
                      {[
                        storeConfig.company_whatsapp &&
                        `WA: ${storeConfig.company_whatsapp}`,
                        storeConfig.company_email &&
                        `Email: ${storeConfig.company_email}`,
                        storeConfig.company_website &&
                        `Web: ${storeConfig.company_website}`,
                      ]
                        .filter(Boolean)
                        .join("  |  ") || "Kontak Perusahaan Belum Diisi"}
                    </p>
                  </div>
                </div>
              </div>

              {/* OFFICIAL DOUBLE BORDER SEPARATOR */}
              <div className="mt-4 border-b-[4px] border-double border-slate-900 dark:border-white"></div>

              <div className="py-6 flex flex-col items-center justify-center border border-dashed border-slate-100 dark:border-slate-800 rounded-lg opacity-40">
                <div className="w-16 h-1.5 bg-slate-100 dark:border-slate-800 rounded-full"></div>
                <span className="mt-3 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Content Laporan Keuangan
                </span>
              </div>
            </div>
          </div>

          {/* SINKRONISASI GOOGLE SHEET (Dinamis untuk Worker) */}
          <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black italic uppercase text-[11px] text-slate-400 border-b dark:border-slate-800 pb-1 tracking-widest">
              Cloud Synchronization
            </h3>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-blue-600 ml-1 flex justify-between">
                Google Apps Script URL
                <span className="text-slate-300 font-normal normal-case">
                  (Internal Engine)
                </span>
              </label>
              <input
                type="text"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg font-bold text-[10px] outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={storeConfig.gas_url || ""}
                onChange={(e) =>
                  setStoreConfig({
                    ...storeConfig,
                    gas_url: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* SYSTEM */}
          <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black italic uppercase text-[11px] text-slate-400 border-b dark:border-slate-800 pb-1 tracking-widest">
              System & Security
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="w-full bg-white dark:bg-slate-800 border border-emerald-100 text-emerald-600 text-[9px] font-black py-3 rounded-xl uppercase shadow-sm"
              >
                {isBackingUp ? "MEMPROSES..." : "📥 BACKUP DATABASE"}
              </button>
              <button
                onClick={handleRestoreClick}
                disabled={isRestoring}
                className="w-full bg-white dark:bg-slate-800 border border-rose-100 text-rose-600 text-[9px] font-black py-3 rounded-xl uppercase shadow-sm"
              >
                {isRestoring ? "⚡ RESTORING..." : "📤 RESTORE DATABASE"}
              </button>
            </div>
            <input
              type="file"
              id="fileRestore"
              accept=".sql"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabStore;
