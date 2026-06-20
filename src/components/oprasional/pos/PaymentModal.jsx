import React, { useState, useCallback, memo, useMemo } from "react";
import FotoBarang from "../../FotoBarang";

// --- MEMOIZED COMPONENT UNTUK OPTIMASI RENDERING DAFTAR PANJANG ---
const CartItemRow = memo(({ item, handleNegoPrice, tipeChannel, API_URL, setZoomedImage }) => {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-sm gap-3 sm:gap-2">
      <FotoBarang
        foto={item.foto}
        apiUrl={API_URL}
        containerClass="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 shrink-0 mx-auto sm:mx-0 flex items-center justify-center overflow-hidden relative shadow-inner"
        iconClass="text-lg opacity-40"
        onClick={() => setZoomedImage && setZoomedImage(item.foto ? `${API_URL}/uploads/${item.foto}` : "no-image")}
      />
      <div className="flex-1 w-full pr-0 sm:pr-2">
        <p className="font-black uppercase italic text-[10px] leading-tight text-slate-800 mb-0.5 line-clamp-2">
          {item.nama_barang}
        </p>
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-black">
            {item.cartQty} Pcs
          </span>
          {(item.harga_default || 0) > 0 &&
            item.harga_default != item.harga_aktif &&
            !item.is_sample && (
              <span className="text-[9px] font-bold text-slate-400 line-through italic">
                Rp{" "}
                {parseFloat(Math.round(item.harga_default)).toLocaleString(
                  "id-ID",
                )}
              </span>
            )}
          {item.is_sample && (
            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
              FREE SAMPLE
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-2 border-t border-slate-100 sm:border-0 pt-2 sm:pt-0">
        <div className="flex items-center gap-2">
          {tipeChannel === "Marketplace" ? (
            <div
              className={`flex items-center justify-end bg-slate-50 border ${item.is_sample ? "border-transparent bg-transparent opacity-60" : "border-slate-100"} rounded-md px-2 py-1 w-20 md:w-24`}
            >
              <span
                className={`font-black text-[10px] ${item.is_sample ? "text-slate-500 line-through" : "text-slate-800"}`}
              >
                Rp {Math.round(item.harga_aktif).toLocaleString("id-ID")}
              </span>
            </div>
          ) : (
            <div
              className={`flex items-center gap-1 bg-slate-50 border ${item.is_sample ? "border-transparent bg-transparent opacity-60" : "border-slate-200"} rounded-md px-2 py-1 focus-within:border-blue-500 w-24 md:w-28`}
            >
              <span className="font-bold text-[10px] text-slate-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={
                  item.harga_aktif || item.harga_aktif === 0
                    ? Number(item.harga_aktif).toLocaleString("id-ID")
                    : ""
                }
                disabled={item.is_sample}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  handleNegoPrice(item.id, Number(rawValue) || 0);
                }}
                className={`w-full bg-transparent text-right font-black text-[10px] ${item.is_sample ? "text-slate-500" : "text-blue-600"} outline-none`}
              />
            </div>
          )}
        </div>
        <p className="text-[9px] font-bold text-slate-500 italic">
          Sub: Rp {Math.round(item.subtotal).toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
});

