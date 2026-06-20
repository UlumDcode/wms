import { useState } from "react";

const CoaGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* TRIGGER BANNER */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-50 text-indigo-600 px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-indigo-100 active:scale-95 transition-all w-full sm:w-auto whitespace-nowrap flex justify-center items-center gap-2"
      >
        <span className="text-sm">📖</span> PANDUAN
      </button>

      {/* FULL PAGE MODAL (BLOG STYLE) */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative">
            {/* Close Button Fixed Float */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-20 bg-black/40 hover:bg-rose-600 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors font-black shadow-lg"
            >
              ✕
            </button>

            <div className="overflow-y-auto custom-scrollbar flex-1 pb-20">
              {/* Hero Section */}
              <div className="relative h-64 md:h-[400px] w-full shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1600"
                  alt="Accounting Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 md:p-12 text-white">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-sm">
                    Materi Dasar Keuangan
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight mb-2 md:mb-3">
                    Panduan Lengkap <br />{" "}
                    <span className="text-blue-400">Chart of Accounts</span>
                  </h1>
                  <p className="text-slate-300 font-medium text-xs md:text-base max-w-2xl leading-relaxed">
                    Pahami cara kerja Debit, Kredit, dan 5 Pilar Utama Akuntansi
                    untuk merapikan pembukuan usaha Anda.
                  </p>
                </div>
              </div>

              {/* Content Body */}
              <div className="max-w-4xl mx-auto p-6 md:p-10 text-slate-800 space-y-10 md:space-y-12">
                {/* Section 1 */}
                <section>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 mb-4 border-b-2 border-blue-500 pb-2 inline-block">
                    1. Apa itu COA?
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    <b>Chart of Accounts (COA)</b> atau Bagan Akun adalah daftar
                    dari seluruh akun yang digunakan oleh perusahaan untuk
                    mencatat transaksi keuangannya di buku besar (General
                    Ledger). COA berfungsi layaknya "laci-laci" yang
                    mengelompokkan uang masuk dan keluar agar laporan keuangan
                    (Neraca & Laba Rugi) bisa terbentuk secara otomatis dan
                    rapi.
                  </p>
                </section>

                {/* Section 2 */}
                <section>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 mb-6 border-b-2 border-emerald-500 pb-2 inline-block">
                    2. Lima Pilar Akun (The Big 5)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {/* Asset */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                      <div className="text-4xl mb-4">🏦</div>
                      <h3 className="font-black text-lg text-emerald-600 uppercase tracking-wider mb-2">
                        1. Asset (Harta)
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Kekayaan yang dimiliki bisnis Anda.
                      </p>
                      <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside ml-2 mb-6 font-medium">
                        <li>Kas (Uang tunai) & Saldo Bank</li>
                        <li>Piutang (Uang di customer / MP)</li>
                        <li>Persediaan Barang / Inventory</li>
                        <li>Peralatan & Aset Tetap</li>
                      </ul>
                      <div className="bg-emerald-100 text-emerald-800 text-xs font-bold p-3 rounded-xl text-center uppercase tracking-widest mt-auto">
                        Bertambah di: DEBIT
                      </div>
                    </div>

                    {/* Liability */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col">
                      <div className="text-4xl mb-4">💳</div>
                      <h3 className="font-black text-lg text-rose-600 uppercase tracking-wider mb-2">
                        2. Liability (Kewajiban)
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Utang atau kewajiban perusahaan kepada pihak luar.
                      </p>
                      <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside ml-2 mb-6 font-medium">
                        <li>Utang Usaha (Ke Supplier)</li>
                        <li>Utang Bank / Pinjaman</li>
                        <li>Utang Pajak</li>
                      </ul>
                      <div className="bg-rose-100 text-rose-800 text-xs font-bold p-3 rounded-xl text-center uppercase tracking-widest mt-auto">
                        Bertambah di: KREDIT
                      </div>
                    </div>

                    {/* Equity */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col">
                      <div className="text-4xl mb-4">💎</div>
                      <h3 className="font-black text-lg text-indigo-600 uppercase tracking-wider mb-2">
                        3. Equity (Modal)
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Hak kepemilikan atas harta perusahaan setelah dikurangi
                        semua utang.
                      </p>
                      <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside ml-2 mb-6 font-medium">
                        <li>Modal Disetor (Dari Owner)</li>
                        <li>Prive (Penarikan Pribadi)</li>
                        <li>Laba Ditahan</li>
                      </ul>
                      <div className="bg-indigo-100 text-indigo-800 text-xs font-bold p-3 rounded-xl text-center uppercase tracking-widest mt-auto">
                        Bertambah di: KREDIT
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col">
                      <div className="text-4xl mb-4">📈</div>
                      <h3 className="font-black text-lg text-blue-600 uppercase tracking-wider mb-2">
                        4. Revenue (Pendapatan)
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Aliran uang yang masuk dari aktivitas penjualan / jasa.
                      </p>
                      <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside ml-2 mb-6 font-medium">
                        <li>Pendapatan Penjualan POS</li>
                        <li>Pendapatan Jasa</li>
                        <li>Pendapatan Bunga / Lainnya</li>
                      </ul>
                      <div className="bg-blue-100 text-blue-800 text-xs font-bold p-3 rounded-xl text-center uppercase tracking-widest mt-auto">
                        Bertambah di: KREDIT
                      </div>
                    </div>

                    {/* Expense */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow md:col-span-2">
                      <div className="text-4xl mb-4">📉</div>
                      <h3 className="font-black text-lg text-amber-600 uppercase tracking-wider mb-2">
                        5. Expense (Beban/Biaya)
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Biaya atau pengorbanan yang dikeluarkan untuk
                        menjalankan operasional bisnis.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside ml-2 font-medium">
                          <li>Harga Pokok Penjualan (HPP)</li>
                          <li>Beban Gaji Karyawan</li>
                          <li>Beban Sewa Gudang / Toko</li>
                        </ul>
                        <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside ml-2 font-medium">
                          <li>Beban Listrik & Internet</li>
                          <li>Beban Iklan / Ads</li>
                          <li>Beban Admin Marketplace</li>
                        </ul>
                      </div>
                      <div className="bg-amber-100 text-amber-800 text-xs font-bold p-3 rounded-xl text-center uppercase tracking-widest">
                        Bertambah di: DEBIT
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3 */}
                <section>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 mb-4 border-b-2 border-purple-500 pb-2 inline-block">
                    3. Aturan Saldo Normal
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6">
                    Menghafal posisi pencatatan Jurnal Umum (Debit/Kredit) bisa
                    jadi memusingkan. Gunakan tabel cheat sheet di bawah ini
                    sebagai acuan ketika mencatat jurnal:
                  </p>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                    <table className="w-full min-w-[500px] text-left">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="p-4 font-black uppercase tracking-widest text-slate-600 text-xs">
                            Kategori Akun
                          </th>
                          <th className="p-4 font-black uppercase tracking-widest text-emerald-600 text-xs text-center border-l border-slate-200 bg-emerald-50/50">
                            Jika Bertambah (+)
                          </th>
                          <th className="p-4 font-black uppercase tracking-widest text-rose-600 text-xs text-center border-l border-slate-200 bg-rose-50/50">
                            Jika Berkurang (-)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-xs md:text-sm text-slate-700">
                        <tr>
                          <td className="p-4">1. Asset (Harta)</td>
                          <td className="p-4 text-center bg-emerald-50/20 text-emerald-700">
                            DEBIT
                          </td>
                          <td className="p-4 text-center bg-rose-50/20 text-rose-700">
                            KREDIT
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4">2. Liability (Utang)</td>
                          <td className="p-4 text-center bg-emerald-50/20 text-emerald-700">
                            KREDIT
                          </td>
                          <td className="p-4 text-center bg-rose-50/20 text-rose-700">
                            DEBIT
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4">3. Equity (Modal)</td>
                          <td className="p-4 text-center bg-emerald-50/20 text-emerald-700">
                            KREDIT
                          </td>
                          <td className="p-4 text-center bg-rose-50/20 text-rose-700">
                            DEBIT
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4">4. Revenue (Pendapatan)</td>
                          <td className="p-4 text-center bg-emerald-50/20 text-emerald-700">
                            KREDIT
                          </td>
                          <td className="p-4 text-center bg-rose-50/20 text-rose-700">
                            DEBIT
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4">5. Expense (Beban)</td>
                          <td className="p-4 text-center bg-emerald-50/20 text-emerald-700">
                            DEBIT
                          </td>
                          <td className="p-4 text-center bg-rose-50/20 text-rose-700">
                            KREDIT
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6 rounded-r-xl shadow-sm">
                    <p className="text-sm md:text-base text-blue-800 font-medium leading-relaxed">
                      💡 <b className="font-black">Tips Mengingat Cepat:</b>{" "}
                      Harta (Asset) dan Beban (Expense) itu "berteman". Keduanya
                      sama-sama bertambah di posisi <b>DEBIT</b>. Sedangkan
                      sisanya (Utang, Modal, Pendapatan) saling berkaitan dan
                      selalu bertambah di posisi <b>KREDIT</b>.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoaGuide;
