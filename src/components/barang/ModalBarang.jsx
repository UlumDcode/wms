import Barcode from "react-barcode";

const ModalBarang = ({
  showModal,
  setShowModal,
  form,
  setForm,
  handleSubmit,
  handleNamaChange,
  kategori,
  setShowKatModal,
  preview,
  setPreview,
  loading,
}) => {
  if (!showModal || !form) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[1.5rem] md:rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 custom-scrollbar">
        <div className="p-5 md:p-8">
          <h3 className="font-black uppercase italic text-sm md:text-base mb-4 md:mb-6 border-b border-slate-100 pb-3 md:pb-4 text-slate-800">
            {form.id ? "📝 Edit Produk" : "🆕 Tambah Produk"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 items-stretch"
          >
            {/* KOLOM 1: Nama & Kode */}
            <div className="flex flex-col gap-3 md:gap-4">
              <input
                type="text"
                placeholder="Nama Produk"
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs outline-none border border-slate-100 focus:border-blue-500 shadow-sm transition-all"
                value={form.nama_barang}
                onChange={handleNamaChange}
              />
              <input
                type="text"
                placeholder="Kode Barang"
                className="w-full bg-slate-100 p-3 md:p-4 rounded-xl font-black text-xs text-blue-600 uppercase border border-slate-100 shadow-sm"
                value={form.kode_barang}
                readOnly={!!form.id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kode_barang: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            {/* KOLOM 2: Kategori & Size */}
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex gap-2">
                <select
                  className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs outline-none border border-slate-100 focus:border-blue-500 shadow-sm transition-all cursor-pointer"
                  value={form.nama_kategori || ""}
                  onChange={(e) =>
                    setForm({ ...form, nama_kategori: e.target.value })
                  }
                >
                  <option value="">-- Kategori --</option>
                  {kategori.map((k) => (
                    <option key={k.id} value={k.nama_kategori}>
                      {k.nama_kategori}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowKatModal(true)}
                  className="bg-slate-900 text-white px-3 md:px-4 rounded-xl text-base font-black hover:bg-blue-600 active:scale-95 transition-all shadow-md shrink-0 flex items-center justify-center"
                  title="Tambah Kategori Baru"
                >
                  +
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Size"
                  className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs outline-none border border-slate-100 focus:border-blue-500 shadow-sm transition-all"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Batas Stok"
                  className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs outline-none border border-slate-100 focus:border-blue-500 shadow-sm transition-all"
                  value={form.batas_stok_rendah}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    setForm({ ...form, batas_stok_rendah: rawValue });
                  }}
                  title="Batas Stok (Default: 20)"
                />
              </div>
            </div>

            {/* KOLOM 3: Foto */}
            <div className="relative h-24 md:h-full min-h-[96px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:border-blue-300">
              <input
                key={preview || "empty-file"}
                type="file"
                className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setForm({ ...form, foto: file });
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[9px] font-black text-slate-400 uppercase">
                  Upload Foto
                </span>
              )}
            </div>

            {/* KOLOM 4: Barcode & Submit */}
            <div className="flex flex-col gap-3 md:gap-4 h-full">
              <div className="flex-1 bg-slate-50 rounded-xl md:rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden min-h-[60px]">
                {form.kode_barang ? (
                  <Barcode
                    value={form.kode_barang}
                    width={1.2}
                    height={35}
                    fontSize={10}
                    background="transparent"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-slate-300 uppercase">
                    Preview Barcode
                  </span>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 p-3 md:p-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-slate-900 text-white p-3 md:p-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "PROSES..." : form.id ? "SIMPAN" : "DAFTAR"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalBarang;
