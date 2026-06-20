import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../utils/axios";
import { Html5Qrcode } from "html5-qrcode";
import { playBeep, playSuccessSound, playErrorSound } from "./usePosScanner";

/**
 * Fungsi pembantu untuk menentukan nama tampilan prioritas dari objek order
 */
export const getDisplayName = (order) => {
  if (!order) return "-";
  return order.nama_store || order.nama_pembeli || order.nama_channel || "Umum";
};

/**
 * Fungsi untuk mengambil nomor HP dari order
 */
export const getPhoneExtracted = (order) => {
  if (!order) return "";
  return order.no_hp || "";
};

/**
 * Fungsi untuk menentukan warna label berdasarkan status outbound
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "sukses":
      return "bg-emerald-100 text-emerald-600";
    case "pending":
      return "bg-amber-100 text-amber-600 border-amber-200";
    case "dikirim":
      return "bg-blue-100 text-blue-600";
    case "retur":
    case "retur selesai":
      return "bg-purple-100 text-purple-600";
    case "reject":
    case "batal":
      return "bg-rose-100 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

export const useMonitoring = (config = {}) => {
  const { initialStartDate = "", initialEndDate = "" } = config;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalData, setTotalData] = useState(0);

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scannerMode, setScannerMode] = useState("fast"); // "fast" (Kilat Restock) atau "modal" (Form Verifikasi)
  const html5QrCodeRef = useRef(null);

  // UI Modal States
  const [isUploading, setIsUploading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showManualSettle, setShowManualSettle] = useState(false);
  const [selectedOrderToSettle, setSelectedOrderToSettle] = useState(null);
  const [showProsesRetur, setShowProsesRetur] = useState(false);
  const [selectedRetur, setSelectedRetur] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal Reject/Retur (Form Awal)
  const [formRetur, setFormRetur] = useState({
    id: "",
    status: "",
    keterangan: "",
  });
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Debounce Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Reset Halaman ke 1 jika filter berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, filterChannel, startDate, endDate]);

  // 3. Fetch Data Utama (Server-Side)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: "read_outbound",
        page,
        limit,
        search: debouncedSearch,
        status: filterStatus,
        channel: filterChannel,
        start_date: startDate,
        end_date: endDate,
      });

      const res = await axiosInstance.get(`pos.php?${params.toString()}`);
      const result = res.data;

      if (result.status === "success") {
        setOrders(result.data || []);
        setTotalData(result.total_data || 0);
      }
    } catch (e) {
      console.error("Gagal load data monitoring");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    filterStatus,
    filterChannel,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 5. Action Handlers (Dipindah ke atas agar tidak error "before initialization")
  const updateStatus = useCallback(
    async (id, status, silent = false) => {
      try {
        const res = await axiosInstance.post(
          "pos.php?action=update_outbound_status",
          { id, status }
        );
        const result = res.data;
        if (result.status === "success") {
          if (!silent)
            window.showToast("Status berhasil diperbarui!", "success");
          fetchOrders();
          playSuccessSound();
        } else {
          window.showToast(result.message, "error");
          playErrorSound();
        }
      } catch (e) {
        window.showToast("Gagal update status", "error");
        playErrorSound();
      }
    },
    [fetchOrders],
  );

  // 3.5. Logika Fast Track (Scan -> Masuk Gudang)
  const processFastTrack = useCallback(
    async (code) => {
      const text = code.trim().toLowerCase();
      if (!text) return;

      // Cari order yang cocok di dalam list orders saat ini
      const matchedOrders = orders.filter(
        (o) => (o.no_resi || "").toLowerCase() === text,
      );

      let updatedCount = 0;
      for (const order of matchedOrders) {
        // Hanya proses jika statusnya masih Dikirim (MP) atau Retur (MP yang nunggu kondisi)
        if (order.status === "Retur" || order.status === "Dikirim") {
          await updateStatus(order.id, "Retur Selesai", true);
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        window.showToast(
          `Auto-Restock: ${updatedCount} Barang Masuk Gudang!`,
          "success",
        );
        playSuccessSound();
        fetchOrders(); // Refresh data
      }
    },
    [orders, updateStatus, fetchOrders],
  );

  const handleBarcodeScan = useCallback(
    async (barcode) => {
      const text = barcode.trim();
      if (!text) return;

      if (scannerMode === "fast") {
        await processFastTrack(text);
      } else {
        // Form Verifikasi (Modal)
        setLoading(true);
        try {
          const res = await axiosInstance.get(
            `pos.php?action=get_order_by_resi&resi=${encodeURIComponent(text)}`
          );
          const data = res.data;
          if (data.status === "success" && data.data) {
            playSuccessSound();
            await openModalRetur(data.data, "retur");
          } else {
            window.showToast(data.message || "Order dengan resi tersebut tidak ditemukan.", "error");
            playErrorSound();
          }
        } catch (e) {
          window.showToast("Gagal mengambil data order", "error");
          playErrorSound();
        } finally {
          setLoading(false);
        }
      }
    },
    [scannerMode, processFastTrack, openModalRetur]
  );

  const handleBarcodeScanRef = useRef(null);
  useEffect(() => {
    handleBarcodeScanRef.current = handleBarcodeScan;
  }, [handleBarcodeScan]);


  // 4. Scanner Handlers
  const startScan = () => {
    setIsScanning(true);

    // Pengecekan HTTPS secara dini
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost";
    if (!isSecure) {
      window.showToast(
        "Browser memblokir kamera di koneksi non-HTTPS!",
        "error",
      );
      // Jangan return, biarkan mencoba tapi beri peringatan keras
    }

    if (html5QrCodeRef.current) stopScan(); // Bersihkan instance lama jika ada

    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode("monitoring-scanner");
        html5QrCodeRef.current = qr;
        const boxSize = Math.min(250, window.innerWidth - 60);

        await qr.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: boxSize, height: boxSize },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            playBeep();
            setSearchTerm(decodedText); // Tetap isi search box
            if (handleBarcodeScanRef.current) {
              handleBarcodeScanRef.current(decodedText);
            }
            stopScan();
          },
        );
      } catch (err) {
        console.error("Scanner Error:", err);
        setIsScanning(false);
        window.showToast(
          `Kamera Gagal: ${err.message || "Izin ditolak"}`,
          "error",
        );
      }
    }, 500); // Naikkan sedikit delay agar DOM benar-benar siap
  };

  const stopScan = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning)
          await html5QrCodeRef.current.stop();

        await html5QrCodeRef.current.clear(); // Bersihkan canvas
        html5QrCodeRef.current = null;
      } catch (e) { }
    }
    setIsScanning(false);
  };

  // 5. Action Handlers
  const handleBulkCsvUpload = async (data) => {
    setIsUploading(true);
    try {
      const res = await axiosInstance.post("pos.php?action=bulk_settle_mp", { data });
      const result = res.data;
      if (result.status === "success") {
        window.showToast(`Berhasil update ${result.count} data!`, "success");
        setShowBulkModal(false);
        fetchOrders();
      } else {
        window.showToast(result.message, "error");
      }
    } catch (e) {
      window.showToast("Gagal upload data CSV", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const openManualSettle = (order) => {
    setSelectedOrderToSettle(order);
    setShowManualSettle(true);
  };

  const submitManualSettle = async (formData) => {
    try {
      const res = await axiosInstance.post(
        "pos.php?action=update_outbound_status",
        {
          id: selectedOrderToSettle.id,
          status: "Sukses",
          ...formData,
        }
      );
      const result = res.data;
      if (result.status === "success") {
        window.showToast("Dana marketplace berhasil dicairkan!", "success");
        setShowManualSettle(false);
        fetchOrders();
      } else {
        window.showToast(result.message, "error");
      }
    } catch (e) {
      window.showToast("Gagal proses settlement", "error");
    }
  };

  const openProsesRetur = (order) => {
    setSelectedRetur(order);
    setShowProsesRetur(true);
  };

  const submitProsesRetur = async (formData) => {
    try {
      const res = await axiosInstance.post(
        "pos.php?action=update_outbound_status",
        {
          id: selectedRetur.id,
          ...formData,
        }
      );
      const result = res.data;
      if (result.status === "success") {
        window.showToast("Kondisi retur berhasil disimpan!", "success");
        setShowProsesRetur(false);
        fetchOrders();
      } else {
        window.showToast(result.message, "error");
      }
    } catch (e) {
      window.showToast("Gagal proses retur", "error");
    }
  };

  async function openModalRetur(order, mode) {
    setLoadingDetails(true);
    try {
      // 1. Ambil detail item terbaru dari server
      const res = await axiosInstance.get(
        `pos.php?action=read_outbound_detail&id=${order.id}`
      );
      const data = res.data;
      const itemsData = Array.isArray(data) ? data : [];

      // 2. Siapkan data item untuk form retur (qty_reject mulai dari 0)
      const initialItems = itemsData.map((item) => ({
        inventory_id: item.inventory_id,
        nama_barang: item.nama_barang,
        kode_barang: item.kode_barang,
        qty_order: item.qty,
        qty_reject: 0,
        price_per_pcs:
          (parseFloat(item.subtotal) || 0) / (parseInt(item.qty) || 1),
      }));

      // 3. Inisialisasi form secara lengkap SEBELUM modal dibuka
      setFormRetur({
        id: order.id,
        status: mode === "reject" ? "Reject" : "Retur",
        no_invoice: order.no_invoice || "",
        nama_pembeli: order.nama_pembeli || order.nama_channel || "",
        no_hp_pembeli: order.no_hp || "",
        items: initialItems,
        kondisi_barang: "Cacat",
        opsi_kompensasi: "Ganti Barang",
        rekening_id: "",
        nominal_bayar: 0,
        alasan: "",
        order_data: order, // Simpan data order asli di sini
      });

      setOrderItems(itemsData);
      setShowModal(true); // Modal baru tampil setelah data siap
    } catch (e) {
      console.error("Gagal load detail order", e);
      window.showToast("Gagal mengambil detail barang", "error");
    } finally {
      setLoadingDetails(false);
    }
  };

  const openDetail = async (order) => {
    setSelectedOrderDetail(order);
    setLoadingDetails(true);
    try {
      const res = await axiosInstance.get(
        `pos.php?action=read_outbound_detail&id=${order.id}`
      );
      const data = res.data;
      setOrderItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Gagal load detail order");
    } finally {
      setLoadingDetails(false);
    }
  };

  return {
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    isScanning,
    filterStatus,
    setFilterStatus,
    filterChannel,
    setFilterChannel,
    isUploading,
    showBulkModal,
    setShowBulkModal,
    showManualSettle,
    setShowManualSettle,
    selectedOrderToSettle,
    openManualSettle,
    submitManualSettle,
    showProsesRetur,
    setShowProsesRetur,
    selectedRetur,
    showModal,
    setShowModal,
    formRetur,
    setFormRetur,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedOrderDetail,
    setSelectedOrderDetail,
    orderItems,
    loadingDetails,
    startScan,
    stopScan,
    updateStatus,
    handleBulkCsvUpload,
    openProsesRetur,
    submitProsesRetur,
    openModalRetur,
    openDetail,
    filteredOrders: orders,
    totalData,
    page,
    setPage,
    limit,
    setLimit,
    processFastTrack,
    scannerMode,
    setScannerMode,
    handleBarcodeScan,
  };
};
