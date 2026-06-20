import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";

const TabWhatsApp = ({
  waConfig,
  setWaConfig,
  waStatus,
  isFetchingStatus,
  fetchWaStatus,
  saveWaConfig,
  isSaving,
  loading,
  handleDisconnect,
  getWaQr,
  qrCode,
  testTarget,
  setTestTarget,
  handleTestWa,
  isTesting,
}) => {
  const [fullConfig, setFullConfig] = useState({});

  useEffect(() => {
    // Load full config untuk keperluan merge data saat simpan
    const loadFull = async () => {
      try {
        const res = await axiosInstance.get("settings.php?action=get_store");
        const data = res.data;
        if (data) setFullConfig(data);
      } catch (e) {
        console.error("Gagal load config WA");
      }
    };
    loadFull();
  }, []);

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
        <h3 className="font-black italic uppercase text-sm text-slate-800 dark:text-slate-100 tracking-tighter">
          Integrasi{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            WA Fonnte
          </span>
        </h3>
        {waConfig.token && (
          <button
            onClick={() => setWaConfig({ ...waConfig, token: "" })}
            className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest hover:underline"
          >
            Ganti Token
          </button>
        )}
      </div>

      {!waConfig.token ? (
        <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto shadow-sm">
            💬
          </div>
          <h4 className="font-black uppercase text-xs text-slate-800 dark:text-slate-200">
            Token Diperlukan
          </h4>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 mb-4">
            Masukkan API Token Fonnte untuk memulai
          </p>
          <div className="max-w-sm mx-auto space-y-4">
            <input
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold text-xs text-center outline-none focus:border-emerald-500 dark:focus:border-emerald-500 shadow-sm text-slate-900 dark:text-slate-100"
              value={waConfig?.token || ""}
              onChange={(e) =>
                setWaConfig({ ...waConfig, token: e.target.value.trim() })
              }
            />
            <button
              onClick={() => saveWaConfig(waConfig.token)}
              className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all active:scale-95"
            >
              Hubungkan Sekarang
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KIRI: KONFIGURASI & STATUS */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">
                    API Token Fonnte
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Paste token di sini..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-widest outline-none focus:border-emerald-500"
                      value={waConfig?.token || ""}
                      onChange={(e) =>
                        setWaConfig({ ...waConfig, token: e.target.value })
                      }
                    />
                    <button
                      onClick={() => saveWaConfig(waConfig.token)}
                      disabled={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest px-4 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? "⏳" : "Simpan"}
                    </button>
                  </div>
                </div>

                {/* STATUS DEVICE CARD */}
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-200/50 dark:border-slate-800 pb-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                      Status Perangkat
                    </p>
                    <button
                      onClick={() => fetchWaStatus(waConfig.token, false)}
                      disabled={isFetchingStatus || !waConfig.token}
                      className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 uppercase tracking-tighter transition-all disabled:opacity-50"
                    >
                      {isFetchingStatus ? "⏳ Mengecek..." : "🔄 Cek Status"}
                    </button>
                  </div>
                  {waStatus ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          Koneksi
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase mt-1 ${waStatus.device_status === "connect"
                              ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                            }`}
                        >
                          {waStatus.device_status || "Disconnected"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          Nomor
                        </p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-1">
                          {waStatus.number || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          Nama Device
                        </p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-1">
                          {waStatus.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          Sisa Kuota
                        </p>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1">
                          {waStatus.quota?.toLocaleString() || "0"} Pesan
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic py-2">
                      Klik "Cek Status" untuk melihat detail perangkat
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={waConfig?.kirim_nota_pos || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_nota_pos: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Kirim Nota POS
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Kirim WA otomatis ke pembeli
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-emerald-600"
                    checked={waConfig?.kirim_notif_penjualan_owner ?? true}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_notif_penjualan_owner: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Notif Sales
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Laporan POS ke Owner
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={waConfig?.kirim_notif_internal_staff || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_notif_internal_staff: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Notifikasi Staff
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Info Inbound ke Owner & Finance
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-emerald-600"
                    checked={waConfig?.kirim_nota_keuangan || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_nota_keuangan: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Nota Keuangan
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Bukti pelunasan Hutang/Piutang
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={waConfig?.kirim_nota_inbound || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_nota_inbound: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Kirim Nota Inbound
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Kirim WA otomatis ke Supplier
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={waConfig?.kirim_laporan_hpp || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_laporan_hpp: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Notifikasi HPP
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Rekap HPP otomatis ke Owner
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={waConfig?.kirim_notif_stok_kritis || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_notif_stok_kritis: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Notif Stok Kritis
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Peringatan saat stok menipis
                    </p>
                  </div>
                </label>

                <div className="flex flex-col gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-600"
                      checked={waConfig?.kirim_rekap_harian || false}
                      onChange={(e) =>
                        setWaConfig({
                          ...waConfig,
                          kirim_rekap_harian: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                        Rekap Penjualan
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        Laporan harian otomatis ke Owner
                      </p>
                    </div>
                  </label>
                  {waConfig.kirim_rekap_harian && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 mt-1 animate-in slide-in-from-top-1 duration-200">
                      <span className="text-[8px] font-black uppercase text-slate-400">
                        Jadwal Kirim
                      </span>
                      <select
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        value={waConfig?.jam_rekap_harian || "00"}
                        onChange={(e) =>
                          setWaConfig({
                            ...waConfig,
                            jam_rekap_harian: e.target.value,
                          })
                        }
                      >
                        {[...Array(24)].map((_, i) => {
                          const hr = i.toString().padStart(2, "0");
                          return (
                            <option key={hr} value={hr}>
                              {hr}:00 WIB
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={waConfig?.kirim_notif_bulk_settle || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_notif_bulk_settle: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Bulk Settle MP
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Notif saat upload CSV pencairan
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={waConfig?.kirim_notif_outbound_status || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_notif_outbound_status: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Update Status Retur
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Notif tiap perubahan status retur/claim
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-emerald-600"
                    checked={waConfig?.kirim_notif_gaji_owner || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_notif_gaji_owner: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Notif Gaji ke Owner
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Tembusan laporan gaji ke Owner
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={waConfig?.kirim_notif_reject || false}
                    onChange={(e) =>
                      setWaConfig({
                        ...waConfig,
                        kirim_notif_reject: e.target.checked,
                      })
                    }
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                      Notifikasi Reject
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      Laporan barang cacat (Non-MP) ke Owner
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={saveWaConfig}
                  disabled={isSaving}
                  className="flex-1 bg-slate-900 dark:bg-emerald-600 text-white py-2 rounded-lg font-black uppercase tracking-widest text-[9px] shadow-md hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? "MENYIMPAN..." : "SIMPAN"}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={loading || !waConfig.token}
                  className="flex-1 bg-rose-600 text-white py-2 rounded-lg font-black uppercase tracking-widest text-[9px] shadow-md hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  DISCONNECT
                </button>
              </div>
            </div>

            {/* KANAN: UJI COBA KIRIM */}
            <div className="space-y-4">
              <div className="bg-slate-900 dark:bg-slate-950 p-5 rounded-3xl text-white shadow-xl border dark:border-slate-800">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                  <span className="text-base">🧪</span> Uji Coba Pengiriman
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">
                      Nomor Tujuan (WA)
                    </label>
                    <input
                      type="text"
                      placeholder="08..."
                      className="w-full bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
                      value={testTarget || ""}
                      onChange={(e) => setTestTarget(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleTestWa}
                    disabled={isTesting || !waConfig.token}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isTesting ? "📩 MENGIRIM..." : "KIRIM PESAN TEST"}
                  </button>
                  <p className="text-[8px] text-slate-500 dark:text-slate-600 font-medium italic text-center">
                    Gunakan format 08... atau 62...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TabWhatsApp;
