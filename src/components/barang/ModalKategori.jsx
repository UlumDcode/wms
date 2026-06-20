const ModalKategori = ({
  showKatModal,
  setShowKatModal,
  newKatName,
  setNewKatName,
  handleSaveKategori,
}) => {
  if (!showKatModal) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in">
      <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-xs md:max-w-sm shadow-2xl animate-in zoom-in-95 border border-slate-100">
        <h3 className="font-black italic uppercase text-lg md:text-xl mb-1 text-slate-800 leading-none">
          Tambah <span className="text-blue-600">Kategori</span>
        </h3>
        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 md:mb-5 border-b border-slate-100 pb-3">
          Buat Kategori Produk Baru
        </p>
        <input
          autoFocus
          type="text"
          placeholder="Nama kategori..."
          className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 p-3 md:p-4 rounded-xl font-bold text-xs outline-none mb-4 md:mb-5 shadow-sm transition-all"
          value={newKatName}
          onChange={(e) => setNewKatName(e.target.value)}
        />
        <div className="flex gap-2.5 md:gap-3">
          <button
            type="button"
            onClick={() => setShowKatModal(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest active:scale-95 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveKategori}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] shadow-md tracking-widest active:scale-95 transition-all"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalKategori;
