import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateItemStock } from "../../store/slices/dataSlice";
import { Html5Qrcode } from "html5-qrcode";
import DateRangeFilter from "../../components/DateRangeFilter";
import axiosInstance from "../../utils/axios";
import ModalInbound from "../../components/oprasional/inventory/ModalInbound";

import ModalFormRetur from "../../components/oprasional/inventory/ModalFormRetur";
import ModalDetailRetur from "../../components/oprasional/inventory/ModalDetailRetur";
import ModalScanner from "../../components/oprasional/inventory/ModalScanner";
import ModalBulkInbound from "../../components/oprasional/inventory/ModalBulkInbound";
import ZoomModal from "../../components/ZoomModal";

// Import komponen-komponen tab hasil refactor
import TabStock from "../../components/oprasional/inventory/TabStock";
import TabInbound from "../../components/oprasional/inventory/TabInbound";
import TabRetur from "../../components/oprasional/inventory/TabRetur";

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) { }
};

const Inventory = ({ refreshData }) => {
  const dispatch = useDispatch();
  const rekenings = useSelector((state) => state.data.rekening);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Pagination States
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalData, setTotalData] = useState(0);

  // Inbound & Retur Pagination States
  const [inboundPage, setInboundPage] = useState(1);
  const [inboundLimit, setInboundLimit] = useState(50);
  const [inboundTotal, setInboundTotal] = useState(0);

  const [returPage, setReturPage] = useState(1);
  const [returLimit, setReturLimit] = useState(50);
  const [returTotal, setReturTotal] = useState(0);

  // Form States
  const [inputQty, setInputQty] = useState("");
  const [totalBiaya, setTotalBiaya] = useState("");
  const [supplier, setSupplier] = useState("");
  const [noHpSupplier, setNoHpSupplier] = useState("");

  // State untuk Bulk Inbound
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [targetBulkPo, setTargetBulkPo] = useState(null);

  const [poList, setPoList] = useState([]);
  const [selectedPo, setSelectedPo] = useState("");
  const [remainingPoQty, setRemainingPoQty] = useState(null);
  const [scanInput, setScanInput] = useState("");
  const [inboundTrxList, setInboundTrxList] = useState([]);

  // State Rekening — menggunakan Redux store (bukan fetch independen)
  const [rekeningId, setRekeningId] = useState("");
  const [nominalBayar, setNominalBayar] = useState("");

  // State Retur
  const [returHistory, setReturHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("stock"); // "stock", "inbound", atau "retur"
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [selectedReturDetail, setSelectedReturDetail] = useState(null);
  const [showReturModal, setShowReturModal] = useState(false);
  const [formRetur, setFormRetur] = useState({
    id_transaksi: "",
    qty_retur: "",
    supplier: "",
    alasan: "",
    opsi_kompensasi: "Ganti Barang",
  });
  const [maxReturQty, setMaxReturQty] = useState(0);
  const [refundNominal, setRefundNominal] = useState("");
  const [refundRekeningId, setRefundRekeningId] = useState("");

  const html5QrCodeRef = useRef(null);
  const API_URL =
    localStorage.getItem("CUSTOM_API_URL") ||
    import.meta.env.VITE_API_URL ||
    `http://${window.location.hostname}:8000`;

  // 1. Logic Debounce untuk Pencarian Catalog
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    setInboundPage(1);
    setReturPage(1);
  }, [debouncedSearch]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/inventory.php?action=read_inventory&page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`
      );
      const json = res.data;
      if (json.status === "success") {
        setInventoryItems(json.data || []);
        setTotalData(json.total_data || 0);
      }
    } catch (e) {
      console.error("Gagal load inventory items:", e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    if (activeTab === "stock") {
      fetchInventory();
    } else if (activeTab === "inbound") {
      fetchInboundTrx();
    } else if (activeTab === "retur") {
      fetchRetur();
    }
  }, [
    activeTab,
    fetchInventory,
    inboundPage,
    inboundLimit,
    returPage,
    returLimit,
    debouncedSearch,
  ]);

  useEffect(() => {
    axiosInstance.get("/inventory.php?action=read_pending_po")
      .then((res) => setPoList(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Gagal load history PO:", err);
        setPoList([]);
      });
    // Rekening diambil dari Redux store, tidak perlu fetch independen
  }, []);


  const refreshAll = () => {
    fetchInventory();
    // Tidak memanggil refreshData() / fetchGlobalData() untuk menghemat koneksi database
    // Stok diupdate secara optimistic via Redux dispatch setelah inbound/retur
  };

  const fetchRetur = async () => {
    try {
      const res = await axiosInstance.get(
        `/inventory.php?action=read_retur&page=${returPage}&limit=${returLimit}&search=${encodeURIComponent(debouncedSearch)}`
      );
      const data = res.data;
      if (data.status === "success") {
        setReturHistory(data.data || []);
        setReturTotal(data.total_data || 0);
      }
    } catch (e) {
      console.error("Gagal load history retur:", e);
      setReturHistory([]);
      setReturTotal(0);
    }
  };

  const fetchInboundTrx = async () => {
    try {
      const res = await axiosInstance.get(
        `/inventory.php?action=read_inbound_trx&page=${inboundPage}&limit=${inboundLimit}&search=${encodeURIComponent(debouncedSearch)}`
      );
      const data = res.data;
      if (data.status === "success") {
        setInboundTrxList(data.data || []);
        setInboundTotal(data.total_data || 0);
      } else {
        setInboundTrxList(Array.isArray(data) ? data : []);
        setInboundTotal(Array.isArray(data) ? data.length : 0);
      }
    } catch (e) {
      console.error("Gagal load history inbound trx:", e);
      setInboundTrxList([]);
      setInboundTotal(0);
    }
  };


  useEffect(() => {
    if (formRetur.id_transaksi && showReturModal) {
      const trx = inboundTrxList.find(
        (t) => t.id_transaksi === formRetur.id_transaksi,
      );
      if (trx) {
        const sisaKuotaPO = parseInt(trx.sisa_retur) || 0;
        const stokFisikGudang = parseInt(selectedItem?.stok) || 0;
        setMaxReturQty(Math.min(sisaKuotaPO, stokFisikGudang));
        // Kosongkan agar tidak otomatis terisi nama model HPP
        setFormRetur((prev) => ({ ...prev, supplier: "" }));
      }
    }
  }, [formRetur.id_transaksi, inboundTrxList, selectedItem, showReturModal]);

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  const startScan = () => {
    setIsScanning(true);
    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode("inventory-scanner");
        html5QrCodeRef.current = qr;
        const boxWidth = Math.min(250, window.innerWidth - 60);
        await qr.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: boxWidth, height: boxWidth } },
          (decodedText) => {
            stopScan();
            processBarcode(decodedText);
          },
          () => { },
        );
      } catch (err) {
        setIsScanning(false);
        window.showToast("Izinkan akses kamera browser lu Bro!", "error");
      }
    }, 500);
  };

  const stopScan = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) { }
    }
    setIsScanning(false);
  };

  const processBarcode = (kode) => {
    const item = inventoryItems.find(
      (i) => (i.kode_barang || "").toLowerCase() === kode.toLowerCase(),
    );

    if (item) {
      playBeep();
      if (showModal && selectedItem?.id === item.id) {
        setInputQty((prev) => (parseInt(prev || "0") + 1).toString());
      } else {
        setSelectedItem(item);
        setInputQty("1");
        setTotalBiaya("");
        setSupplier("");
        setNoHpSupplier("");
        setSelectedPo("");
        setRemainingPoQty(null);
        setRekeningId("");
        setNominalBayar("");
        setShowModal(true);
      }
    } else {
      window.showToast("Barcode tidak ditemukan di database!", "error");
    }
  };

  const formatRupiah = (val) => {
    if (!val) return "";
    let strVal = val.toString();
    if (!strVal.includes("Rp") && strVal.includes(".")) {
      strVal = strVal.split(".")[0];
    }
    const clean = strVal.replace(/\D/g, "");
    return "Rp " + new Intl.NumberFormat("id-ID").format(clean);
  };

  const submitInbound = async () => {
    const cleanTotal = parseInt(String(totalBiaya).replace(/\D/g, "")) || 0;
    const cleanNominal = parseInt(String(nominalBayar).replace(/\D/g, "")) || 0;
    let autoStatus = "Pending";
    if (cleanTotal === 0 || cleanNominal >= cleanTotal) autoStatus = "Selesai";

    const qtyIn = parseInt(inputQty);
    if (!qtyIn || qtyIn <= 0)
      return window.showToast("Jumlah masuk (Qty) tidak valid!", "warning");

    if (cleanNominal > 0 && !rekeningId) {
      return window.showToast("Pilih Rekening Pembayaran!", "warning");
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "/inventory.php?action=update_stok",
        {
          id: selectedItem.id,
          qty: qtyIn,
          total_biaya: cleanTotal,
          supplier: supplier,
          no_hp_supplier: noHpSupplier,
          no_po: selectedPo,
          nominal_dibayar: cleanNominal,
          id_rekening: parseInt(rekeningId) || 0,
          status_pembayaran: autoStatus,
        }
      );
      const data = res.data;
      if (data.status === "success") {
        setShowModal(false);
        refreshAll();
        axiosInstance.get("/inventory.php?action=read_pending_po")
          .then((res) => setPoList(Array.isArray(res.data) ? res.data : []));

        fetchInboundTrx();
        window.showToast(
          `BERHASIL! ID Transaksi: ${data.id_transaksi}`,
          "success",
        );
      } else {
        window.showToast(
          data.message || "Gagal memproses transaksi inbound",
          "error",
        );
      }
    } catch (e) {
      window.showToast("Error Server!", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitRetur = async (e) => {
    e.preventDefault();
    const qtyRetur = parseInt(formRetur.qty_retur);
    if (!qtyRetur || qtyRetur <= 0 || !formRetur.supplier)
      return window.showToast("Lengkapi form dengan Qty valid!", "warning");

    if (qtyRetur > maxReturQty) {
      return window.showToast(
        `Maksimal qty retur adalah ${maxReturQty} pcs!`,
        "warning",
      );
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "/inventory.php?action=create_retur",
        {
          inventory_id: selectedItem.id,
          id_transaksi: formRetur.id_transaksi,
          qty_retur: qtyRetur,
          supplier: formRetur.supplier,
          alasan: formRetur.alasan,
          opsi_kompensasi: formRetur.opsi_kompensasi,
        }
      );
      const data = res.data;

      if (data.status === "success") {
        setShowReturModal(false);
        refreshAll();
        fetchRetur();
        fetchInboundTrx();
        window.showToast("Barang ditarik dari gudang & dilaporkan!", "success");
      } else window.showToast(data.message, "error");
    } catch (err) {
      window.showToast("Gagal koneksi server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelesaikanRetur = async (id, opsi) => {
    let cleanNominal = 0;

    if (opsi === "Refund Cash") {
      if (!refundRekeningId)
        return window.showToast("Pilih rekening tujuan refund!", "warning");

      let nominalStr = String(refundNominal).trim();
      if (/^\d+(\.\d+)?$/.test(nominalStr)) {
        cleanNominal = parseFloat(nominalStr);
      } else {
        let cleanStr = nominalStr.replace(/Rp/gi, "").trim();
        cleanStr = cleanStr.split(",")[0];
        cleanStr = cleanStr.replace(/\./g, "");
        cleanNominal = parseFloat(cleanStr) || 0;
      }
      if (cleanNominal <= 0)
        return window.showToast("Nominal refund tidak valid!", "warning");

      const maxRefund =
        (parseFloat(selectedReturDetail.qty_retur) || 0) *
        (parseFloat(selectedReturDetail.harga_beli) || 0);
      if (cleanNominal > maxRefund) {
        return window.showToast(
          `Nominal refund melebihi total modal! (Maks: Rp ${new Intl.NumberFormat("id-ID").format(maxRefund)})`,
          "warning",
        );
      }
    } else {
      const konfirmasi = await window.showConfirm(
        `Sudah menerima kompensasi ${opsi} dari supplier?`,
      );
      if (!konfirmasi) return;
    }

    try {
      const res = await axiosInstance.post(
        "/inventory.php?action=resolve_retur",
        {
          id,
          rekening_id: refundRekeningId ? parseInt(refundRekeningId) : 0,
          nominal_refund: cleanNominal,
        }
      );
      const data = res.data;

      if (data.status === "success") {
        window.showToast(
          "Retur selesai! Stok/Kas sudah disesuaikan.",
          "success",
        );
        setSelectedReturDetail(null);
        refreshAll();
        fetchRetur();
        fetchInboundTrx();
      } else window.showToast(data.message, "error");
    } catch (err) {
      window.showToast("Server error", "error");
    }
  };

  const activePOs = useMemo(() => {
    return poList.filter((po) => {
      const itemIds = (po.inventory_ids || "")
        .toString()
        .split(",")
        .map((id) => parseInt(id.trim()));
      const isItemMatch = itemIds.includes(parseInt(selectedItem?.id));

      const qtyNet = parseFloat(po.qty_inbound_aktual || 0);
      const qtyTarget = parseFloat(po.qty_produksi || 0);

      const isQtyAvailable = qtyTarget === 0 || qtyTarget - qtyNet > 0;
      return isItemMatch && isQtyAvailable;
    });
  }, [poList, selectedItem]);

  const handlePoSelect = (e) => {
    const poId = e.target.value;
    const poData = poList.find((p) => p.id == poId);
    if (poData) {
      setSelectedPo(poData.no_po);
      setSupplier("");
      setNoHpSupplier("");
      const sisa = Math.max(
        0,
        (poData.qty_produksi || 0) - (poData.qty_inbound_aktual || 0),
      );
      setRemainingPoQty(sisa);
    } else {
      setSelectedPo("");
      setSupplier("");
      setNoHpSupplier("");
      setRemainingPoQty(null);
    }
  };

  const cleanTotalInv = parseInt(String(totalBiaya).replace(/\D/g, "")) || 0;
  const cleanNominalInv =
    parseInt(String(nominalBayar).replace(/\D/g, "")) || 0;

  const sisaInv = Math.max(0, cleanTotalInv - cleanNominalInv);
  const autoStatusInv =
    cleanTotalInv === 0 || cleanNominalInv >= cleanTotalInv
      ? "Selesai"
      : "Pending";
  const statusLabelInv =
    autoStatusInv === "Selesai"
      ? "LUNAS"
      : cleanNominalInv > 0
        ? "CICIL"
        : "HUTANG";
  const dibayarInv = cleanNominalInv;

  return (
    <div className="flex flex-col h-full min-h-0 animate-in fade-in duration-500 text-slate-900">
      {/* FUNCTIONAL HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-4 md:mb-6 gap-3 shrink-0">
        <div className="relative w-full md:w-80 group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40 group-focus-within:opacity-100 transition-opacity">
            🔍
          </span>
          <input
            type="text"
            placeholder={
              activeTab === "stock"
                ? "Cari Produk atau Scan Barcode..."
                : "Cari di History..."
            }
            className="w-full bg-white border border-slate-200 py-2.5 pl-9 pr-4 rounded-lg font-bold text-[11px] outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchTerm && activeTab === "stock") {
                processBarcode(searchTerm.trim());
                setSearchTerm("");
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 custom-scrollbar">
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab("stock")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "stock" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              📦 Stok Gudang
            </button>
            <button
              onClick={() => setActiveTab("inbound")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "inbound" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              📥 Inbound
            </button>
            <button
              onClick={() => setActiveTab("retur")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "retur" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              📤 Retur
            </button>
          </div>

          {activeTab !== "stock" && (
            <div className="shrink-0 scale-90 origin-left">
              <DateRangeFilter
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
            </div>
          )}

          {activeTab === "stock" && (
            <button
              onClick={() => {
                setTargetBulkPo(null);
                setShowBulkModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 xl:px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-[0.15em] shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-xs">📦</span>
              <span>BULK INBOUND</span>
            </button>
          )}

          <button
            onClick={isScanning ? stopScan : startScan}
            className={`${isScanning ? "bg-rose-500" : "bg-slate-900 hover:bg-emerald-600"} text-white px-4 xl:px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-[0.15em] shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap ml-auto xl:ml-0`}
          >
            <span className="text-xs">{isScanning ? "🛑" : "📷"}</span>
            <span>{isScanning ? "STOP SCAN" : "SCAN BARCODE"}</span>
          </button>
        </div>
      </div>

      {/* VIEW DYNAMIC CONTAINER FOR TABS */}
      <div className="flex-1 min-h-0">
        {activeTab === "stock" && (
          <TabStock
            inventoryItems={inventoryItems}
            API_URL={API_URL}
            setZoomedImage={setZoomedImage}
            setSelectedItem={setSelectedItem}
            setInputQty={setInputQty}
            setTotalBiaya={setTotalBiaya}
            setSupplier={setSupplier}
            setNoHpSupplier={setNoHpSupplier}
            setSelectedPo={setSelectedPo}
            setRemainingPoQty={setRemainingPoQty}
            setRekeningId={setRekeningId}
            setNominalBayar={setNominalBayar}
            setShowModal={setShowModal}
            setMaxReturQty={setMaxReturQty}
            setFormRetur={setFormRetur}
            setShowReturModal={setShowReturModal}
            totalData={totalData}
            limit={limit}
            setLimit={setLimit}
            page={page}
            setPage={setPage}
          />
        )}

        {activeTab === "inbound" && (
          <TabInbound
            inboundTrxList={inboundTrxList}
            API_URL={API_URL}
            setZoomedImage={setZoomedImage}
            inboundTotal={inboundTotal}
            inboundLimit={inboundLimit}
            setInboundLimit={setInboundLimit}
            inboundPage={inboundPage}
            setInboundPage={setInboundPage}
          />
        )}

        {activeTab === "retur" && (
          <TabRetur
            returHistory={returHistory}
            API_URL={API_URL}
            setZoomedImage={setZoomedImage}
            setRefundNominal={setRefundNominal}
            setRefundRekeningId={setRefundRekeningId}
            setSelectedReturDetail={setSelectedReturDetail}
            handleSelesaikanRetur={handleSelesaikanRetur}
            returTotal={returTotal}
            returLimit={returLimit}
            setReturLimit={setReturLimit}
            returPage={returPage}
            setReturPage={setReturPage}
          />
        )}
      </div>

      {/* MODAL BULK INBOUND */}
      <ModalBulkInbound
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        poList={poList}
        selectedPoData={targetBulkPo}
        onItemsInbound={refreshAll}
      />

      {/* MODAL INBOUND */}
      <ModalInbound
        showModal={showModal}
        setShowModal={setShowModal}
        selectedItem={selectedItem}
        scanInput={scanInput}
        setScanInput={setScanInput}
        processBarcode={processBarcode}
        startScan={startScan}
        selectedPo={selectedPo}
        handlePoSelect={handlePoSelect}
        activePOs={activePOs}
        remainingPoQty={remainingPoQty}
        supplier={supplier}
        setSupplier={setSupplier}
        noHpSupplier={noHpSupplier}
        setNoHpSupplier={setNoHpSupplier}
        inputQty={inputQty}
        setInputQty={setInputQty}
        totalBiaya={totalBiaya}
        setTotalBiaya={setTotalBiaya}
        formatRupiah={formatRupiah}
        nominalBayar={nominalBayar}
        setNominalBayar={setNominalBayar}
        rekeningId={rekeningId}
        setRekeningId={setRekeningId}
        rekenings={rekenings}
        autoStatusInv={autoStatusInv}
        statusLabelInv={statusLabelInv}
        dibayarInv={dibayarInv}
        sisaInv={sisaInv}
        submitInbound={submitInbound}
        loading={loading}
      />

      {/* MODAL FORM RETUR */}
      <ModalFormRetur
        showReturModal={showReturModal}
        setShowReturModal={setShowReturModal}
        selectedItem={selectedItem}
        submitRetur={submitRetur}
        maxReturQty={maxReturQty}
        setMaxReturQty={setMaxReturQty}
        formRetur={formRetur}
        setFormRetur={setFormRetur}
        inboundTrxList={inboundTrxList.filter(
          (t) => t.sisa_retur > 0 && t.inventory_id == selectedItem?.id,
        )}
        loading={loading}
      />

      {/* MODAL DETAIL RETUR */}
      <ModalDetailRetur
        selectedReturDetail={selectedReturDetail}
        setSelectedReturDetail={setSelectedReturDetail}
        refundRekeningId={refundRekeningId}
        setRefundRekeningId={setRefundRekeningId}
        rekenings={rekenings}
        refundNominal={refundNominal}
        setRefundNominal={setRefundNominal}
        formatRupiah={formatRupiah}
        handleSelesaikanRetur={handleSelesaikanRetur}
      />

      {/* OVERLAY KAMERA HP */}
      <ModalScanner isScanning={isScanning} stopScan={stopScan} />

      {/* MODAL ZOOM GAMBAR */}
      <ZoomModal zoomedImage={zoomedImage} setZoomedImage={setZoomedImage} />
    </div>
  );
};

export default Inventory;
