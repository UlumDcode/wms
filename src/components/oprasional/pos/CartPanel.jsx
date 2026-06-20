import React from "react";

const CartPanel = ({ cart, setCart, totalBelanja, startCheckout }) => {
  // Function to handle manual quantity change for an item in the cart
  const handleQtyChange = (itemId, isSample, newQty) => {
    // Jika input kosong atau bukan angka, jangan update dulu agar user bisa mengetik
    if (isNaN(newQty)) return;
    const quantity = Math.max(1, newQty);
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId && !!item.is_sample === isSample
          ? {
              ...item,
              cartQty: quantity,
              subtotal: item.is_sample
                ? 0
                : quantity *
                  parseFloat(
                    item.harga_aktif || item.harga_sebelum_sample || 0,
                  ),
            }
          : item,
      ),
    );
  };
  return (
    <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-2 md:mb-3 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <h3 className="font-black uppercase italic text-xs text-slate-800 dark:text-slate-200">
          📦 Keranjang
        </h3>
        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">
          {cart.length} Item
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
        {cart.map((item) => (
          <div
            key={item.id + (item.is_sample ? "-sample" : "")}
            className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 flex justify-between items-center"
          >
            <div className="flex-1 pr-2 overflow-hidden">
              <p className="font-black uppercase italic text-[10px] leading-tight text-slate-800 dark:text-slate-200 truncate">
                {item.nama_barang}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {item.kode_barang}
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-[8px] font-black text-blue-500 dark:text-blue-400 uppercase">
                  {item.cartQty} Pcs
                </span>
                {/* Quantity input field for manual adjustment */}
                <input
                  type="number"
                  min="1"
                  value={item.cartQty}
                  onFocus={(e) => e.target.select()} // Auto-select/blok saat diklik
                  onChange={(e) =>
                    handleQtyChange(
                      item.id,
                      item.is_sample,
                      parseInt(e.target.value, 10),
                    )
                  }
                  className="w-12 text-[12px] font-black text-slate-900 dark:text-white uppercase bg-transparent border-b border-slate-900 dark:border-white text-center focus:outline-none"
                />
                {item.is_sample && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">
                      |
                    </span>
                    <span className="bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[7px] font-black uppercase px-1 py-0.5 rounded">
                      FREE SAMPLE
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 italic">
                Rp {item.subtotal.toLocaleString()}
              </p>
              <button
                onClick={() =>
                  setCart(
                    cart.filter(
                      (x) => x.id !== item.id || x.is_sample !== item.is_sample,
                    ),
                  )
                }
                className="text-[8px] text-rose-500 dark:text-rose-400 font-bold uppercase hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 md:mt-3 md:pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex justify-between items-end mb-2">
          <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[9px] tracking-widest">
            Total Bayar
          </p>
          <p className="text-base md:text-lg font-black italic text-blue-600 dark:text-blue-400 leading-none tracking-tighter">
            Rp {totalBelanja.toLocaleString("id-ID")}
          </p>
        </div>
        <button
          onClick={startCheckout}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 md:py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-500/20 dark:shadow-none active:scale-95 transition-all"
        >
          Lanjutkan Pembayaran ➔
        </button>
      </div>
    </div>
  );
};

export default CartPanel;
