import { useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axios";
import DateRangeFilter from "../../components/DateRangeFilter";
import OrderDetailModal from "../../components/oprasional/monitoring/OrderDetailModal";
import RejectModal from "../../components/oprasional/monitoring/RejectModal";
import ReturConditionModal from "../../components/oprasional/monitoring/ReturConditionModal";
import BulkUpdateModal from "../../components/oprasional/monitoring/BulkUpdateModal";
import ManualSettleModal from "../../components/oprasional/monitoring/ManualSettleModal";
import { useMonitoring } from "../../hooks/useMonitoring";
import useBarcodeScanner from "../../hooks/useBarcodeScanner";
import OrderCard from "../../components/oprasional/monitoring/OrderCard";
import OrderList from "../../components/oprasional/monitoring/OrderList";
import OrderMobileCard from "../../components/oprasional/monitoring/OrderMobileCard";
import Pagination from "../../components/Pagination";

const Monitoring = () => {
  const [viewMode, setViewMode] = useState("card"); // "card" atau "list"
  // Hitung tanggal 7 hari ke belakang (Default Global)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const initialStart = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(sevenDaysAgo.getDate()).padStart(2, "0")}`;

  // Hitung tanggal hari ini
  const todayDate = new Date();
  const initialEnd = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;

  const rekeningList = useSelector((state) => state.data.rekening);

  const {
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
    filteredOrders,
    totalData,
    page,
    setPage,
    limit,
    setLimit,
    processFastTrack,
    scannerMode,
    setScannerMode,
    handleBarcodeScan,
  } = useMonitoring({
    initialStartDate: initialStart,
    initialEndDate: initialEnd,
  });

  // Background hardware scanner listener
  useBarcodeScanner((barcode) => {
    handleBarcodeScan(barcode);
  });

  const handleRejectSubmit = async () => {
    // 1. Validasi: Pastikan ada minimal satu barang yang qty_reject > 0
    const selectedItems = formRetur.items?.filter(
      (item) => item.qty_reject > 0,
    );

    if (!selectedItems || selectedItems.length === 0) {
      return window.showToast(
        "Pilih minimal satu barang untuk direject!",
        "error",
      );
    }

    const payload = {
      outbound_id: formRetur.id,
      nama_pembeli: formRetur.nama_pembeli,
      no_hp_pembeli: formRetur.no_hp_pembeli,
      kondisi_barang: formRetur.kondisi_barang,
      opsi_kompensasi: formRetur.opsi_kompensasi,
      alasan: formRetur.alasan,
      items: selectedItems,
      rekening_id: formRetur.rekening_id,
      nominal_bayar: formRetur.nominal_bayar,
    };

    try {
      const res = await axiosInstance.post(
        "pos.php?action=submit_reject_report",
        payload
      );
      const data = res.data;

      if (data.status === "success") {
        window.showToast(data.message, "success");
        setShowModal(false);
        window.location.reload(); // Refresh data untuk melihat status terbaru
      } else {
        window.showToast(data.message || "Gagal simpan laporan", "error");
      }
    } catch (e) {
      window.showToast("Kesalahan koneksi ke server", "error");
    }
  };

  const renderActionButtons = (order, isList = false) => {
    const btnClass = `font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center text-center px-2.5 py-1.5 text-[8px] md:text-[9px] rounded-lg shadow-sm whitespace-nowrap`;

    return (
      <div className={`flex flex-col gap-2 w-full ${isList ? "lg:w-auto lg:items-end" : ""}`}>
        {/* FINAL STATUS BADGES */}
        {order.status === "Sukses" && (
          <div className={`w-full bg-emerald-50 border border-emerald-100 rounded-lg py-1.5 px-3 flex justify-center items-center text-emerald-600 font-black italic uppercase text-[8px] tracking-widest shadow-inner ${isList ? "lg:min-w-[150px]" : ""}`}>
            ✅ LUNAS & SELESAI
          </div>
        )}
        {order.status === "Retur Selesai" && (
          <div className={`w-full bg-slate-100 border border-slate-200 rounded-lg py-1.5 px-3 flex justify-center items-center text-slate-500 font-black italic uppercase text-[8px] tracking-widest shadow-inner ${isList ? "lg:min-w-[150px]" : ""}`}>
            🔙 BARANG DI GUDANG
          </div>
        )}
        {order.status === "Retur Loss" && (
          <div className={`w-full bg-rose-50 border border-rose-100 rounded-lg py-1.5 px-3 flex justify-center items-center text-rose-600 font-black italic uppercase text-[8px] tracking-widest shadow-inner ${isList ? "lg:min-w-[150px]" : ""}`}>
            ❌ RETUR RUGI
          </div>
        )}
        {order.status === "Claim MP" && (
          <div className={`w-full bg-blue-50 border border-blue-100 rounded-lg py-1.5 px-3 flex justify-center items-center text-blue-600 font-black italic uppercase text-[8px] tracking-widest shadow-inner ${isList ? "lg:min-w-[150px]" : ""}`}>
            🛡️ CLAIM MP
          </div>
        )}
        {order.status === "Claim Ekspedisi" && (
          <div className={`w-full bg-purple-50 border border-purple-100 rounded-lg py-1.5 px-3 flex justify-center items-center text-purple-600 font-black italic uppercase text-[8px] tracking-widest shadow-inner ${isList ? "lg:min-w-[150px]" : ""}`}>
            🚚 CLAIM EKSPEDISI
          </div>
        )}
        {order.status === "Batal" && (
          <div className={`w-full bg-rose-100 border border-rose-200 rounded-lg py-1.5 px-3 flex justify-center items-center text-rose-600 font-black italic uppercase text-[8px] tracking-widest shadow-inner ${isList ? "lg:min-w-[150px]" : ""}`}>
            ❌ PESANAN BATAL
          </div>
        )}

        {/* ACTION BUTTONS */}
        {/* Only render this wrapper if there are actually action buttons */}
        {(order.tipe_channel === "Marketplace" && order.status === "Dikirim") ||
          (order.tipe_channel !== "Marketplace" && ["Pending", "Sukses"].includes(order.status)) ||
          (order.status === "Retur") ? (
          <div className={`flex flex-wrap gap-1.5 w-full ${isList ? "justify-end" : "justify-center"}`}>
            {/* MARKETPLACE: Hanya ada alur Retur (Menunggu konfirmasi kondisi) */}
            {order.tipe_channel === "Marketplace" && order.status === "Dikirim" && (
              <>
                <button
                  onClick={() => openManualSettle(order)}
                  className={`${btnClass} bg-emerald-500 text-white hover:bg-emerald-600 flex-1 sm:flex-none`}
                >
                  🤝 CAIR (MP)
                </button>
                <button
                  onClick={() => updateStatus(order.id, "Retur")}
                  className={`${btnClass} bg-rose-100 text-rose-600 shadow-none hover:bg-rose-200 flex-1 sm:flex-none`}
                >
                  ⚠️ Retur
                </button>
              </>
            )}

            {/* NON-MARKETPLACE: Langsung pakai alur Reject (Laporan Cacat) */}
            {order.tipe_channel !== "Marketplace" && (
              <>
                {order.status === "Pending" && (
                  <button
                    onClick={() => {
                      if (parseFloat(order.sisa_tagihan) > 0) {
                        window.showToast(
                          "Silakan catat pelunasan piutang ini melalui menu Buku Utang Piutang (Dashboard Finance)!",
                          "warning",
                        );
                      } else {
                        updateStatus(order.id, "Sukses");
                      }
                    }}
                    className={`${btnClass} ${parseFloat(order.sisa_tagihan) > 0 ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"} text-white flex-1 sm:flex-none`}
                  >
                    {parseFloat(order.sisa_tagihan) > 0
                      ? "⚠️ LUNASI VIA FINANCE"
                      : "💵 TERIMA PELUNASAN"}
                  </button>
                )}
                {(order.status === "Sukses" || order.status === "Pending") && (
                  <button
                    onClick={() => openModalRetur(order, "reject")}
                    className={`${btnClass} bg-rose-50 text-rose-600 shadow-none hover:bg-rose-100 flex-1 sm:flex-none`}
                  >
                    ❌ Reject
                  </button>
                )}
              </>
            )}

            {/* FOLLOW UP: Hanya status 'Retur' (khusus MP) yang butuh proses ReturConditionModal */}
            {order.status === "Retur" && (
              <button
                onClick={() => openProsesRetur(order)}
                className={`${btnClass} bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600 flex-1 sm:flex-none`}
              >
                ⚙️ PROSES KONDISI
              </button>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderCancelButton = (order) => {
    if (!["Pending", "Dikirim", "Sukses", "Retur"].includes(order.status)) return null;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOrderToCancel(order);
          setShowConfirmCancel(true);
        }}
        className="px-2 py-1 bg-slate-100 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded-md text-[7px] font-black uppercase tracking-widest transition-colors ml-auto border border-slate-200"
      >
        🚫 Batal
      </button>
    );
  };

  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      const res = await axiosInstance.post("pos.php?action=cancel_order", { id: orderToCancel.id });
      if (res.data.status === "success") {
        window.showToast(res.data.message, "success");
        window.location.reload();
      } else {
        window.showToast(res.data.message || "Gagal membatalkan pesanan.", "error");
      }
    } catch (e) {
      window.showToast("Gagal koneksi server.", "error");
    } finally {
      setShowConfirmCancel(false);
      setOrderToCancel(null);
    }
  };

  return (
    <div className="p-4 animate-in fade-in duration-500 h-full flex flex-col relative text-slate-900">
      {/* MODAL RETUR/REJECT */}
      <RejectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        order={formRetur.order_data}
        items={orderItems}
        formRetur={formRetur}
        setFormRetur={setFormRetur}
        onSubmit={handleRejectSubmit}
        rekeningList={rekeningList}
      />

      {/* MODAL CANCEL ORDER */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <div className="p-6">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center text-xl mb-4">⚠️</div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg mb-2">Batalkan Pesanan?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed">
                Stok akan dikembalikan ke gudang, piutang yang belum lunas akan dihapus, dan jurnal keuangan terkait akan dibalik. Aksi ini tidak dapat dibatalkan!
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowConfirmCancel(false);
                  setOrderToCancel(null);
                }}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={confirmCancelOrder}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-rose-600 text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 active:scale-95 transition-all"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BULK UPDATE MP */}
      <BulkUpdateModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onUpload={handleBulkCsvUpload}
        isUploading={isUploading}
        rekeningList={rekeningList}
      />

      {/* MODAL MANUAL SETTLE MP */}
      <ManualSettleModal
        isOpen={showManualSettle}
        onClose={() => setShowManualSettle(false)}
        order={selectedOrderToSettle}
        onSubmit={submitManualSettle}
        rekeningList={rekeningList}
      />

      {/* MODAL PROSES KONDISI RETUR */}
      <ReturConditionModal
        isOpen={showProsesRetur}
        onClose={() => setShowProsesRetur(false)}
        order={selectedRetur}
        onSubmit={submitProsesRetur}
        rekeningList={rekeningList}
      />

      {/* FUNCTIONAL HEADER - COMPACT & MODERN */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
          {/* KIRI: VIEW MODE & FILTERS */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === "card" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                🖼️ GRID
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                📄 LIST
              </button>
            </div>

            {/* TOGGLE SCANNER MODE */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => setScannerMode("fast")}
                className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${scannerMode === "fast" ? "bg-emerald-500 text-white shadow-sm font-bold" : "text-slate-400 hover:text-slate-600"}`}
              >
                ⚡ KILAT RESTOCK
              </button>
              <button
                type="button"
                onClick={() => setScannerMode("modal")}
                className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${scannerMode === "modal" ? "bg-blue-600 text-white shadow-sm font-bold" : "text-slate-400 hover:text-slate-600"}`}
              >
                🔍 FORM VERIFIKASI
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex gap-2 flex-1 sm:flex-none">
              <select
                className="flex-1 sm:w-32 lg:w-36 bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg font-bold text-[9px] outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase tracking-tight"
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
              >
                <option value="">Semua Channel</option>
                {[
                  ...new Set(orders.map((o) => o.nama_channel).filter(Boolean)),
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className="flex-1 sm:w-32 lg:w-36 bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg font-bold text-[9px] outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase tracking-tight"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                {[...new Set(orders.map((o) => o.status).filter(Boolean))].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <DateRangeFilter
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
            </div>
          </div>
        </div>

        {/* BARIS 2: SEARCH & ACTIONS */}
        <div className="flex flex-col md:flex-row gap-2 w-full">
          <div className="relative flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40 group-focus-within:opacity-100 transition-opacity">
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari Resi atau No. Invoice..."
              className="w-full bg-white border border-slate-200 py-2.5 pl-9 pr-4 rounded-lg font-bold text-[11px] outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  processFastTrack(e.currentTarget.value);
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              📦 <span className="hidden sm:inline">UPDATE MASAL MP</span>
              <span className="sm:hidden">MASAL</span>
            </button>
            <button
              onClick={isScanning ? stopScan : startScan}
              className={`${isScanning ? "bg-rose-500" : "bg-slate-900 hover:bg-blue-600"} text-white px-4 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-[0.15em] shadow-md active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap`}
            >
              {isScanning ? "🛑 STOP SCAN" : "📷 SCAN RESI"}
            </button>
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col justify-center items-center p-4">
          <h3 className="text-white font-black italic uppercase tracking-widest mb-4">
            SCAN BARCODE RESI
          </h3>
          <div
            id="monitoring-scanner"
            className="w-full max-w-[250px] sm:max-w-sm aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-4 border-blue-500 bg-black flex items-center justify-center shadow-2xl"
          ></div>
          <button
            onClick={stopScan}
            className="mt-6 bg-rose-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
          >
            Tutup Kamera
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-black animate-pulse text-slate-300 uppercase italic tracking-widest text-xs">
          Sinkronisasi Server...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {/* ================= TAMPILAN HP (COMPACT LIST) ================= */}
          <div className="md:hidden flex flex-col gap-3 pb-6">
            {filteredOrders.map((order) => (
              <OrderMobileCard
                key={order.id}
                order={order}
                openDetail={openDetail}
                renderCancelButton={renderCancelButton}
              />
            ))}
            {filteredOrders.length === 0 && (
              <div className="py-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                Tidak ada data ditemukan pada periode ini
              </div>
            )}
          </div>

          {/* ================= TAMPILAN PC (CARD / LIST) ================= */}
          <div className="hidden md:block">
            {viewMode === "card" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    openDetail={openDetail}
                    renderActionButtons={renderActionButtons}
                    renderCancelButton={renderCancelButton}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-6">
                {filteredOrders.map((order) => (
                  <OrderList
                    key={order.id}
                    order={order}
                    openDetail={openDetail}
                    renderActionButtons={renderActionButtons}
                    renderCancelButton={renderCancelButton}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAGINASI */}
      <Pagination
        totalData={totalData || 0}
        limit={limit}
        onLimitChange={setLimit}
        currentPage={page}
        onPageChange={setPage}
      />

      {/* ================= MODAL DETAIL ORDER KHUSUS MOBILE ================= */}
      {selectedOrderDetail && (
        <OrderDetailModal
          order={selectedOrderDetail}
          onClose={() => setSelectedOrderDetail(null)}
          items={orderItems}
          loading={loadingDetails}
          renderActionButtons={renderActionButtons}
        />
      )}
    </div>
  );
};

export default Monitoring;
