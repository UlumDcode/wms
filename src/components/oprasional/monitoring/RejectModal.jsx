import React, { useEffect } from "react";

const RejectModal = ({
  isOpen,
  onClose,
  order,
  items = [],
  formRetur,
  setFormRetur,
  onSubmit,
  rekeningList = [],
}) => {
  if (!isOpen) return null;

  // Sinkronisasi data order ke form saat modal dibuka
  useEffect(() => {
    if (isOpen && order?.id) {
      const initialItems = Array.isArray(items)
        ? items.map((item) => ({
            inventory_id: item.inventory_id,
            nama_barang: item.nama_barang,
            kode_barang: item.kode_barang,
            qty_order: item.qty,
            qty_reject: 0,
            price_per_pcs:
              (parseFloat(item.subtotal) || 0) / (parseInt(item.qty) || 1),
          }))
        : [];

      setFormRetur((prev) => ({
        ...prev,
        no_invoice: order.no_invoice || "",
        items: initialItems,
        nama_pembeli: order.nama_pembeli || order.nama_channel || "",
        no_hp_pembeli: order.no_hp || "",
      }));
    }
  }, [isOpen, order?.id, items]);

  const handleItemQtyChange = (invId, val) => {
    const updatedItems = formRetur.items.map((item) =>
      item.inventory_id === invId
        ? { ...item, qty_reject: parseInt(val) || 0 }
        : item,
    );
    setFormRetur({ ...formRetur, items: updatedItems });
  };

  const totalRefund = (formRetur.items || []).reduce((acc, item) => {
    return acc + item.qty_reject * item.price_per_pcs;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-2xl w-full max-w-4xl animate-in zoom-in-95 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        {/* HEADER */}
        <div className="shrink-0 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg md:text-xl font-black italic uppercase text-slate-800 dark:text-white leading-none">
                {formRetur?.status === "Retur" ? "Form " : "Laporan "}
                <span className={formRetur?.status === "Retur" ? "text-amber-500" : "text-rose-600 dark:text-rose-500"}>
                  {formRetur?.status === "Retur" ? "Retur (Verifikasi)" : "Reject (Non-MP)"}
                </span>
              </h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                INV: {formRetur.no_invoice}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-rose-500 p-1 text-lg"
            >
              ✕
            </button>
          </div>
          <hr className="border-slate-100 dark:border-slate-800 mt-3" />
        </div>

        {/* FORM CONTENT */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden flex-1"
        >
          {/* SISI KIRI: PEMILIHAN BARANG */}
          <div className="flex flex-col overflow-hidden">
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-1 mb-2 shrink-0">
              1. Pilih Barang & Qty Reject:
            </label>
            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-[200px]">
              {formRetur.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-sm hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
                >
                  <div className="flex-1 min-w-0 px-1">
                    <p className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-100 truncate">
                      {item.nama_barang}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                      {item.kode_barang} | Order: {item.qty_order}
                    </p>
                  </div>
                  <div className="w-16 shrink-0">
                    <input
                      type="number"
                      max={item.qty_order}
                      min="0"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 p-1.5 rounded-lg font-black text-center text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 dark:focus:border-rose-500"
                      value={item.qty_reject}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        handleItemQtyChange(item.inventory_id, e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SISI KANAN: DETAIL PEMBELI & KOMPENSASI */}
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 ml-1">
              2. Informasi & Tindakan:
            </label>

            {/* INFO PEMBELI */}
            <div className="grid grid-cols-2 gap-2 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-blue-500 dark:text-blue-400 ml-1">
                  Nama Pembeli
                </label>
                <input
                  type="text"
                  className="w-full bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-800/50 p-2 rounded-lg font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-blue-400"
                  value={formRetur.nama_pembeli || ""}
                  onChange={(e) =>
                    setFormRetur({ ...formRetur, nama_pembeli: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-blue-500 dark:text-blue-400 ml-1">
                  No. HP (WA)
                </label>
                <input
                  type="text"
                  className="w-full bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-800/50 p-2 rounded-lg font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-blue-400"
                  value={formRetur.no_hp_pembeli || ""}
                  onChange={(e) =>
                    setFormRetur({
                      ...formRetur,
                      no_hp_pembeli: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* OPSI KONDISI & KOMPENSASI */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">
                  Kondisi Barang
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-rose-500"
                  value={formRetur.kondisi_barang}
                  onChange={(e) =>
                    setFormRetur({
                      ...formRetur,
                      kondisi_barang: e.target.value,
                    })
                  }
                >
                  <option value="Cacat">❌ Cacat (Scrap)</option>
                  <option value="Normal">📥 Masuk Gudang Lagi</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">
                  Opsi Kompensasi
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-rose-500"
                  value={formRetur.opsi_kompensasi}
                  onChange={(e) =>
                    setFormRetur({
                      ...formRetur,
                      opsi_kompensasi: e.target.value,
                    })
                  }
                >
                  <option value="Ganti Barang">🔄 Ganti Barang</option>
                  <option value="Refund Cash">💵 Refund Cash</option>
                  {order?.tipe_channel === "Reseller" && (
                    <option value="Refund Saldo">📖 Balik Saldo</option>
                  )}
                </select>
              </div>
            </div>

            {/* ALASAN DETAIL */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">
                Alasan Detail
              </label>
              <textarea
                rows="2"
                placeholder="Contoh: Jahitan lepas..."
                className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-lg font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-rose-500 outline-none"
                value={formRetur.alasan}
                onChange={(e) =>
                  setFormRetur({ ...formRetur, alasan: e.target.value })
                }
              ></textarea>
            </div>

            {/* FORM PEMBAYARAN REFUND (Dengan AUTO RUPIAH) */}
            {formRetur.opsi_kompensasi === "Refund Cash" && (
              <div className="bg-rose-50 dark:bg-rose-900/10 p-3 rounded-xl border border-rose-100 dark:border-rose-800/50 space-y-2 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center px-1 border-b border-rose-100 dark:border-rose-800/50 pb-2 mb-2">
                  <label className="text-[10px] font-black uppercase text-rose-500 dark:text-rose-400">
                    Total Refund:
                  </label>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                    Rp {totalRefund.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-rose-400 dark:text-rose-500 ml-1">
                      Rekening Kas
                    </label>
                    <select
                      className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 p-2 rounded-lg font-bold text-xs text-slate-900 dark:text-white outline-none focus:border-rose-400"
                      value={formRetur.rekening_id || ""}
                      onChange={(e) =>
                        setFormRetur({
                          ...formRetur,
                          rekening_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Pilih...</option>
                      {rekeningList.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nama_rekening} (Rp{" "}
                          {parseFloat(r.saldo_sekarang).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-rose-400 dark:text-rose-500 ml-1">
                      Tunai Dibayar
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 p-2 rounded-lg font-black text-xs text-slate-900 dark:text-white outline-none focus:border-rose-400"
                      value={
                        formRetur.nominal_bayar
                          ? formRetur.nominal_bayar.toLocaleString("id-ID")
                          : ""
                      }
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        // Bersihkan semua karakter selain angka
                        const rawValue = e.target.value.replace(/\D/g, "");
                        setFormRetur({
                          ...formRetur,
                          nominal_bayar: parseInt(rawValue) || 0,
                        });
                      }}
                    />
                  </div>
                </div>
                {formRetur.nominal_bayar < totalRefund && (
                  <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-md border border-amber-100 dark:border-amber-800/50 mt-1">
                    ⚠️ Sisa Rp{" "}
                    {(totalRefund - formRetur.nominal_bayar).toLocaleString(
                      "id-ID",
                    )}{" "}
                    jadi HUTANG toko ke pembeli.
                  </p>
                )}
              </div>
            )}

            {/* TOMBOL AKSI DIPERKECIL */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-black text-[10px] uppercase shadow-lg shadow-rose-600/30 tracking-widest transition-all"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
