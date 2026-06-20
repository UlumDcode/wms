const ModalStok = ({
  showModalStok,
  setShowModalStok,
  handleSubmitStok,
  formStok,
  setFormStok,
  formatRupiah,
  showSupplierSuggestions,
  setShowSupplierSuggestions,
  suppliers,
  rekenings,
  loading,
}) => {
  if (!showModalStok) return null;

  // Variabel kalkulasi Auto-Status untuk Form Modal Stok
  const qtyStok = parseInt(formStok?.qty) || 0;
  const hargaStok = formStok?.harga_per_pcs
    ? parseInt(formStok.harga_per_pcs.replace(/\D/g, "")) || 0
    : 0;
  const cleanTotalStok = qtyStok * hargaStok;
  const cleanNominalStok = formStok?.nominal_bayar
    ? parseInt(formStok.nominal_bayar.replace(/\D/g, "")) || 0
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmitStok}
        className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl p-5 md:p-8 border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-slate-100 pb-3 md:pb-4">
          <div>
            <h3 className="font-black uppercase italic text-sm md:text-base text-slate-800">
              Set Modal Cepat & Inbound
            </h3>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
              Produk: {formStok.nama_barang}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModalStok(false)}
            className="text-slate-400 hover:text-rose-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">
              Kuantitas Masuk
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={
                formStok.qty ? Number(formStok.qty).toLocaleString("id-ID") : ""
              }
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                setFormStok({ ...formStok, qty: rawValue });
              }}
              className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">
              Harga Beli (Satuan)
            </label>
            <input
              type="text"
              placeholder="Rp 0"
              value={formStok.harga_per_pcs}
              onChange={(e) =>
                setFormStok({
                  ...formStok,
                  harga_per_pcs: formatRupiah(e.target.value),
                })
              }
              className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">
              Model / Nama Produk
            </label>
            <input
              type="text"
              placeholder="Misal: Kaos Oversize"
              value={formStok.model}
              onChange={(e) =>
                setFormStok({ ...formStok, model: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 shadow-sm transition-all"
            />
          </div>
          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">
              Nama Supplier
            </label>
            <input
              type="text"
              placeholder="Nama Vendor / Supplier"
              value={formStok.supplier}
              onChange={(e) => {
                setFormStok({ ...formStok, supplier: e.target.value });
                setShowSupplierSuggestions(true);
              }}
              onFocus={() => setShowSupplierSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowSupplierSuggestions(false), 200)
              }
              className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 shadow-sm transition-all"
            />
            {showSupplierSuggestions && formStok.supplier && (
              <div className="absolute z-[110] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto custom-scrollbar">
                {suppliers
                  .filter((s) =>
                    s.nama_supplier
                      .toLowerCase()
                      .includes(formStok.supplier.toLowerCase()),
                  )
                  .map((s) => (
                    <div
                      key={s.id}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                      onClick={() => {
                        setFormStok({
                          ...formStok,
                          supplier: s.nama_supplier,
                          no_hp_supplier: s.no_hp || "",
                        });
                        setShowSupplierSuggestions(false);
                      }}
                    >
                      <div className="text-xs font-black text-slate-800 uppercase">
                        {s.nama_supplier}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        WA: {s.no_hp || "-"}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">
              No. HP Supplier (WA)
            </label>
            <input
              type="text"
              placeholder="No. WA Supplier (62...)"
              value={formStok.no_hp_supplier}
              onChange={(e) =>
                setFormStok({ ...formStok, no_hp_supplier: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">
              Nominal Dibayar (DP/Lunas)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rp 0 (Kosongi = Hutang)"
                value={formStok.nominal_bayar}
                onChange={(e) =>
                  setFormStok({
                    ...formStok,
                    nominal_bayar: formatRupiah(e.target.value),
                  })
                }
                className="w-full bg-blue-50 border border-blue-100 p-3 md:p-4 rounded-xl font-black text-sm text-blue-700 outline-none focus:border-blue-500 shadow-sm transition-all"
              />
              <button
                type="button"
                onClick={() =>
                  setFormStok({
                    ...formStok,
                    nominal_bayar: formatRupiah(cleanTotalStok),
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded hover:bg-slate-900 transition-all"
              >
                PAS
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-slate-100">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Total Tagihan:</span>
              <span className="text-slate-800">
                {formatRupiah(cleanTotalStok)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Sisa Hutang:</span>
              <span className="text-rose-600">
                {formatRupiah(Math.max(0, cleanTotalStok - cleanNominalStok))}
              </span>
            </div>
            <div className="mt-2 text-center">
              {(() => {
                let label = "🔴 FULL HUTANG";
                let color = "bg-rose-50 text-rose-600 border-rose-100";
                if (cleanNominalStok > 0) {
                  if (
                    cleanNominalStok >= cleanTotalStok &&
                    cleanTotalStok > 0
                  ) {
                    label = "✅ LUNAS";
                    color = "bg-emerald-50 text-emerald-600 border-emerald-100";
                  } else {
                    label = "🟠 DP / CICIL";
                    color = "bg-amber-50 text-amber-600 border-amber-100";
                  }
                }
                return (
                  <span
                    className={`px-4 py-2 rounded-full text-[10px] font-black border ${color} shadow-sm`}
                  >
                    {label}
                  </span>
                );
              })()}
            </div>
          </div>

          <div
            className={
              cleanNominalStok > 0
                ? "opacity-100"
                : "opacity-40 pointer-events-none"
            }
          >
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">
              Sumber Dana (Wajib jika bayar)
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 p-3 md:p-4 rounded-xl font-bold text-xs outline-none focus:border-blue-500 shadow-sm transition-all"
              value={formStok.rekening_id}
              onChange={(e) =>
                setFormStok({ ...formStok, rekening_id: e.target.value })
              }
              required={cleanNominalStok > 0}
            >
              <option value="">-- Pilih Rekening --</option>
              {rekenings
                .filter(
                  (r) =>
                    !["Piutang", "Hutang", "MP Escrow"].includes(
                      r.tipe_rekening,
                    ),
                )
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_rekening}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 md:gap-4 pt-6 md:pt-8 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowModalStok(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-slate-900 hover:bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "MEMPROSES..." : "PROSES INBOUND"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModalStok;
