import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateMultipleItemStocks } from "../../store/slices/dataSlice";
import { useAlarm } from "../../hooks/useAlarm";
import axiosInstance from "../../utils/axios";

import PaymentModal from "../../components/oprasional/pos/PaymentModal";
import {
  usePosScanner,
  playBeep,
  playErrorSound,
  playSuccessSound,
} from "../../hooks/usePosScanner";
import MarketplaceModals from "../../components/oprasional/pos/MarketplaceModals";
import CameraOverlay from "../../components/oprasional/pos/CameraOverlay";
import AlarmOverlay from "../../components/oprasional/pos/AlarmOverlay";
import CatalogPanel from "../../components/oprasional/pos/CatalogPanel";
import CartPanel from "../../components/oprasional/pos/CartPanel";
import ZoomModal from "../../components/ZoomModal";

const Pos = ({ refreshData }) => {
  const channels = useSelector((state) => state.data.channels);
  const stores = useSelector((state) => state.data.stores);
  const rekeningList = useSelector((state) => state.data.rekening);
  const dispatch = useDispatch();

  const [selectedChannel, setSelectedChannel] = useState(
    () => sessionStorage.getItem("pos_selected_channel") || "",
  );
  const [channelInput, setChannelInput] = useState(
    () => sessionStorage.getItem("pos_channel_input") || "",
  );
  const [showChannelList, setShowChannelList] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [noResi, setNoResi] = useState("");

  const [cart, setCart] = useState([]);
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // ---> SIMPAN KE SESSION STORAGE AGAR TIDAK HILANG SAAT REFRESH <---
  useEffect(() => {
    sessionStorage.setItem("pos_selected_channel", selectedChannel);
  }, [selectedChannel]);

  useEffect(() => {
    sessionStorage.setItem("pos_channel_input", channelInput);
  }, [channelInput]);

  // ---> TAMBAHAN HOTFIX MICRO-STEP 1 (STATE PEMBAYARAN & TEMPO) <---
  const [paymentList, setPaymentList] = useState([
    { method: "", id_rekening: "", amount: "" },
  ]);
  const [jatuhTempo, setJatuhTempo] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [catalogItems, setCatalogItems] = useState([]);
  const [isCatalogLoading, setCatalogLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const [isGlobalSample, setIsGlobalSample] = useState(false);

  const [checkoutStep, setCheckoutStep] = useState(null);
  const [storeScanInput, setStoreScanInput] = useState("");
  const [zoomedImage, setZoomedImage] = useState(null);

  // ALARM STATES
  const { alarmConfig, alarmConfigRef, startAlarm, stopAlarm } = useAlarm();

  const API_URL =
    localStorage.getItem("CUSTOM_API_URL") || import.meta.env.VITE_API_URL;

  const activeChannelObj = channels.find((c) => c.id == selectedChannel);
  const tipeChannel = activeChannelObj?.tipe || "";

  // Logic ambil nama toko buat otomatisasi Saldo MP
  const activeStoreObj = stores.find((s) => s.id == selectedStore);
  const namaTokoMP = activeStoreObj ? activeStoreObj.nama_store : "Marketplace";

  // 1. Logic Debounce untuk Pencarian Catalog
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Fungsi Fetch Catalog (Server-Side)
  const fetchCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const response = await axiosInstance.get(
        `/inventory.php?action=read_inventory&search=${encodeURIComponent(debouncedSearch)}&limit=100`,
      );
      const json = response.data;
      if (json.status === "success") {
        setCatalogItems(json.data || []);
      }
    } catch (e) {
      console.error("Gagal load catalog:", e);
    } finally {
      setCatalogLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, [API_URL]);

  const selectItemManual = (kode) => {
    if (!selectedChannel)
      return window.showToast("Pilih Channel Pricelist Dulu!", "warning");
    prosesBarangKeKeranjang(kode);
  };

  const prosesBarangKeKeranjang = async (kode) => {
    try {
      const res = await axiosInstance.get(
        `/pos.php?action=get_product_price&kode=${kode}&channel_id=${selectedChannel}`,
      );
      const result = res.data;

      if (result.status === "success") {
        const item = result.data;

        if (parseInt(item.stok) <= 0) {
          return startAlarm(
            `STOK HABIS! Produk ${item.nama_barang} sisa 0 Pcs.`,
            "empty_stock",
          );
        }

        // Blokir jika harga pricelist 0 / belum diset sama sekali
        if (parseFloat(item.harga_aktif || 0) <= 0 && !isGlobalSample) {
          return startAlarm(
            `Harga Pricelist belum diatur untuk "${item.nama_barang}" di Channel ini!`,
            "no_price",
          );
        }

        const finalPrice = isGlobalSample
          ? 0
          : parseFloat(item.harga_aktif || 0);

        setCart((prev) => {
          const exist = prev.find(
            (i) => i.id === item.id && !!i.is_sample === isGlobalSample,
          );
          if (exist)
            return prev.map((i) =>
              i.id === item.id && !!i.is_sample === isGlobalSample
                ? {
                    ...i,
                    cartQty: i.cartQty + 1,
                    subtotal: (i.cartQty + 1) * finalPrice,
                  }
                : i,
            );
          return [
            ...prev,
            {
              ...item,
              cartQty: 1,
              subtotal: finalPrice,
              is_sample: isGlobalSample,
              harga_sebelum_sample: parseFloat(item.harga_aktif || 0),
            },
          ];
        });
        playBeep();
      } else {
        return startAlarm(
          result.message || "Barang tidak ditemukan di database!",
          "not_found",
        );
      }
    } catch (err) {
      window.showToast("Gagal koneksi ke API!", "error");
    }
  };

  // --- LOGIC ALUR CHECKOUT BERTURUT-TURUT ---
  const startCheckout = () => {
    if (cart.length === 0) {
      startAlarm(
        "Keranjang belanja masih kosong! Scan barang dulu.",
        "empty_cart",
      );
      return window.showToast("Keranjang Kosong!", "warning");
    }
    if (!selectedChannel)
      return window.showToast("Pilih Channel Dulu!", "warning");

    // Otomatis reset metode jika bukan reseller tapi ada riwayat saldo titipan / deposit
    if (tipeChannel !== "Reseller") {
      const hasResellerMethod = paymentList.some((p) =>
        ["Saldo Titipan", "Deposit", "Saldo Reseller"].includes(p.method),
      );
      if (hasResellerMethod) {
        setPaymentList([{ method: "", id_rekening: "", amount: "" }]);
      }
    }

    if (tipeChannel === "Marketplace") setCheckoutStep("store");
    else setCheckoutStep("payment");
  };

  const filteredStores = useMemo(
    () => stores.filter((s) => s.channel_id == selectedChannel),
    [stores, selectedChannel],
  );

  const handleStepStoreScan = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      let sid = selectedStore;
      const currentInput = e.key === "Enter" ? e.target.value : storeScanInput;
      if (currentInput) {
        const match = stores.find(
          (s) =>
            (s.kode_store === currentInput.trim() ||
              s.nama_store.toLowerCase() ===
                currentInput.trim().toLowerCase()) &&
            s.channel_id == selectedChannel,
        );
        if (match) sid = match.id;
        else {
          startAlarm(
            "Barcode Toko Tidak Dikenali / Beda Channel!",
            "wrong_store",
          );
          return;
          playErrorSound();
        }
      }
      if (!sid)
        return window.showToast("Pilih atau Scan Toko MP dulu!", "warning");

      setSelectedStore(sid);
      setCheckoutStep("resi");
      playBeep();
    }
  };

  const handleStepResiScan = async (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const currentResi = e.key === "Enter" ? e.target.value : noResi;
      if (!currentResi)
        return window.showToast(
          "Nomor Resi wajib diisi untuk Marketplace!",
          "warning",
        );

      // --- CEK AVAILABILITY VIA API ---
      try {
        const res = await axiosInstance.get(
          `/pos.php?action=check_resi_availability&resi=${encodeURIComponent(currentResi)}`,
        );
        const data = res.data;
        if (data.status === "error") {
          startAlarm(data.message, "duplicate_resi");
          playErrorSound();
          return;
        }
      } catch (err) {
        console.error("Gagal cek resi:", err);
      }

      if (e.key === "Enter" && tipeChannel === "Marketplace") {
        processApiCheckout("Dikirim", currentResi);
      } else {
        setCheckoutStep("payment");
      }
      playSuccessSound();
    }
  };

  const processApiCheckout = async (statusTrx, overrideResi = null) => {
    if (cart.length === 0) {
      startAlarm(
        "Gagal Checkout! Tidak ada barang di keranjang.",
        "empty_cart",
      );
      return window.showToast(
        "Gagal! Keranjang belanja masih kosong.",
        "error",
      );
    }

    // VALIDASI REKENING & SALDO SEBELUM CHECKOUT
    if (tipeChannel !== "Marketplace") {
      for (const p of paymentList) {
        const isDepositMethod = [
          "Saldo Titipan",
          "Deposit",
          "Saldo Reseller",
        ].includes(p.method);

        if (isDepositMethod) {
          if (tipeChannel !== "Reseller") {
            return window.showToast(
              `Metode ${p.method} hanya diperbolehkan untuk channel Reseller!`,
              "warning",
            );
          }

          const maxSaldo = parseFloat(activeChannelObj?.saldo_deposit || 0);
          if ((parseFloat(p.amount) || 0) > maxSaldo) {
            return window.showToast(
              `${p.method} tidak mencukupi! Sisa: Rp ${maxSaldo.toLocaleString("id-ID")}`,
              "warning",
            );
          }
          playErrorSound();
        }
      }
    }

    setIsCheckoutLoading(true);
    const total = cart.reduce(
      (a, b) => a + parseFloat(b.harga_aktif || 0) * b.cartQty,
      0,
    );

    let finalStatus = statusTrx;
    const totalDibayar = paymentList.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
      0,
    );

    if (tipeChannel !== "Marketplace" && totalDibayar < total) {
      finalStatus = "Pending";
    }

    const payload = {
      cart,
      channel_id: selectedChannel,
      store_id: selectedStore,
      status: finalStatus,
      total_bayar: total,
      no_resi:
        overrideResi !== null && typeof overrideResi === "string"
          ? overrideResi
          : noResi,
      metode_pembayaran:
        tipeChannel === "Marketplace"
          ? `MP (${namaTokoMP})`
          : paymentList.map((p) => p.method).join(", "),
      customer_name: customerName,
      no_hp: customerPhone,
      payments: tipeChannel === "Marketplace" ? [] : paymentList,
      jatuh_tempo: "",
    };

    try {
      const res = await axiosInstance.post(
        "/pos.php?action=checkout_outbound",
        payload,
      );
      const data = res.data;

      if (data.status === "success") {
        window.showToast(
          "Transaksi Lolos! Invoice: " + data.invoice,
          "success",
        );

        // 1. Reset form transaksi umum
        setCart([]);
        setSelectedStore("");
        setNoResi("");
        setStoreScanInput("");
        setPaymentList([{ method: "", id_rekening: "", amount: "" }]);
        setJatuhTempo("");
        setCheckoutStep(null);
        setIsGlobalSample(false);

        // 2. KONDISIONAL RESET CHANNEL: Reset HANYA jika BUKAN Marketplace
        if (tipeChannel !== "Marketplace") {
          setSelectedChannel("");
          setChannelInput("");
          setCustomerName("");
          setCustomerPhone("");
        }

        // Optimistic update stok di Redux (tanpa fetch ulang semua data)
        const stockChanges = cart.map((item) => ({
          id: item.id,
          qtyChange: -item.cartQty,
        }));
        dispatch(updateMultipleItemStocks(stockChanges));

        // Refresh katalog stok realtime setelah checkout sukses
        await fetchCatalog();
      } else {
        if (data.message && data.message.includes("Anti Double Resi")) {
          startAlarm(data.message, "duplicate_resi");
          playErrorSound();
        } else {
          window.showToast("Gagal: " + data.message, "error");
          playErrorSound();
        }
      }
    } catch (e) {
      window.showToast("Server Error!", "error");
      playErrorSound();
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const {
    hardwareInput,
    setHardwareInput,
    isScanning,
    startScanKamera,
    stopScan,
    handleHardwareScan,
    scanModeRef,
  } = usePosScanner({
    selectedChannel,
    tipeChannel,
    checkoutStep,
    setCheckoutStep,
    setNoResi,
    setSelectedStore,
    stores,
    processApiCheckout,
    prosesBarangKeKeranjang,
    startAlarm,
    alarmConfigRef,
  });

  // Hitung State Render Pembayaran untuk UI
  const totalBelanja = useMemo(
    () =>
      cart.reduce((a, b) => a + parseFloat(b.harga_aktif || 0) * b.cartQty, 0),
    [cart],
  );

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col relative">
      <div className="flex flex-col gap-2 md:gap-3 flex-1 min-h-0">
        {/* UI INDICATOR 3-STEP SCANNER (MARKETPLACE) */}
        {tipeChannel === "Marketplace" && (
          <div className="flex items-center gap-1 md:gap-2 w-full bg-white p-2 rounded-xl border border-slate-100 shadow-sm shrink-0">
            <div
              className={`flex-1 text-center py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${checkoutStep !== "resi" && !selectedStore ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-400"}`}
            >
              1. Scan Barang
            </div>
            <div className="text-slate-300 text-[10px]">➔</div>
            <div
              className={`flex-1 text-center py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${checkoutStep !== "resi" && cart.length > 0 && !selectedStore ? "bg-amber-500 text-white shadow-md" : selectedStore ? "bg-emerald-500 text-white shadow-md" : "bg-slate-100 text-slate-400"}`}
            >
              2. Scan Toko
            </div>
            <div className="text-slate-300 text-[10px]">➔</div>
            <div
              className={`flex-1 text-center py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${checkoutStep === "resi" ? "bg-rose-500 text-white shadow-md animate-pulse" : "bg-slate-100 text-slate-400"}`}
            >
              3. Scan Resi
            </div>
          </div>
        )}

        {/* ================= ATAS: SETUP KASIR & SCAN ================= */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 shrink-0">
          {/* KIRI: SETUP CHANNEL */}
          <div className="bg-white px-2 md:px-3 py-2 md:py-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-1.5 md:gap-2">
            <div className="w-5 h-5 md:w-7 md:h-7 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center shrink-0 text-[10px] md:text-xs">
              🏷️
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Pilih Channel..."
                className="w-full bg-transparent font-black text-[10px] md:text-sm text-blue-600 outline-none cursor-text placeholder-slate-400 pr-4 md:pr-6"
                value={channelInput}
                onFocus={() => {
                  setShowChannelList(true);
                  if (selectedChannel) {
                    setChannelInput("");
                    setSelectedChannel("");
                  }
                }}
                onBlur={() => setTimeout(() => setShowChannelList(false), 200)}
                onChange={(e) => {
                  setChannelInput(e.target.value);
                  setShowChannelList(true);
                  if (selectedChannel) setSelectedChannel(""); // Reset channel kalo diketik ulang
                }}
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
              {showChannelList && (
                <div className="absolute top-full mt-2 left-0 w-[110%] min-w-[250px] bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto custom-scrollbar flex flex-col">
                  {channels.filter(
                    (c) =>
                      c.nama_channel
                        .toLowerCase()
                        .includes(channelInput.toLowerCase()) ||
                      c.tipe.toLowerCase().includes(channelInput.toLowerCase()),
                  ).length > 0 ? (
                    channels
                      .filter(
                        (c) =>
                          c.nama_channel
                            .toLowerCase()
                            .includes(channelInput.toLowerCase()) ||
                          c.tipe
                            .toLowerCase()
                            .includes(channelInput.toLowerCase()),
                      )
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 transition-colors last:border-b-0"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Mencegah input kehilangan fokus terlalu cepat
                            setSelectedChannel(c.id);
                            setChannelInput(`${c.nama_channel} (${c.tipe})`);
                            setShowChannelList(false);
                            setCart([]);
                            setIsGlobalSample(false);
                            if (c.tipe === "Reseller") {
                              setCustomerName(c.nama_channel);
                              setCustomerPhone(c.no_hp || "");
                            }
                          }}
                        >
                          <div className="font-black text-xs text-slate-800 uppercase italic leading-none">
                            {c.nama_channel}
                          </div>
                          <div className="text-[10px] font-bold text-blue-500 uppercase mt-1">
                            {c.tipe}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase italic">
                      Channel tidak ditemukan
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedChannel && (
              <div className="flex flex-col gap-1 items-end shrink-0">
                <span className="text-[8px] md:text-[9px] font-bold text-emerald-500 uppercase px-2 py-1 bg-emerald-50 rounded-md border border-emerald-100 whitespace-nowrap">
                  ✓ Aktif
                </span>
                {tipeChannel === "Reseller" && (
                  <span className="text-[8px] md:text-[9px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md border border-blue-100 whitespace-nowrap shadow-sm">
                    Deposit: Rp{" "}
                    {parseFloat(
                      activeChannelObj?.saldo_deposit || 0,
                    ).toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* KANAN: SCAN BARANG */}
          <div className="bg-slate-900 px-2 md:px-3 py-2 md:py-2.5 rounded-xl shadow-md flex items-center gap-1.5 md:gap-2">
            <div className="w-5 h-5 md:w-7 md:h-7 bg-slate-800 text-white rounded-md flex items-center justify-center shrink-0 text-[10px] md:text-xs">
              📷
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Scan Barcode..."
              className="w-full bg-transparent text-white font-black text-[10px] md:text-sm outline-none placeholder-slate-500 tracking-widest"
              value={hardwareInput}
              onChange={(e) => setHardwareInput(e.target.value)}
              onKeyDown={handleHardwareScan}
            />

            {/* TOGGLE FREE SAMPLE MODE (GLOBAL CHECKBOX) */}
            <label
              className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-all shrink-0 ${
                isGlobalSample
                  ? "bg-rose-500 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                  : "bg-slate-800 border-slate-700 hover:bg-slate-700"
              }`}
              title="Centang untuk scan barang selanjutnya sebagai Free Sample (Gratis)"
            >
              <input
                type="checkbox"
                className="w-4 h-4 md:w-4 md:h-4 cursor-pointer accent-rose-600"
                checked={isGlobalSample}
                onChange={(e) => setIsGlobalSample(e.target.checked)}
              />
              <span
                className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:inline ${isGlobalSample ? "text-white" : "text-slate-400"}`}
              >
                {isGlobalSample ? "SAMPLE AKTIF" : "MODE SAMPLE"}
              </span>
            </label>

            <button
              onClick={() => startScanKamera("item")}
              className="bg-blue-600 px-2 md:px-3 py-1.5 rounded-lg text-[8px] md:text-[9px] text-white font-black uppercase hover:bg-blue-500 transition-all shrink-0"
            >
              Kamera
            </button>
          </div>
        </div>

        {/* ================= BAWAH: KATALOG & KERANJANG ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 md:gap-3 flex-1 min-h-0">
          {/* KIRI: KATALOG (5/8) */}
          <CatalogPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredItems={catalogItems}
            selectItemManual={selectItemManual}
            API_URL={API_URL}
            isLoading={isCatalogLoading}
            setZoomedImage={setZoomedImage}
          />

          {/* KANAN: KERANJANG (3/8) */}
          <CartPanel
            cart={cart}
            setCart={setCart}
            totalBelanja={totalBelanja}
            startCheckout={startCheckout}
          />
        </div>
      </div>

      {/* ================= MODAL ALUR MARKETPLACE ================= */}
      <MarketplaceModals
        checkoutStep={checkoutStep}
        tipeChannel={tipeChannel}
        setCheckoutStep={setCheckoutStep}
        storeScanInput={storeScanInput}
        setStoreScanInput={setStoreScanInput}
        handleStepStoreScan={handleStepStoreScan}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
        filteredStores={filteredStores}
        startScanKamera={startScanKamera}
        noResi={noResi}
        setNoResi={setNoResi}
        handleStepResiScan={handleStepResiScan}
      />

      {/* ================= MODAL PEMBAYARAN AKHIR ================= */}
      {checkoutStep === "payment" && (
        <PaymentModal
          tipeChannel={tipeChannel}
          namaTokoMP={namaTokoMP}
          totalBelanja={totalBelanja}
          processApiCheckout={processApiCheckout}
          setCheckoutStep={setCheckoutStep}
          rekeningList={rekeningList}
          cart={cart}
          setCart={setCart}
          paymentList={paymentList}
          setPaymentList={setPaymentList}
          jatuhTempo={jatuhTempo}
          setJatuhTempo={setJatuhTempo}
          activeChannelObj={activeChannelObj}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          API_URL={API_URL}
          isCheckoutLoading={isCheckoutLoading}
          setZoomedImage={setZoomedImage}
        />
      )}

      {/* ================= OVERLAY KAMERA HP ================= */}
      <CameraOverlay
        isScanning={isScanning}
        scanModeRef={scanModeRef}
        stopScan={stopScan}
      />

      {/* ================= MODAL ALARM KESALAHAN SCAN ================= */}
      <AlarmOverlay alarmConfig={alarmConfig} stopAlarm={stopAlarm} />

      <ZoomModal zoomedImage={zoomedImage} setZoomedImage={setZoomedImage} />
    </div>
  );
};

export default Pos;
