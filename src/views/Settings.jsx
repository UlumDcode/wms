import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../utils/axios";
import { TOKEN_KEY, decodeData } from "../utils/storage";
const SYNC_HOST = import.meta.env.VITE_SYNC_URL || "https://sync.zulkan.id";
import StrukTab from "../components/seting/StrukTab";
import TabStore from "../components/seting/TabStore";
import TabWhatsApp from "../components/seting/TabWhatsApp";
import TabSyncLog from "../components/seting/TabSyncLog";
import TabAkuntansi from "../components/seting/TabAkuntansi";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [failedLogCount, setFailedLogCount] = useState(0);
  const [syncLogs, setSyncLogs] = useState([]);
  const [logFilter, setLogFilter] = useState("all");
  const [waStatus, setWaStatus] = useState(null);
  const [testTarget, setTestTarget] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isFetchingStatus, setIsFetchingStatus] = useState(false);
  const [previewStats, setPreviewStats] = useState(null);
  const [coaList, setCoaList] = useState([]);
  const [waConfig, setWaConfig] = useState({
    token: "",
    kirim_nota_pos: true,
    kirim_nota_inbound: true,
    kirim_nota_keuangan: true,
    kirim_laporan_hpp: false,
    kirim_notif_internal_staff: true,
    kirim_notif_bulk_settle: true,
    kirim_notif_outbound_status: true,
    kirim_notif_stok_kritis: true,
    kirim_rekap_harian: true, // NEW: Notifikasi Rekap Harian
    kirim_notif_gaji_owner: true,
    kirim_notif_reject: true,
    jam_rekap_harian: "22",
  });
  const [storeConfig, setStoreConfig] = useState({
    app_name: "ARULINV",
    app_subtitle: "MANAGEMENT SYSTEM",
    nama_toko: "Toko Arul",
    alamat: "Pekalongan",
    telepon: "",
    sosmed: "",
    pesan_struk: "",
    template_pos: "",
    gas_url: "",
    template_inbound: "",
    template_notif_internal: "",
    template_bulk_settle: "",
    template_status_update: "",
    template_stok_kritis: "",
    template_rekap_harian: "", // NEW: Template Rekap Harian
    template_pelunasan_piutang: "",
    template_pelunasan_hutang: "",
    acc_code_kas: "",
    acc_code_persediaan: "",
    acc_code_hutang: "",
    acc_code_piutang: "",
    acc_code_pendapatan: "",
    acc_code_gaji: "",
    acc_code_biaya_umum: "",
    acc_code_beban_reject: "",
    acc_code_deposit: "",
    acc_code_modal: "",
    company_name: "",
    header_line_1: "",
    header_line_2: "",
    company_tagline: "", // Baris tambahan untuk detail perusahaan
    company_website: "",
    company_address: "",
    company_whatsapp: "",
    company_email: "",
    company_instagram: "",
    company_tiktok: "",
    company_logo_url: "",
    tax_percentage: "0.5",
    tax_type: "gross_revenue",
  });

  useEffect(() => {
    // Load semua config di awal agar state sinkron
    fetchAllConfigs();
    if (activeTab === "sync") fetchSyncLogs();
    if (activeTab === "struk") fetchPreviewStats();
    if (activeTab === "accounting") fetchCoaList();
  }, [activeTab]);

  const fetchAllConfigs = async () => {
    try {
      const res = await axiosInstance.get("settings.php?action=get_store");
      const data = res.data;
      if (data) {
        setStoreConfig(data);
        // Juga update waConfig dari data yang sama
        const newWaConfig = {
          token: data.wa_token || "",
          kirim_nota_pos: data.kirim_nota_pos ?? true,
          kirim_nota_inbound: data.kirim_nota_inbound ?? true,
          kirim_nota_keuangan: data.kirim_nota_keuangan ?? true,
          kirim_laporan_hpp: data.kirim_laporan_hpp ?? false,
          kirim_notif_internal_staff: data.kirim_notif_internal_staff ?? true,
          kirim_notif_penjualan_owner: data.kirim_notif_penjualan_owner ?? true,
          kirim_notif_bulk_settle: data.kirim_notif_bulk_settle ?? true,
          kirim_notif_outbound_status: data.kirim_notif_outbound_status ?? true,
          kirim_notif_stok_kritis: data.kirim_notif_stok_kritis ?? true,
          kirim_rekap_harian: data.kirim_rekap_harian ?? true,
          kirim_notif_gaji_owner: data.kirim_notif_gaji_owner ?? true,
          kirim_notif_reject: data.kirim_notif_reject ?? true,
          jam_rekap_harian: data.jam_rekap_harian || "22",
        };
        setWaConfig(newWaConfig);
        if (newWaConfig.token && activeTab === "wa")
          fetchWaStatus(newWaConfig.token, true);
      }
    } catch (e) {
      console.error("Gagal load config");
    }
  };

  const fetchStoreConfig = async () => {
    await fetchAllConfigs();
  };

  const filteredLogs = useMemo(() => {
    if (logFilter === "all") return syncLogs;
    return syncLogs.filter((log) => log.status === logFilter);
  }, [syncLogs, logFilter]);

  // Hitung jumlah log yang failed
  useEffect(() => {
    setFailedLogCount(syncLogs.filter((log) => log.status === "failed").length);
  }, [syncLogs, logFilter]);

  const fetchWaConfig = async () => {
    await fetchAllConfigs();
  };

  const getAuthToken = () => {
    const encodedToken =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const legacyToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return decodeData(encodedToken) || legacyToken || null;
  };

  const authHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchWaStatus = async (tokenOverride = null, silent = false) => {
    const token = tokenOverride || waConfig.token;
    if (!token) return;

    setIsFetchingStatus(true);
    try {
      const res = await axiosInstance.get("settings.php?action=get_wa_status");
      const data = res.data;
      setWaStatus(data);
      if (data.status && !silent)
        window.showToast("Status WA diperbarui!", "success");
    } catch (e) {
      console.error("Gagal cek status WA");
    } finally {
      setIsFetchingStatus(false);
    }
  };

  const fetchPreviewStats = async () => {
    try {
      const res = await axiosInstance.get(
        "settings.php?action=get_preview_stats",
      );
      const data = res.data;
      if (data) setPreviewStats(data);
    } catch (e) {
      console.error("Gagal load preview stats");
    }
  };

  const fetchCoaList = async () => {
    try {
      const res = await axiosInstance.get("settings.php?action=get_coa_list");
      const data = res.data;
      setCoaList(data.data || []);
    } catch (e) {
      console.error("Gagal load COA list");
    }
  };

  const handleTestWa = async () => {
    if (!testTarget)
      return window.showToast("Masukkan nomor tujuan!", "warning");
    setIsTesting(true);
    try {
      const res = await axiosInstance.post("settings.php?action=test_wa", {
        target: testTarget,
      });
      const data = res.data;
      if (data.status) {
        window.showToast("Pesan tes terkirim!", "success");
      } else {
        window.showToast(data.reason || "Gagal kirim pesan tes", "error");
      }
    } catch (e) {
      window.showToast("Kesalahan koneksi", "error");
    } finally {
      setIsTesting(false);
    }
  };

  const fetchSyncLogs = async (isManual = false) => {
    if (isManual) setIsLogsLoading(true);
    try {
      const res = await fetch(`${SYNC_HOST}/api/queue/logs`, {
        method: "GET",
        mode: "cors",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSyncLogs(data.data || []);
      if (isManual) window.showToast("Log sinkronisasi diperbarui!", "success");
    } catch (e) {
      setFailedLogCount(0); // Reset count on error
      console.error("Gagal load sync logs", e);
      if (isManual) window.showToast("Gagal memuat log sync", "error");
    } finally {
      if (isManual) setIsLogsLoading(false);
    }
  };

  const handleClearSyncLogs = async () => {
    const isConfirmed = await window.showConfirm(
      "Hapus semua log antrean yang sukses?",
    );
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${SYNC_HOST}/api/queue/clear`, {
        method: "POST",
        mode: "cors",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "success") {
        window.showToast(data.message, "success");
        fetchSyncLogs();
      }
    } catch (e) {
      console.error("Gagal membersihkan log");
    }
  };

  const handleRetrySync = async (id) => {
    try {
      const res = await fetch(`${SYNC_HOST}/api/queue/retry/${id}`, {
        method: "POST",
        mode: "cors",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "success") {
        window.showToast("Tugas dikembalikan ke antrean", "success");
        fetchSyncLogs();
      }
    } catch (e) {
      console.error("Gagal retry");
    }
  };

  // RESET TEMPLATE KE DEFAULT
  const handleResetTemplates = async () => {
    const isConfirmed = await window.showConfirm(
      "Reset semua template nota ke pengaturan awal?",
    );
    if (!isConfirmed) return;

    const defaultPOS =
      "*{{nama_toko}}*\n{{alamat}}\n--------------------------------\n*NOTA PENJUALAN*\n\nNo: {{no_trx}}\nTanggal: {{tanggal}}\nCustomer: {{customer}}\n\n{{items}}\n\n*Total: Rp {{total}}*\nBayar: Rp {{terbayar}}\nSisa: Rp {{sisa}}\n\n{{pesan_struk}}";
    const defaultInbound =
      "*{{nama_toko}}*\n--------------------------------\n*NOTA PEMBELIAN (INBOUND)*\n\nNo. PO: {{no_trx}}\nProduk: {{items}}\nTotal: Rp {{total}}\nStatus: {{status}}\n\nMohon dicek kembali. Terima kasih.";
    const defaultInternal =
      "📢 *NOTIFIKASI INBOUND BARU*\n\nSupplier: *{{supplier}}*\nNo. PO: {{no_trx}}\nBarang: {{items}}\nTotal Tagihan: Rp {{total}}\nStatus: {{status}}\n\nMohon segera ditindaklanjuti untuk proses pembayaran. 🙏";
    const defaultBulkSettle =
      "✅ *SETTLEMENT MARKETPLACE*\n\nResi: {{no_resi}}\nNominal Cair: Rp {{total}}\nStatus: {{status}}\n\nDana sudah masuk ke rekening {{nama_toko}}.";
    const defaultStatusUpdate =
      "🔄 *UPDATE STATUS TRANSAKSI*\n\nNo. Invoice: {{no_trx}}\nStatus Baru: *{{status}}*\n\nCatatan: Status pesanan Anda telah diperbarui.";
    const defaultStokKritis =
      "⚠️ *STOK KRITIS!*\n\nBarang: *{{items}}*\nSisa Stok: {{total}} {{status}}\nBatas Minimal: {{sisa}}\n\nSegera lakukan restock untuk barang ini. 📦";

    const defaultRekapHarian =
      "📊 *REKAP HARIAN TOKO {{nama_toko}}* 📊\n--------------------------------\nTanggal: *{{tanggal_rekap}}*\n\n*PENJUALAN HARI INI:*\nTotal Omzet: *Rp {{total_penjualan}}*\nJumlah Transaksi: *{{jumlah_transaksi}}*\n\n*STATUS KEUANGAN (Outstanding):*\nSisa Piutang: *Rp {{sisa_piutang}}*\nSisa Hutang: *Rp {{sisa_hutang}}*\n\n--------------------------------\nSemangat terus, Bos! 💪";

    const defaultPiutang =
      "*{{nama_toko}}*\n--------------------------------\n*BUKTI PEMBAYARAN PIUTANG*\n\nKepada: {{pihak}}\nNo. Ref: {{no_trx}}\n\nNominal: Rp {{terbayar}}\nSisa Piutang: Rp {{sisa}}\nStatus: {{status}}\n\nTerima kasih atas pembayarannya. 🙏";
    const defaultHutang =
      "*{{nama_toko}}*\n--------------------------------\n*BUKTI PEMBAYARAN HUTANG*\n\nKepada: {{pihak}}\nNo. Ref: {{no_trx}}\n\nNominal: Rp {{terbayar}}\nSisa Hutang: Rp {{sisa}}\nStatus: {{status}}\n\nBukti pembayaran ini sah dari sistem kami. 🙏";

    setStoreConfig({
      ...storeConfig,
      template_pos: defaultPOS,
      template_inbound: defaultInbound,
      template_notif_internal: defaultInternal,
      template_bulk_settle: defaultBulkSettle,
      template_status_update: defaultStatusUpdate,
      template_stok_kritis: defaultStokKritis,
      template_rekap_harian: defaultRekapHarian,
      template_pelunasan_piutang: defaultPiutang,
      template_pelunasan_hutang: defaultHutang,
    });
    window.showToast(
      "Template dikembalikan ke default. Jangan lupa simpan!",
      "info",
    );
  };

  const formatPreview = (template) => {
    if (!template) return "Template masih kosong. Silakan ketik sesuatu...";

    const dummy = {
      nama_toko: storeConfig.nama_toko || "Nama Toko Anda",
      alamat: storeConfig.alamat || "Alamat Toko Lengkap",
      telepon: storeConfig.telepon || "08123456789",
      sosmed: storeConfig.sosmed || "@sosmed_toko",
      pesan_struk: storeConfig.pesan_struk || "Terima kasih telah berbelanja!",
      no_trx: "OUT-20231027-001",
      tanggal: new Date().toLocaleString("id-ID"),
      no_resi: "JP1234567890",
      customer: "Pelanggan Contoh",
      size: "XL",
      supplier: "Supplier ABC",
      pihak: "Pihak Terkait",
      items: "2x Kaos Distro Premium (XL)\n1x Celana Cargo (L)",
      total: "350.000",
      terbayar: "400.000",
      sisa: "50.000",
      sisa_piutang: previewStats?.sisa_piutang || "150.000",
      sisa_hutang: previewStats?.sisa_hutang || "200.000",
      status: "SELESAI",
      tanggal_rekap: new Date().toLocaleDateString("id-ID"), // Dummy for daily recap
      total_penjualan: previewStats?.total_penjualan || "0",
      jumlah_transaksi: previewStats?.jumlah_transaksi || "0",
    };

    let result = template;
    Object.keys(dummy).forEach((key) => {
      // Menggunakan replaceAll agar semua kemunculan variabel terganti
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      result = result.replace(regex, dummy[key]);
    });

    return result;
  };

  const saveStoreConfig = async () => {
    setIsSaving(true);
    try {
      const res = await axiosInstance.post(
        "settings.php?action=save_store",
        storeConfig,
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast("Konfigurasi Toko disimpan!", "success");
        // Update favicon & title secara real-time
        if (storeConfig.company_logo_url) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = storeConfig.company_logo_url;
        }
        if (storeConfig.app_name) {
          document.title = storeConfig.app_name;
        }
      } else {
        window.showToast(data.message, "error");
      }
    } catch (e) {
      window.showToast("Gagal simpan konfigurasi", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const saveWaConfig = async (tokenOverride = null) => {
    setIsSaving(true);
    const tokenToSave =
      typeof tokenOverride === "string" ? tokenOverride : waConfig.token;
    const mergedData = {
      ...storeConfig,
      wa_token: tokenToSave,
      kirim_nota_pos: waConfig.kirim_nota_pos,
      kirim_nota_inbound: waConfig.kirim_nota_inbound,
      kirim_nota_keuangan: waConfig.kirim_nota_keuangan,
      kirim_laporan_hpp: waConfig.kirim_laporan_hpp,
      kirim_notif_internal_staff: waConfig.kirim_notif_internal_staff,
      kirim_notif_penjualan_owner: waConfig.kirim_notif_penjualan_owner,
      kirim_notif_bulk_settle: waConfig.kirim_notif_bulk_settle,
      kirim_notif_outbound_status: waConfig.kirim_notif_outbound_status,
      kirim_notif_stok_kritis: waConfig.kirim_notif_stok_kritis,
      kirim_rekap_harian: waConfig.kirim_rekap_harian,
      kirim_notif_gaji_owner: waConfig.kirim_notif_gaji_owner,
      kirim_notif_reject: waConfig.kirim_notif_reject,
      jam_rekap_harian: waConfig.jam_rekap_harian,
    };
    try {
      const res = await axiosInstance.post(
        "settings.php?action=save_store",
        mergedData,
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast("Pengaturan WhatsApp disimpan!", "success");
        setStoreConfig(mergedData);
        // Segera cek status koneksi setelah token disimpan
        fetchWaStatus(waConfig.token, false);
      }
    } catch (e) {
      window.showToast("Gagal simpan WA config", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getWaQr = async () => {
    setLoading(true);
    setQrCode("");
    try {
      const res = await axiosInstance.get("settings.php?action=get_qr");
      const data = res.data;
      if (data.status === true && data.url) {
        // Tambahkan prefix data:image/png;base64, agar browser bisa merender teks menjadi gambar
        const imageSrc = data.url.startsWith("data:image")
          ? data.url
          : "data:image/png;base64," + data.url;
        setQrCode(imageSrc);
        window.showToast("QR Code berhasil dimuat!", "success");
      } else {
        window.showToast(
          data.reason || "Pastikan token benar & device aktif!",
          "error",
        );
      }
    } catch (e) {
      window.showToast("Server Error!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    const isConfirmed = await window.showConfirm(
      "Yakin ingin memutuskan koneksi WhatsApp ini? Anda harus scan QR lagi nanti.",
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axiosInstance.post("settings.php?action=disconnect_wa");
      const data = res.data;

      if (data.status === true) {
        window.showToast("WhatsApp berhasil diputuskan!", "success");
        setQrCode(""); // Clear QR image
      } else {
        window.showToast(data.message || "Gagal memutuskan koneksi.", "error");
      }
    } catch (err) {
      window.showToast("Terjadi kesalahan server saat disconnect.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await axiosInstance.get("database.php?action=backup", {
        responseType: "blob",
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_database_${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      window.showToast("Database berhasil diunduh!", "success");
    } catch (error) {
      window.showToast("Gagal melakukan backup database", "error");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreClick = () => {
    document.getElementById("fileRestore").click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isConfirmed = await window.showConfirm(
      "PERINGATAN: Semua data saat ini akan terhapus dan diganti dengan data dari file backup. Lanjutkan?",
    );
    if (!isConfirmed) {
      e.target.value = "";
      return;
    }
    setIsRestoring(true);
    const formData = new FormData();
    formData.append("backup_file", file);
    try {
      const res = await axiosInstance.post(
        "database.php?action=restore",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast(data.message, "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        window.showToast(data.message || "Gagal restore", "error");
      }
    } catch (error) {
      window.showToast("Terjadi kesalahan sistem saat restore", "error");
    } finally {
      setIsRestoring(false);
      e.target.value = "";
    }
  };

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 text-slate-900 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <button
          onClick={() => setActiveTab("store")}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "store" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"}`}
        >
          🏪 Toko
        </button>
        <button
          onClick={() => setActiveTab("struk")}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "struk" ? "bg-purple-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"}`}
        >
          📄 Struk
        </button>
        <button
          onClick={() => setActiveTab("wa")}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "wa" ? "bg-emerald-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"}`}
        >
          📱 WhatsApp
        </button>
        <button
          onClick={() => setActiveTab("accounting")}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "accounting" ? "bg-amber-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"}`}
        >
          ⚖️ Akuntansi
        </button>
        <button
          onClick={() => setActiveTab("sync")}
          className={`relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "sync" ? "bg-purple-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"}`}
        >
          🔄 Sync Log
          {failedLogCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
              {failedLogCount}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "store" && (
          <TabStore
            storeConfig={storeConfig}
            setStoreConfig={setStoreConfig}
            isSaving={isSaving}
            saveStoreConfig={saveStoreConfig}
            handleBackup={handleBackup}
            isBackingUp={isBackingUp}
            handleRestoreClick={handleRestoreClick}
            isRestoring={isRestoring}
            handleFileChange={handleFileChange}
          />
        )}

        {activeTab === "struk" && (
          <StrukTab
            storeConfig={storeConfig}
            setStoreConfig={setStoreConfig}
            isSaving={isSaving}
            saveStoreConfig={saveStoreConfig}
            handleResetTemplates={handleResetTemplates}
            formatPreview={formatPreview}
          />
        )}

        {activeTab === "wa" && (
          <TabWhatsApp
            waConfig={waConfig}
            setWaConfig={setWaConfig}
            waStatus={waStatus}
            isFetchingStatus={isFetchingStatus}
            fetchWaStatus={fetchWaStatus}
            saveWaConfig={saveWaConfig}
            isSaving={isSaving}
            loading={loading}
            handleDisconnect={handleDisconnect}
            getWaQr={getWaQr}
            qrCode={qrCode}
            testTarget={testTarget}
            setTestTarget={setTestTarget}
            handleTestWa={handleTestWa}
            isTesting={isTesting}
          />
        )}

        {activeTab === "accounting" && (
          <TabAkuntansi
            storeConfig={storeConfig}
            setStoreConfig={setStoreConfig}
            coaList={coaList}
            saveStoreConfig={saveStoreConfig}
            isSaving={isSaving}
          />
        )}

        {activeTab === "sync" && (
          <TabSyncLog
            logFilter={logFilter}
            setLogFilter={setLogFilter}
            handleClearSyncLogs={handleClearSyncLogs}
            fetchSyncLogs={fetchSyncLogs}
            isLogsLoading={isLogsLoading}
            filteredLogs={filteredLogs}
            syncLogs={syncLogs}
            handleRetrySync={handleRetrySync}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
