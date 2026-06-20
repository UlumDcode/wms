import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export const playBeep = () => {
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
  } catch (e) {}
};

export const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
};

export const playErrorSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth"; // Gelombang sawtooth untuk suara lebih "galak"
    osc.frequency.setValueAtTime(200, ctx.currentTime); // Mulai dari nada rendah
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1); // Turun cepat
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); // Decay cepat
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
};

export const usePosScanner = ({
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
}) => {
  const [hardwareInput, setHardwareInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const html5QrCodeRef = useRef(null);
  const scanModeRef = useRef("item");
  const handleScanResultRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const lastScannedCodeRef = useRef("");

  const handleHardwareScan = async (e) => {
    const val = e.target.value;
    if (e.key === "Enter" && val) {
      if (alarmConfigRef.current) {
        setHardwareInput("");
        return;
      }
      if (!selectedChannel) {
        window.showToast("Pilih Channel Pricelist Dulu Bro!", "warning");
        setHardwareInput("");
        return;
      }
      const kode = val.trim();
      setHardwareInput("");

      // KONDISI B: STEP 3 (Input Resi)
      if (checkoutStep === "resi") {
        setNoResi(kode);
        if (tipeChannel === "Marketplace") {
          processApiCheckout("Dikirim", kode);
          stopScan();
        } else {
          setCheckoutStep("payment");
          stopScan();
        }
        playSuccessSound();
        return;
      }

      // KONDISI A: STEP 1 (Barang) ATAU STEP 2 (Toko)
      const matchedStore = stores.find((s) => s.kode_store === kode);
      if (matchedStore) {
        if (matchedStore.channel_id != selectedChannel) {
          startAlarm("Toko Beda Channel! Cek Lagi Bro.", "wrong_store");
          return;
        }
        setSelectedStore(matchedStore.id);
        setCheckoutStep("resi"); // Lanjut ke Step 3
        playBeep();
        return;
      }

      // JIKA BUKAN TOKO, JALANKAN LOGIKA BARANG (ORIGINAL)
      prosesBarangKeKeranjang(kode);
    }
  };

  const startScanKamera = (mode) => {
    if (
      (mode === "item" || mode === "store" || mode === "resi") &&
      !selectedChannel
    ) {
      return window.showToast("Pilih Channel Penjualan Dulu Bro!", "warning");
    }
    scanModeRef.current = mode;
    setIsScanning(true);

    setTimeout(() => {
      try {
        const qr = new Html5Qrcode("kamera-scanner");
        html5QrCodeRef.current = qr;
        const boxWidth = Math.min(250, window.innerWidth - 60);
        qr.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: {
              width:
                mode === "resi"
                  ? Math.min(300, window.innerWidth - 60)
                  : boxWidth,
              height: mode === "resi" ? 120 : boxWidth,
            },
          },
          (decodedText) => {
            if (handleScanResultRef.current) {
              handleScanResultRef.current(decodedText, scanModeRef.current);
            }
          },
          () => {},
        ).catch(() => {
          window.showToast("Izinkan akses kamera di browser lu!", "error");
          setIsScanning(false);
        });
      } catch (e) {
        setIsScanning(false);
      }
    }, 300);
  };

  const stopScan = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {}
    }
    setIsScanning(false);
  };

  const handleScanResult = (text, mode) => {
    if (alarmConfigRef.current) return;

    const now = Date.now();
    if (
      text === lastScannedCodeRef.current &&
      now - lastScanTimeRef.current < 2000
    )
      return;
    lastScannedCodeRef.current = text;
    lastScanTimeRef.current = now;

    // KONDISI B: STEP 3 (Input Resi)
    if (checkoutStep === "resi") {
      setNoResi(text);
      if (tipeChannel === "Marketplace") {
        // Marketplace: Resi adalah langkah terakhir, langsung checkout dan matikan kamera
        processApiCheckout("Dikirim", text);
        stopScan();
      } else {
        // Non-Marketplace: Resi di-scan, lanjut ke pembayaran, matikan kamera agar tidak mengganggu modal
        setCheckoutStep("payment");
        stopScan();
      }
      playSuccessSound();
      return;
    }

    // KONDISI A: STEP 1 (Barang) ATAU STEP 2 (Toko)
    const matchedStore = stores.find((s) => s.kode_store === text);
    if (matchedStore) {
      if (matchedStore.channel_id != selectedChannel) {
        startAlarm("Toko Beda Channel! Cek Lagi Bro.", "wrong_store");
        return;
      }
      setSelectedStore(matchedStore.id);
      setCheckoutStep("resi"); // Lanjut ke Step 3
      playBeep();
      return;
    }

    // JIKA BUKAN TOKO, JALANKAN LOGIKA BARANG (ORIGINAL)
    prosesBarangKeKeranjang(text);
  };

  // Selalu update referensi dengan fungsi (dan state) yang paling baru setiap render
  handleScanResultRef.current = handleScanResult;

  return {
    hardwareInput,
    setHardwareInput,
    isScanning,
    startScanKamera,
    stopScan,
    handleHardwareScan,
    scanModeRef,
  };
};