const PaymentModal = ({
  tipeChannel,
  namaTokoMP,
  totalBelanja,
  processApiCheckout,
  setCheckoutStep,
  rekeningList,
  cart,
  setCart,
  paymentList,
  setPaymentList,
  jatuhTempo,
  setJatuhTempo,
  activeChannelObj,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  API_URL,
  isCheckoutLoading,
  setZoomedImage,
}) => {
  const [izinkanPiutang, setIzinkanPiutang] = useState(false);

  const totalDibayar = paymentList.reduce(
    (acc, curr) => acc + (parseFloat(curr.amount) || 0),
    0,
  );
  const sisaTagihan = Math.max(0, totalBelanja - totalDibayar);
  const kembalian = Math.max(0, totalDibayar - totalBelanja);

  const isOffline =
    !tipeChannel ||
    String(tipeChannel).trim() === "" ||
    tipeChannel === "Offline";

  // Deteksi apakah sedang menggunakan metode potong saldo (Titipan/Deposit)
  const isUsingDeposit = paymentList.some((p) =>
    ["Saldo Titipan", "Saldo Reseller", "Deposit"].includes(p.method),
  );
  const isOfflineNunggak = isOffline && sisaTagihan > 0;

  const uniqueRekeningTypes = useMemo(() => {
    const types = rekeningList
      .filter(
        (r) =>
          r.tipe_rekening !== "MP Escrow" &&
          r.tipe_rekening !== "Piutang" &&
          r.tipe_rekening !== "Hutang",
      )
      .map((r) => r.tipe_rekening);
    return [...new Set(types)];
  }, [rekeningList]);

  const formatRupiah = (val) => {
    if (!val) return "";
    return new Intl.NumberFormat("id-ID").format(val);
  };

  const handleNegoPrice = useCallback(
    (id, newPriceStr) => {
      const newPrice = parseFloat(newPriceStr) || 0;
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id
            ? {
                ...item,
                harga_aktif: newPrice,
                subtotal: newPrice * item.cartQty,
              }
            : item,
        ),
      );
    },
    [setCart],
  );

  const handleBayarPas = (index) => {
    const newList = [...paymentList];
    const paidSoFar = newList.reduce(
      (acc, curr, i) =>
        i !== index ? acc + (parseFloat(curr.amount) || 0) : acc,
      0,
    );
    const sisa = Math.max(0, totalBelanja - paidSoFar);

    if (newList[index].method === "Saldo Titipan") {
      const maxSaldo = parseFloat(activeChannelObj?.saldo_titipan || 0);
      newList[index].amount =
        Math.min(sisa, maxSaldo) > 0 ? Math.min(sisa, maxSaldo) : "";
    } else if (
      newList[index].method === "Saldo Reseller" ||
      newList[index].method === "Deposit"
    ) {
      const maxDeposit = parseFloat(activeChannelObj?.saldo_deposit || 0);
      newList[index].amount =
        Math.min(sisa, maxDeposit) > 0 ? Math.min(sisa, maxDeposit) : "";
    } else {
      newList[index].amount = sisa > 0 ? sisa : "";
    }
    setPaymentList(newList);
  };

  const handlePaymentChange = (index, field, value) => {
    const newList = [...paymentList];
    if (field === "amount") {
      let numValue = parseInt(value.replace(/\D/g, ""), 10) || 0;
      newList[index][field] = numValue ? numValue : "";
    } else {
      newList[index][field] = value;
    }
    setPaymentList(newList);
  };

  const addPayment = () => {
    const currentTotal = paymentList.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
      0,
    );
    const sisa = Math.max(0, totalBelanja - currentTotal);

    setPaymentList([
      ...paymentList,
      { method: "", id_rekening: "", amount: sisa > 0 ? sisa : "" },
    ]);
  };

  const removePayment = (index) => {
    setPaymentList(paymentList.filter((_, i) => i !== index));
  };

  const handleCheckoutSubmit = (status) => {
    const hasInvalidPrice = cart.some(
      (item) => !item.is_sample && parseFloat(item.harga_aktif || 0) <= 0,
    );
    if (hasInvalidPrice) {
      return window.showToast(
        "GAGAL: Harga satuan barang tidak boleh Rp 0 (Kecuali Free Sample)!",
        "warning",
      );
    }

    const allSamples = cart.length > 0 && cart.every((item) => item.is_sample);
    if (totalBelanja <= 0 && !allSamples) {
      return window.showToast(
        "GAGAL: Total belanja tidak valid (Rp 0) jika bukan Free Sample!",
        "warning",
      );
    }

    if (tipeChannel !== "Marketplace") {
      // --- VALIDASI KHUSUS RESELLER ---
      if (tipeChannel === "Reseller") {
        const saldoReseller = parseFloat(activeChannelObj?.saldo_deposit || 0);

        // Hanya peringatkan jika Reseller PUNYA saldo tapi tidak dipakai sama sekali (mencegah lupa potong saldo)
        // Jika saldo memang sudah 0, maka otomatis diperbolehkan jadi Piutang
        if (
          saldoReseller > 0 &&
          totalDibayar < totalBelanja &&
          !izinkanPiutang
        ) {
          return window.showToast(
            "Reseller memiliki saldo deposit! Gunakan saldo atau centang konfirmasi Piutang.",
            "warning",
          );
        }
      }

      // 1. VALIDASI HANYA BERLAKU JIKA ADA UANG YANG DIBAYAR (DP / Lunas)
      if (totalDibayar > 0) {
        // Cek apakah ada input nominal > 0 tapi metodenya kosong
        const isMethodMissing = paymentList.some(
          (p) => parseFloat(p.amount) > 0 && !p.method,
        );
        if (isMethodMissing) {
          return window.showToast(
            "GAGAL: SILAKAN PILIH METODE PEMBAYARAN",
            "warning",
          );
        }

        // Cek apakah metode yang butuh rekening tidak diisi rekeningnya
        const isRekeningMissing = paymentList.some(
          (p) =>
            parseFloat(p.amount) > 0 &&
            !["Saldo Titipan", "Saldo Reseller", "Deposit"].includes(
              p.method,
            ) &&
            !p.id_rekening,
        );
        if (isRekeningMissing) {
          return window.showToast(
            "GAGAL: SILAKAN PILIH REKENING TUJUAN!",
            "warning",
          );
        }
      }

      // 2. JIKA RP 0 (100% UTANG) ATAU VALIDASI LOLOS, LANJUTKAN KE BACKEND
      processApiCheckout(totalDibayar >= totalBelanja ? "Sukses" : "Pending");
    } else {
      processApiCheckout(status);
    }
  };

  // Helper untuk cek apakah nominal melebihi saldo deposit/titipan
  const isOverBalance = (payItem) => {
    if (payItem.method === "Saldo Titipan") {
      return (
        (parseFloat(payItem.amount) || 0) >
        parseFloat(activeChannelObj?.saldo_titipan || 0)
      );
    }
    if (payItem.method === "Saldo Reseller" || payItem.method === "Deposit") {
      return (
        (parseFloat(payItem.amount) || 0) >
        parseFloat(activeChannelObj?.saldo_deposit || 0)
      );
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-white p-0 rounded-[1rem] w-full max-w-4xl max-h-[95vh] shadow-2xl animate-in zoom-in-95 border border-slate-100 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row">
        {/* KOLOM KIRI: ITEM KERANJANG NEGO & TOTAL (SEBELUMNYA KANAN) */}
        <div className="w-full md:w-1/2 p-5 md:p-6 flex flex-col bg-slate-50 md:overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-slate-200">
          <h3 className="font-black italic uppercase text-xs md:text-sm mb-2 text-slate-800 border-b border-slate-200 pb-2 shrink-0">
            🛒 Rincian <span className="text-blue-600">Pesanan</span>
          </h3>

          {/* DAFTAR ITEM (BISA NEGO) */}
          <div className="flex-1 md:overflow-y-auto pr-0 md:pr-1 custom-scrollbar space-y-3 mb-4 md:min-h-[150px]">
            {cart.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                handleNegoPrice={handleNegoPrice}
                tipeChannel={tipeChannel}
                API_URL={API_URL}
                setZoomedImage={setZoomedImage}
              />
            ))}
          </div>

          {/* GRAND TOTAL */}
          <div className="pt-4 border-t border-slate-200 shrink-0">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              <span>Total Item</span>
              <span className="text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {cart.length} Pcs
              </span>
            </div>
            <div className="flex justify-between items-end mt-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Grand Total
              </p>
              <p className="text-xl md:text-2xl font-black italic text-blue-600 tracking-tighter leading-none">
                Rp {totalBelanja.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: DATA PELANGGAN & FORM PEMBAYARAN (SEBELUMNYA KIRI) */}
        <div className="w-full md:w-1/2 p-5 md:p-6 flex flex-col bg-white md:overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
            <h3 className="font-black italic uppercase text-xs md:text-sm text-slate-800">
              💳 Pembayaran & <span className="text-blue-600">Pelanggan</span>
            </h3>
            <button
              onClick={() => setCheckoutStep(null)}
              className="text-[9px] font-black uppercase text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-rose-100"
              title="Tutup Modal"
            >
              Tutup
            </button>
          </div>

          {tipeChannel !== "Marketplace" && (
            <div className="mb-3 pb-3 border-b border-slate-100 shrink-0">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Data Pelanggan
              </h4>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nama Reseller / Pelanggan"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-[10px] outline-none focus:border-blue-500 transition-all"
                  value={customerName || activeChannelObj?.nama_channel || ""}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="No. WhatsApp / HP"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg font-bold text-[10px] outline-none focus:border-blue-500 transition-all"
                  value={customerPhone || activeChannelObj?.no_hp || ""}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    setCustomerPhone(rawValue);
                  }}
                />
              </div>
            </div>
          )}

          {/* INFO SALDO DEPOSIT (Khusus Reseller) */}
          {tipeChannel === "Reseller" && activeChannelObj && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
                  Saldo Deposit Tersedia
                </span>
              </div>
              <span className="text-sm font-black text-blue-600 italic">
                Rp{" "}
                {parseFloat(activeChannelObj.saldo_deposit || 0).toLocaleString(
                  "id-ID",
                )}
              </span>
            </div>
          )}

          <div className="space-y-4 flex-1 flex flex-col">
            {tipeChannel === "Marketplace" ? (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 border-dashed text-center flex flex-col items-center justify-center h-full mb-3">
                <span className="text-3xl mb-2">🛍️</span>
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">
                  Marketplace Checkout
                </p>
                <p className="text-[10px] font-bold text-blue-500 italic">
                  Data mutasi & potongan MP dikelola otomatis
                </p>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Multi-Tender (Split Payment)
                  </h4>
                </div>
                <div className="space-y-3 pr-1 pb-1">
                  {paymentList.map((p, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 mb-3 p-3 border border-slate-200 rounded-xl bg-slate-50 relative"
                    >
                      <div className="w-full">
                        <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">
                          Sumber Dana (Metode & Rekening)
                        </label>
                        <div className="flex flex-col gap-2">
                          <select
                            value={p.method || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newPayments = [...paymentList];
                              newPayments[index].method = val;
                              newPayments[index].id_rekening = "";

                              if (
                                val === "Saldo Titipan" ||
                                val === "Saldo Reseller" ||
                                val === "Deposit"
                              ) {
                                const currentBalance =
                                  val === "Saldo Titipan"
                                    ? parseFloat(
                                        activeChannelObj?.saldo_titipan || 0,
                                      )
                                    : parseFloat(
                                        activeChannelObj?.saldo_deposit || 0,
                                      );

                                if (currentBalance <= 0) {
                                  window.showToast(
                                    `Gagal: Saldo ${val} tidak mencukupi (Rp 0)!`,
                                    "warning",
                                  );
                                  return;
                                }

                                const maxSaldo =
                                  val === "Saldo Titipan"
                                    ? parseFloat(
                                        activeChannelObj?.saldo_titipan || 0,
                                      )
                                    : parseFloat(
                                        activeChannelObj?.saldo_deposit || 0,
                                      );

                                const paidSoFar = newPayments.reduce(
                                  (acc, curr, i) =>
                                    i !== index
                                      ? acc + (parseFloat(curr.amount) || 0)
                                      : acc,
                                  0,
                                );
                                const sisaTagihan = totalBelanja - paidSoFar;

                                const autoNominal = Math.min(
                                  sisaTagihan,
                                  maxSaldo,
                                );
                                newPayments[index].amount =
                                  autoNominal > 0 ? autoNominal : "";
                              }

                              setPaymentList(newPayments);
                            }}
                            className="w-full bg-white border border-slate-200 p-1.5 rounded-md font-bold text-[10px] outline-none focus:border-blue-500"
                          >
                            <option value="">-- Pilih Metode --</option>
                            {uniqueRekeningTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                            {Number(activeChannelObj?.saldo_titipan || 0) >
                              0 && (
                              <option value="Saldo Titipan">
                                🤝 Saldo Titipan (Rp{" "}
                                {Number(
                                  activeChannelObj.saldo_titipan,
                                ).toLocaleString("id-ID")}
                                )
                              </option>
                            )}
                            {tipeChannel === "Reseller" &&
                              Number(activeChannelObj?.saldo_deposit || 0) >
                                0 && (
                                <option value="Saldo Reseller">
                                  💰 Potong Saldo Deposit (Rp{" "}
                                  {Number(
                                    activeChannelObj.saldo_deposit,
                                  ).toLocaleString("id-ID")}
                                  )
                                </option>
                              )}
                          </select>

                          {p.method &&
                            p.method !== "Saldo Titipan" &&
                            p.method !== "Saldo Reseller" &&
                            p.method !== "Deposit" && (
                              <select
                                value={p.id_rekening || ""}
                                onChange={(e) => {
                                  const newPayments = [...paymentList];
                                  newPayments[index].id_rekening =
                                    e.target.value;
                                  setPaymentList(newPayments);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-md font-bold text-[10px] outline-none focus:border-blue-500"
                              >
                                <option value="">
                                  -- Pilih Rekening Tujuan --
                                </option>
                                {rekeningList
                                  .filter((r) => r.tipe_rekening === p.method)
                                  .map((rek) => (
                                    <option key={rek.id} value={rek.id}>
                                      {rek.nama_rekening}
                                    </option>
                                  ))}
                              </select>
                            )}
                        </div>
                      </div>

                      {/* BARIS 2: Nominal & Hapus */}
                      <div className="flex gap-2 items-start w-full mt-1.5">
                        <div className="flex-1 relative">
                          <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">
                            Nominal (Rp)
                          </label>
                          <div className="flex items-center bg-white border border-slate-200 rounded-md px-1.5 focus-within:border-blue-500">
                            <span className="text-slate-400 font-bold text-[10px] mr-1">
                              Rp
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              value={
                                p.amount
                                  ? Number(p.amount).toLocaleString("id-ID")
                                  : ""
                              }
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(
                                  /\D/g,
                                  "",
                                );
                                handlePaymentChange(index, "amount", rawValue);
                              }}
                              className={`w-full bg-transparent py-1.5 font-black text-[10px] outline-none ${isOverBalance(p) ? "text-rose-600" : "text-blue-700"}`}
                            />
                          </div>
                          <label className="text-[9px] flex items-center gap-1 mt-1.5 text-slate-500 cursor-pointer w-max hover:text-blue-600 transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleBayarPas(index);
                                } else {
                                  handlePaymentChange(index, "amount", "");
                                }
                              }}
                            />
                            <span className="font-bold">
                              Uang Pas / Lunasi Tagihan
                            </span>
                          </label>
                          {p.method === "Saldo Titipan" && (
                            <p
                              className={`text-[8px] font-bold mt-1 ${isOverBalance(p) ? "text-rose-600 animate-pulse" : "text-emerald-600"}`}
                            >
                              Saldo Saat Ini: Rp{" "}
                              {parseInt(
                                activeChannelObj?.saldo_titipan || 0,
                              ).toLocaleString("id-ID")}{" "}
                              | Sisa Saldo Nanti: Rp{" "}
                              {Math.max(
                                0,
                                parseInt(activeChannelObj?.saldo_titipan || 0) -
                                  (parseInt(p.amount) || 0),
                              ).toLocaleString("id-ID")}
                            </p>
                          )}
                          {(p.method === "Saldo Reseller" ||
                            p.method === "Deposit") && (
                            <p
                              className={`text-[8px] font-bold mt-1 ${isOverBalance(p) ? "text-rose-600 animate-pulse" : "text-blue-600"}`}
                            >
                              Deposit Saat Ini: Rp{" "}
                              {parseInt(
                                activeChannelObj?.saldo_deposit || 0,
                              ).toLocaleString("id-ID")}{" "}
                              | Sisa Deposit Nanti: Rp{" "}
                              {Math.max(
                                0,
                                parseInt(activeChannelObj?.saldo_deposit || 0) -
                                  (parseInt(p.amount) || 0),
                              ).toLocaleString("id-ID")}
                            </p>
                          )}
                        </div>

                        {paymentList.length > 1 && (
                          <button
                            onClick={() => removePayment(index)}
                            className="bg-rose-50 text-rose-500 p-1.5 px-2 rounded-md border border-rose-100 hover:bg-rose-100 transition-colors shrink-0 flex items-center justify-center h-[26px] mt-3.5"
                            title="Hapus Pembayaran ini"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addPayment}
                    className="w-full bg-blue-50 border border-blue-100 border-dashed text-blue-600 font-black text-[9px] uppercase tracking-widest p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    + Tambah Pembayaran
                  </button>
                </div>

                {/* PIUTANG ATAU KEMBALIAN */}
                {sisaTagihan > 0 && (
                  <div className="mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200 shadow-inner">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest">
                          Sisa Tagihan (Piutang)
                        </p>
                        <p className="text-sm md:text-base font-black italic text-amber-700">
                          Rp {sisaTagihan.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    {isOffline && (
                      <p className="text-red-500 text-[9px] font-bold mt-1">
                        ⚠️ Transaksi Offline tidak bisa diutang. Pembayaran
                        harus LUNAS.
                      </p>
                    )}
                    {/* Checkbox konfirmasi piutang muncul jika pakai saldo ATAU jika dia Reseller */}
                    {(isUsingDeposit || tipeChannel === "Reseller") &&
                      !isOffline && (
                        <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500"
                            checked={izinkanPiutang}
                            onChange={(e) =>
                              setIzinkanPiutang(e.target.checked)
                            }
                          />
                          <span className="text-[9px] font-bold text-amber-800">
                            Setuju sisa Rp {sisaTagihan.toLocaleString("id-ID")}{" "}
                            dijadikan Piutang.
                          </span>
                        </label>
                      )}
                  </div>
                )}

                {kembalian > 0 && (
                  <div className="mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex justify-between items-center shadow-inner">
                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">
                      Kembalian:
                    </span>
                    <span className="text-sm md:text-base font-black italic text-emerald-700">
                      Rp {kembalian.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ACTION BUTTONS (dipindah ke bawah pembayaran) */}
            <div className="pt-4 mt-auto border-t border-slate-200 shrink-0">
              {tipeChannel === "Marketplace" ? (
                <button
                  onClick={() =>
                    !isCheckoutLoading && handleCheckoutSubmit("Dikirim")
                  }
                  disabled={isCheckoutLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 md:p-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isCheckoutLoading
                    ? "⏳ SEDANG MEMPROSES..."
                    : "📦 KIRIM PESANAN (MP)"}
                </button>
              ) : sisaTagihan > 0 ? (
                <button
                  onClick={() =>
                    !isCheckoutLoading && handleCheckoutSubmit("Pending")
                  }
                  disabled={
                    isCheckoutLoading ||
                    isOfflineNunggak ||
                    (sisaTagihan > 0 && isUsingDeposit && !izinkanPiutang)
                  }
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white p-3 md:p-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-amber-500/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isCheckoutLoading
                    ? "⏳ SEDANG MEMPROSES..."
                    : "⏳ PROSES UTANG (PENDING)"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    !isCheckoutLoading && handleCheckoutSubmit("Sukses")
                  }
                  disabled={isCheckoutLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-3 md:p-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isCheckoutLoading
                    ? "⏳ SEDANG MEMPROSES..."
                    : "💵 PROSES PEMBAYARAN"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
