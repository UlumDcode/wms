import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axios";
import Pagination from "../../components/Pagination";

const PriceList = () => {
  const items = useSelector((state) => state.data.items);
  const channels = useSelector((state) => state.data.channels);

  const [priceData, setPriceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formPrices, setFormPrices] = useState({});
  const [bulkPrices, setBulkFormPrices] = useState({});
  const [globalMargin, setGlobalMargin] = useState(""); // State buat nyimpen persentase margin
  const [loading, setLoading] = useState(false);
  const [uniqueModels, setUniqueModels] = useState([]);

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalData, setTotalData] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Tarik data harga (Server-Side Pagination & Search)
  const fetchPrices = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const res = await axiosInstance.get(
        `pricelist.php?action=read_pricelist&page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`,
      );
      const data = res.data;
      if (data.status === "success") {
        setPriceData(data.data || []);
        setTotalData(data.total_data || 0);
      }
    } catch (e) {
      console.error("Gagal load price list");
    } finally {
      setIsDataLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Ambil list model dari backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await axiosInstance.get("pricelist.php?action=get_all_models");
        if (res.data.status === "success") {
          setUniqueModels(res.data.data || []);
        }
      } catch (e) {
        console.error("Gagal load list model", e);
      }
    };
    fetchModels();
  }, []);

  // Debounce logic untuk server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset halaman jika kata kunci pencarian berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Fungsi mengubah angka jadi format Rupiah
  const formatRupiah = (val) => {
    if (!val) return "";
    const clean = val.toString().replace(/\D/g, "");
    return "Rp " + new Intl.NumberFormat("id-ID").format(clean);
  };

  // --- OPTIMASI LOOKUP DENGAN USEMEMO ---
  // Map untuk priceData agar pencarian (find/filter) menjadi O(1)
  const priceDataByInventory = useMemo(() => {
    const map = new Map();
    priceData.forEach((p) => {
      if (!map.has(p.inventory_id)) {
        map.set(p.inventory_id, []);
      }
      map.get(p.inventory_id).push(p);
    });
    return map;
  }, [priceData]);

  // Ekstraksi item unik dari priceData untuk dirender di tabel
  const uniqueItems = useMemo(() => {
    const seen = new Set();
    const list = [];
    priceData.forEach((p) => {
      if (!seen.has(p.inventory_id)) {
        seen.add(p.inventory_id);
        list.push({
          id: p.inventory_id,
          nama_barang: p.nama_barang,
          kode_barang: p.kode_barang,
          size: p.size,
          hpp: p.hpp,
          model: p.model,
        });
      }
    });
    return list;
  }, [priceData]);

  // Mengambil HPP Asli dari priceData (karena backend udah ngambil dari hpp_history)
  const getTrueHpp = (itemId) => {
    if (!itemId) return 0;
    const prices = priceDataByInventory.get(itemId);
    if (prices) {
      const found = prices.find((p) => parseFloat(p.hpp || 0) > 0);
      if (found) return parseFloat(found.hpp || 0);
    }
    return 0;
  };

  // Fungsi buka modal & pasang harga awal ke form
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setGlobalMargin(""); // Reset persentase setiap kali buka modal baru
    const initialPrices = {};
    const prices = priceDataByInventory.get(item.id) || [];

    channels.forEach((ch) => {
      const existing = prices.find((p) => p.channel_id === ch.id);
      const hargaJualAngka = existing ? parseFloat(existing.harga_jual) : 0;
      initialPrices[ch.id] =
        hargaJualAngka > 0 ? formatRupiah(hargaJualAngka) : "";
    });
    setFormPrices(initialPrices);
    setShowModal(true);
  };

  // Ekstraksi List Model Unik diambil dari API, bukan dari pagination

  // Fungsi saat ngetik manual di masing-masing channel
  const handlePriceChange = (channelId, val, isBulk = false) => {
    const setter = isBulk ? setBulkFormPrices : setFormPrices;
    setter((prev) => ({ ...prev, [channelId]: formatRupiah(val) }));
  };

  // --- LOGIC AUTO MARGIN ---
  const handleMarginChange = (e, isBulk = false) => {
    const margin = e.target.value;
    setGlobalMargin(margin);

    if (!margin || isNaN(margin)) return;

    let hpp = 0;
    if (isBulk) {
      // Cari HPP dari uniqueModels berdasarkan hpp_id
      const modelObj = uniqueModels.find((m) => m.hpp_id.toString() === selectedModel.toString());
      hpp = parseFloat(modelObj?.hpp || 0);
    } else {
      hpp = getTrueHpp(selectedItem?.id);
    }

    if (hpp <= 0) return; // Kalo HPP-nya 0 ya gabisa diitung persentasenya

    // Rumus: HPP + (HPP * Persentase / 100)
    const marginPersen = parseFloat(margin);
    const hargaBaru = hpp + hpp * (marginPersen / 100);

    const updatedPrices = {};
    channels.forEach((ch) => {
      // Kita buletin harganya biar ga aneh misal (Rp 32.412,5) jadi (Rp 32.413)
      updatedPrices[ch.id] = formatRupiah(Math.round(hargaBaru));
    });
    const setter = isBulk ? setBulkFormPrices : setFormPrices;
    setter(updatedPrices);
  };

  const handleSubmit = async (e, isBulk = false) => {
    e.preventDefault();
    setLoading(true);

    const activePrices = isBulk ? bulkPrices : formPrices;
    const targetModel = isBulk ? selectedModel : null;
    const targetInvId = isBulk
      ? 0 // Backend now handles inventory_id=0 if apply_to_model is true
      : selectedItem.id;

    try {
      // OPTIMASI: Batch semua price updates dalam satu request (bukan Promise.all)
      // Ini menghemat koneksi database karena hanya 1 transaksi, bukan N transaksi
      const batchPayload = Object.entries(activePrices).map(
        ([channelId, hargaStr]) => {
          const cleanHarga =
            parseFloat(String(hargaStr).replace(/\D/g, "")) || 0;
          return {
            inventory_id: targetInvId,
            channel_id: parseInt(channelId),
            harga_jual: cleanHarga,
            apply_to_model: isBulk || false,
            hpp_id: isBulk ? parseInt(targetModel) : 0,
          };
        },
      );

      // Single request ke endpoint batch (jauh lebih efisien dari Promise.all)
      const res = await axiosInstance.post(
        "pricelist.php?action=batch_save_prices",
        { prices: batchPayload },
      );

      const data = res.data;
      if (data.status === "error") {
        window.showToast("Gagal: " + data.message, "error");
      } else {
        window.showToast(
          data.message || "Harga berhasil diperbarui!",
          "success",
        );
        setShowModal(false);
        setShowBulkModal(false);
        fetchPrices(); // Refresh data harga terbaru
      }
    } catch (error) {
      window.showToast("Gagal menyimpan harga!", "error");
    } finally {
      setLoading(false);
    }
  };

  // Indikator status apakah harga sudah diset untuk semua channel
  const getStatusHarga = (itemId) => {
    const prices = priceDataByInventory.get(itemId) || [];
    const itemPrices = prices.filter((p) => parseFloat(p.harga_jual) > 0);

    if (itemPrices.length === 0) {
      return (
        <span className="bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
          ⚠️ Belum Diatur
        </span>
      );
    }
    if (itemPrices.length < channels.length) {
      return (
        <span className="bg-amber-100 text-amber-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
          ⏳ Sebagian ({itemPrices.length}/{channels.length})
        </span>
      );
    }
    return (
      <span className="bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
        ✓ Lengkap
      </span>
    );
  };

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 flex flex-col h-full min-h-0 text-slate-900">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-center mb-4 md:mb-6 gap-3 shrink-0">
        <div className="relative w-full md:w-80 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity text-xs">
            🔍
          </div>
          <input
            type="text"
            placeholder="Cari Produk / Kode..."
            className="w-full bg-white border border-slate-100 p-3 pl-12 rounded-xl font-bold text-[11px] outline-none focus:border-blue-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={() => {
            setBulkFormPrices({});
            setGlobalMargin("");
            setSelectedModel("");
            setShowBulkModal(true);
          }}
          className="bg-emerald-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>📦</span> UPDATE PER MODEL
        </button>
      </div>

      {/* LIST TABEL */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0 overflow-hidden">
        {isDataLoading && (
          <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                Sinkronisasi Harga...
              </p>
            </div>
          </div>
        )}

        <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
          <table className="w-full min-w-[500px] text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-2 md:p-3">Produk</th>
                <th className="py-2 px-2 md:p-3 whitespace-nowrap">
                  HPP (Modal)
                </th>
                <th className="py-2 px-2 md:p-3 text-center">Status Harga</th>
                <th className="py-2 px-2 md:p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {uniqueItems.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 max-w-[150px] md:max-w-none">
                    <div className="font-black text-slate-800 uppercase italic tracking-tighter text-[10px] md:text-sm truncate">
                      {item.nama_barang}
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                        {item.kode_barang} | Size {item.size}
                      </div>
                      <div className="text-[7px] font-black bg-blue-100 text-blue-600 px-1.5 rounded uppercase italic">
                        {item.model}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100">
                    <div className="text-[10px] md:text-xs font-black text-slate-800 uppercase italic whitespace-nowrap">
                      Rp {getTrueHpp(item.id).toLocaleString("id-ID")}
                    </div>
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center w-[100px] md:w-auto">
                    {getStatusHarga(item.id)}
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center w-[80px] md:w-auto">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="bg-slate-900 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-md hover:bg-blue-600 transition-all active:scale-95 whitespace-nowrap"
                    >
                      ⚙️ Atur Harga
                    </button>
                  </td>
                </tr>
              ))}
              {uniqueItems.length === 0 && !isDataLoading && (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <div className="text-slate-300 font-bold text-[10px] md:text-xs uppercase italic tracking-widest">
                      Produk Tidak Ditemukan
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalData={totalData}
          limit={limit}
          onLimitChange={setLimit}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      {/* MODAL FORM INPUT HARGA */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-[1.5rem] md:rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 custom-scrollbar border border-slate-100">
            <div className="p-5 md:p-8">
              <div className="mb-5 md:mb-6 border-b border-slate-100 pb-4 md:pb-5">
                <h3 className="font-black uppercase italic text-sm md:text-base mb-2 text-slate-800">
                  Pengaturan Harga Jual
                </h3>
                <div className="bg-slate-50 p-3 md:p-4 rounded-xl flex items-center justify-between border border-slate-100 mt-3 md:mt-4">
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Produk Terpilih
                    </p>
                    <p className="text-base md:text-lg font-black text-slate-800 uppercase italic leading-tight">
                      {selectedItem?.nama_barang}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      HPP / Modal
                    </p>
                    <p className="text-xs md:text-sm font-black text-blue-600">
                      Rp {getTrueHpp(selectedItem?.id).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* TOOL: AUTO MARGIN PERCENTAGE */}
                {channels.length > 0 && (
                  <div className="bg-blue-50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-blue-100 mb-6 flex gap-3 md:gap-4 items-center">
                    <div className="flex-1">
                      <label className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase block mb-1">
                        Auto Markup Margin (%)
                      </label>
                      <p className="text-[8px] md:text-[9px] text-blue-500/70 font-bold uppercase tracking-widest leading-tight mt-0.5">
                        Tentukan untung (misal: 20) otomatis isi semua kolom di
                        bawah
                      </p>
                    </div>
                    <div className="w-24 relative">
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-white p-3 md:p-4 pr-8 rounded-xl font-black text-xs md:text-sm outline-none border border-transparent focus:border-blue-500 transition-all text-blue-800 shadow-sm"
                        value={globalMargin}
                        onChange={handleMarginChange}
                        placeholder="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 font-black">
                        %
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-6 md:mb-8">
                  {channels.map((ch) => (
                    <div key={ch.id} className="relative">
                      <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase block ml-1 mb-1.5 md:mb-2">
                        {ch.nama_channel}{" "}
                        <span className="text-blue-500">({ch.tipe})</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Rp 0"
                        className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-black text-xs md:text-sm outline-none border border-slate-100 focus:border-blue-500 transition-all text-slate-800 shadow-sm"
                        value={formPrices[ch.id] || ""}
                        onChange={(e) =>
                          handlePriceChange(ch.id, e.target.value)
                        }
                      />
                    </div>
                  ))}
                  {channels.length === 0 && (
                    <div className="col-span-1 md:col-span-2 text-center py-6 text-slate-400 text-xs font-bold uppercase italic">
                      Belum ada channel yang terdaftar. Buat channel dulu di
                      menu Master Channel.
                    </div>
                  )}
                </div>

                <div className="flex gap-3 md:gap-4 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-100 text-slate-500 py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || channels.length === 0}
                    className="flex-[2] bg-slate-900 text-white py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-blue-600 active:scale-95 transition-all shadow-md disabled:opacity-50"
                  >
                    {loading ? "MEMPROSES..." : "SIMPAN HARGA"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BULK UPDATE PER MODEL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-[1.5rem] md:rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 custom-scrollbar border border-slate-100">
            <div className="p-5 md:p-8">
              <h3 className="font-black uppercase italic text-sm md:text-base mb-6 text-emerald-600 border-b border-slate-100 pb-4 flex justify-between items-center">
                <span>Update Harga Massal (Berdasarkan Batch PO)</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setSelectedModel("");
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors font-bold text-xs uppercase"
                >
                  ✕ Tutup
                </button>
              </h3>

              <div className="mb-6">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">
                  1. Pilih Batch PO / Model Barang
                </label>
                <select
                  className="w-full bg-slate-50 p-4 rounded-xl font-black text-xs text-slate-800 border border-slate-100 focus:border-emerald-500 outline-none"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="">-- Klik untuk pilih Batch PO / Model --</option>
                  {uniqueModels.map((m) => (
                    <option key={m.hpp_id} value={m.hpp_id}>
                      Model: {m.model} | PO: {m.no_po} | HPP: Rp {parseFloat(m.hpp).toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
              </div>

              {selectedModel && (
                <div className="mb-6 bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Batch PO Terpilih
                    </p>
                    <p className="text-base md:text-lg font-black text-emerald-600 uppercase italic leading-tight">
                      {uniqueModels.find((m) => m.hpp_id.toString() === selectedModel.toString())?.model} 
                      <span className="text-sm ml-2 text-slate-500">({uniqueModels.find((m) => m.hpp_id.toString() === selectedModel.toString())?.no_po})</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Estimasi HPP (Modal)
                    </p>
                    <p className="text-xs md:text-sm font-black text-blue-600">
                      Rp{" "}
                      {parseFloat(
                        uniqueModels.find((m) => m.hpp_id.toString() === selectedModel.toString())?.hpp ||
                        0,
                      ).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              )}

              {selectedModel && (
                <form onSubmit={(e) => handleSubmit(e, true)}>
                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-6 flex gap-4 items-center">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-blue-600 uppercase block mb-1">
                        Auto Markup Margin (%)
                      </label>
                      <p className="text-[8px] text-blue-500/70 font-bold uppercase tracking-widest leading-tight">
                        Tentukan untung (misal: 25) otomatis isi semua kolom di
                        bawah sesuai HPP model ini
                      </p>
                    </div>
                    <div className="w-24 relative">
                      <input
                        type="number"
                        className="w-full bg-white p-4 pr-8 rounded-xl font-black text-xs outline-none border border-transparent focus:border-blue-500 shadow-sm"
                        value={globalMargin}
                        onChange={(e) => handleMarginChange(e, true)}
                        placeholder="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 font-black">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {channels.map((ch) => (
                      <div key={ch.id}>
                        <label className="text-[10px] font-black text-slate-500 uppercase block ml-1 mb-2">
                          Harga {ch.nama_channel}
                        </label>
                        <input
                          type="text"
                          placeholder="Rp 0"
                          className="w-full bg-slate-50 p-4 rounded-xl font-black text-xs outline-none border border-slate-100 focus:border-emerald-500 shadow-sm"
                          value={bulkPrices[ch.id] || ""}
                          onChange={(e) =>
                            handlePriceChange(ch.id, e.target.value, true)
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowBulkModal(false)}
                      className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      {loading ? "MEMPROSES..." : "UPDATE SEMUA UKURAN"}
                    </button>
                  </div>
                </form>
              )}

              {!selectedModel && (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="text-4xl">☝️</div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                    Pilih batch PO di atas untuk mulai mengatur harga massal
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceList;
