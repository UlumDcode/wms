import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../../utils/axios";

const ModalBulkInbound = ({
  isOpen,
  onClose,
  poList = [],
  selectedPoData, // This is hpp_history object, not just no_po
  // onItemsInbound, // Removed from here, will be used in handleSubmit
  onItemsInbound,
}) => {
  const [selectedPoId, setSelectedPoId] = useState(""); // Use ID for dropdown value
  const [poDetails, setPoDetails] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);

  // Deklarasi API_URL untuk narik path gambar dari Backend
  const API_URL =
    localStorage.getItem("CUSTOM_API_URL") ||
    import.meta.env.VITE_API_URL ||
    `http://${window.location.hostname}:8000`;

  useEffect(() => {
    if (isOpen) {
      if (selectedPoData) {
        setSelectedPoId(selectedPoData.id); // Set ID if coming from specific PO
      } else {
        setSelectedPoId(""); // Reset ID
        setPoDetails([]);
        setSelectedItems([]);
        setQuantities({});
      }
    }
  }, [isOpen, selectedPoData]);

  useEffect(() => {
    if (selectedPoId) {
      // Find the no_po for the selected ID
      const po = poList.find((p) => p.id == selectedPoId);
      if (po) {
        fetchPoDetails(po.no_po, selectedPoId); // Pass both no_po and id
      }
    } else {
      setPoDetails([]);
      setSelectedItems([]);
      setQuantities({});
    }
  }, [selectedPoId, poList]); // Add poList to dependency array

  const fetchPoDetails = async (no_po, hppHistoryId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `inventory.php?action=get_po_details&hpp_history_id=${hppHistoryId}`
      );
      const data = res.data;
      const list = Array.isArray(data) ? data : [];
      setPoDetails(list);

      // Auto-select all items by default
      const allIds = list.map((item) => item.id);
      setSelectedItems(allIds);

      // Initialize quantities to 0
      const initialQtys = {};
      list.forEach((item) => {
        initialQtys[item.id] = "";
      });
      setQuantities(initialQtys);
    } catch (e) {
      window.showToast("Gagal mengambil detail PO", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const totalEstimasi = useMemo(() => {
    return selectedItems.reduce((acc, id) => {
      const item = poDetails.find((p) => p.id === id);
      const qty = parseInt(quantities[id]) || 0;
      const harga = parseFloat(item?.harga_beli) || 0;
      return acc + qty * harga;
    }, 0);
  }, [selectedItems, quantities, poDetails]);

  const handleQtyChange = (id, val) => {
    setQuantities((prev) => ({ ...prev, [id]: val.replace(/\D/g, "") }));
  };

  const currentPoHeader = useMemo(
    () => poList.find((p) => p.id == selectedPoId),
    [poList, selectedPoId],
  );

  const originalSisaQuota = useMemo(() => {
    if (!currentPoHeader) return null;
    const prod = parseFloat(currentPoHeader.qty_produksi) || 0;
    const inb = parseFloat(currentPoHeader.qty_inbound_aktual) || 0;
    return prod > 0 ? Math.max(0, prod - inb) : null;
  }, [currentPoHeader]);

  const currentTotalInput = useMemo(() => {
    return selectedItems.reduce((acc, id) => {
      return acc + (parseInt(quantities[id]) || 0);
    }, 0);
  }, [selectedItems, quantities]);

  const sisaQuotaRealtime =
    originalSisaQuota !== null ? originalSisaQuota - currentTotalInput : null;
  const isOverQuota = sisaQuotaRealtime !== null && sisaQuotaRealtime < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemsToSubmit = selectedItems
      .filter((id) => quantities[id] && parseInt(quantities[id]) > 0)
      .map((id) => {
        const item = poDetails.find((p) => p.id === id);
        return {
          id,
          qty_masuk: parseInt(quantities[id]),
          harga_beli: parseFloat(item.harga_beli) || 0,
        };
      });

    if (itemsToSubmit.length === 0) {
      return window.showToast(
        "Isi Qty masuk untuk barang yang dipilih!",
        "warning",
      );
    }

    if (isOverQuota) {
      return window.showToast(
        "Total Qty masuk melebihi sisa kuota PO!",
        "error",
      );
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "inventory.php?action=inbound_from_po",
        {
          no_po: currentPoHeader?.no_po,
          items: itemsToSubmit,
          total_biaya: totalEstimasi,
          rekening_id: 0,
          nominal_bayar: 0,
        }
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast(
          "Inbound berhasil! Tagihan otomatis masuk ke Buku Hutang.",
          "success",
        );
        onItemsInbound();
        onClose();
      } else {
        window.showToast(data.message || "Gagal memproses inbound", "error");
      }
    } catch (e) {
      window.showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 p-0 rounded-[1.5rem] w-full max-w-4xl max-h-[95vh] shadow-2xl animate-in zoom-in-95 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* HEADER AREA */}
        <div className="bg-white dark:bg-slate-900 p-4 md:p-5 text-slate-900 dark:text-white relative flex flex-col shrink-0 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-xl">📦</span>
              <h3 className="text-lg md:text-lg font-black italic tracking-tighter uppercase leading-none text-slate-800 dark:text-white">
                Inbound Massal
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-rose-500 text-xl p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-3 mt-3 relative z-10">
            <div className="flex-1 w-full md:max-w-[250px]">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Pilih Nomor PO
              </p>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-black text-[10px] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(e.target.value)}
              >
                <option value="">-- Pilih Nomor PO --</option>
                {poList.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.no_po} ({po.model || po.customer})
                  </option>
                ))}
              </select>
            </div>
            {currentPoHeader && (
              <div className="flex-1 w-full">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Vendor / Model HPP
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center min-h-[35px]">
                    <p className="font-black italic text-[11px] uppercase leading-tight text-slate-800 dark:text-slate-100">
                      {currentPoHeader.model || currentPoHeader.customer}
                    </p>
                  </div>
                  {sisaQuotaRealtime !== null && (
                    <span
                      className={`${isOverQuota
                          ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-700 animate-pulse"
                          : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-700"
                        } px-2 py-1.5 rounded-lg text-[12px] font-black border whitespace-nowrap transition-all duration-300`}
                    >
                      SISA: {sisaQuotaRealtime} Pcs
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black italic uppercase text-[9px] text-slate-400 dark:text-slate-500 tracking-widest">
                Rincian Barang Produksi
              </h3>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={
                    selectedItems.length === poDetails.length &&
                    poDetails.length > 0
                  }
                  onChange={() => {
                    if (selectedItems.length === poDetails.length)
                      setSelectedItems([]);
                    else setSelectedItems(poDetails.map((i) => i.id));
                  }}
                />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                  Pilih Semua
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {!selectedPoId && (
                <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                  <span className="text-5xl mb-3">☝️</span>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Pilih Nomor PO Terlebih Dahulu
                  </p>
                </div>
              )}

              {poDetails.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                const hasQty =
                  quantities[item.id] && parseInt(quantities[item.id]) > 0;
                const qtyInt = parseInt(quantities[item.id]) || 0;

                const isWarning =
                  originalSisaQuota !== null &&
                  originalSisaQuota > 0 &&
                  qtyInt > originalSisaQuota;

                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-slate-800 p-3 rounded-xl border transition-all flex flex-col shadow-sm gap-3 ${isSelected
                        ? hasQty
                          ? "border-emerald-500 ring-1 ring-emerald-500/10"
                          : "border-blue-500"
                        : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                  >
                    {/* BAGIAN ATAS: GAMBAR & DETAIL BARANG */}
                    <div className="flex items-start gap-3">
                      {/* Box Gambar Barang */}
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                        {item.gambar ? (
                          <img
                            src={`${API_URL}/uploads/${item.gambar}`}
                            alt={item.nama_barang}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase">
                            NO IMG
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="font-black uppercase text-[12px] md:text-sm text-slate-900 dark:text-white leading-tight mb-1 truncate">
                              {item.nama_barang}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                SKU: {item.kode_barang}{" "}
                                {item.size ? `• SIZE: ${item.size}` : ""}
                              </span>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer shrink-0 mt-1"
                            checked={isSelected}
                            onChange={() => toggleItem(item.id)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* BAGIAN BAWAH: STOK & INPUT */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded uppercase tracking-widest">
                        STOK: {item.stok} {item.satuan}
                      </span>

                      <div className="w-50 shrink-0">
                        <div
                          className={`flex items-center bg-slate-50 dark:bg-slate-900 border rounded-lg px-2 py-1.5 transition-all ${isSelected
                              ? isWarning
                                ? "border-rose-500 ring-1 ring-rose-500/20"
                                : "border-slate-300 dark:border-slate-600 focus-within:border-blue-500"
                              : "border-transparent opacity-30"
                            }`}
                        >
                          <span className="text-[9px] font-bold text-slate-400 mr-1">
                            QTY:
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            disabled={!isSelected}
                            value={quantities[item.id] || ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              handleQtyChange(item.id, e.target.value)
                            }
                            className={`w-full bg-transparent text-right font-black text-sm outline-none ${isWarning || isOverQuota
                                ? "text-rose-600"
                                : hasQty
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER AREA (ACTION) */}
          <div className="p-4 md:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="text-center md:text-left">
                <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">
                  Status Pencatatan
                </p>
                <p className="text-xs font-black italic text-slate-600 dark:text-slate-300">
                  Transaksi Masuk ke{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    FINANCE
                  </span>
                  . Harap segera lakukan Tindak lanjut.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || selectedItems.length === 0 || isOverQuota}
                className="w-full md:w-auto min-w-[200px] bg-slate-900 dark:bg-blue-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white p-3 md:p-3.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {loading
                  ? "⏳ MEMPROSES DATA..."
                  : "✅ KONFIRMASI MASUK GUDANG"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBulkInbound;
