import { useState } from "react";

const JurnalGuide = () => {
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
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1600"
                  alt="Journaling Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 md:p-12 text-white">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-sm">
                    Praktik Akuntansi
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight mb-2 md:mb-3">
                    Panduan Lengkap <br />{" "}
                    <span className="text-blue-400">Jurnal Umum</span>
                  </h1>
                  <p className="text-slate-300 font-medium text-xs md:text-base max-w-2xl leading-relaxed">
                    Pahami sistem pencatatan ganda (Double-Entry Bookkeeping)
                    agar pembukuan Anda sinkron, seimbang, dan mudah dilacak.
                  </p>
                </div>
              </div>

              {/* Content Body */}
              <div className="max-w-4xl mx-auto p-6 md:p-10 text-slate-800 space-y-10 md:space-y-12">
                {/* Section 1 */}
                <section>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 mb-4 border-b-2 border-blue-500 pb-2 inline-block">
                    1. Apa itu Jurnal Umum?
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    <b>Jurnal Umum</b> adalah buku harian dari sebuah bisnis.
                    Tempat di mana setiap transaksi keuangan dicatat pertama
                    kali secara kronologis (berdasarkan urutan waktu). Sistem
                    akuntansi modern mewajibkan kita menggunakan metode{" "}
                    <i>Double-Entry</i>, artinya setiap transaksi minimal akan
                    mempengaruhi dua akun (satu di Debit, satu di Kredit).
                  </p>
                </section>

                {/* Section 2 */}
                <section>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 mb-6 border-b-2 border-emerald-500 pb-2 inline-block">
                    2. Aturan Emas Jurnal (Hukum Keseimbangan)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {/* Rule 1 */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                      <div className="text-4xl mb-4">⚖️</div>
                      <h3 className="font-black text-lg text-emerald-600 uppercase tracking-wider mb-2">
                        Selalu Seimbang (Balance)
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Jumlah total nilai pada sisi <b>DEBIT</b> harus selalu
                        sama dengan jumlah total nilai pada sisi <b>KREDIT</b>.
                        Jika berselisih Rp 1 sekalipun, jurnal tersebut tidak
                        valid!
                      </p>
                    </div>

                    {/* Rule 2 */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col">
                      <div className="text-4xl mb-4">🔗</div>
                      <h3 className="font-black text-lg text-rose-600 uppercase tracking-wider mb-2">
                        Minimal 2 Baris Akun
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Karena aturan double-entry, satu transaksi minimal
                        terdiri dari 2 baris (1 akun bertambah, 1 akun
                        berkurang/bertambah di sisi lawannya). Anda boleh
                        menggunakan 3 baris atau lebih selama totalnya tetap
                        balance.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 3 */}
                <section>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-slate-900 mb-4 border-b-2 border-purple-500 pb-2 inline-block">
                    3. Contoh Pencatatan Transaksi Harian
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6">
                    Masih bingung menentukan Debit dan Kredit? Berikut adalah
                    contoh umum (cheat sheet) untuk mencatat transaksi
                    sehari-hari:
                  </p>
                  <div className="space-y-6">
                    {/* Contoh 1 */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                        <h4 className="font-black text-sm uppercase text-slate-700 tracking-widest">
                          A. Setoran Modal Awal (Pemilik suntik dana ke Kas
                          Bank)
                        </h4>
                      </div>
                      <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                          <tr>
                            <td className="p-4 w-1/2">Kas (Bank)</td>
                            <td className="p-4 w-1/4 text-right text-emerald-600">
                              Rp 10.000.000
                            </td>
                            <td className="p-4 w-1/4 text-right text-rose-500">
                              -
                            </td>
                          </tr>
                          <tr>
                            <td className="p-4 text-right italic font-normal pr-8">
                              Modal Pemilik
                            </td>
                            <td className="p-4 text-right text-emerald-600">
                              -
                            </td>
                            <td className="p-4 text-right text-rose-500">
                              Rp 10.000.000
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Contoh 2 */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                        <h4 className="font-black text-sm uppercase text-slate-700 tracking-widest">
                          B. Pembelian Inventaris / Aset secara Tunai
                        </h4>
                      </div>
                      <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                          <tr>
                            <td className="p-4 w-1/2">
                              Aset Tetap (Peralatan)
                            </td>
                            <td className="p-4 w-1/4 text-right text-emerald-600">
                              Rp 2.000.000
                            </td>
                            <td className="p-4 w-1/4 text-right text-rose-500">
                              -
                            </td>
                          </tr>
                          <tr>
                            <td className="p-4 text-right italic font-normal pr-8">
                              Kas Tunai
                            </td>
                            <td className="p-4 text-right text-emerald-600">
                              -
                            </td>
                            <td className="p-4 text-right text-rose-500">
                              Rp 2.000.000
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Contoh 3 */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                        <h4 className="font-black text-sm uppercase text-slate-700 tracking-widest">
                          C. Menjual Barang (Menerima Uang via Transfer Bank)
                        </h4>
                      </div>
                      <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                          <tr>
                            <td className="p-4 w-1/2">Kas (Bank)</td>
                            <td className="p-4 w-1/4 text-right text-emerald-600">
                              Rp 500.000
                            </td>
                            <td className="p-4 w-1/4 text-right text-rose-500">
                              -
                            </td>
                          </tr>
                          <tr>
                            <td className="p-4 text-right italic font-normal pr-8">
                              Pendapatan Penjualan
                            </td>
                            <td className="p-4 text-right text-emerald-600">
                              -
                            </td>
                            <td className="p-4 text-right text-rose-500">
                              Rp 500.000
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Contoh 4 */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                        <h4 className="font-black text-sm uppercase text-slate-700 tracking-widest">
                          D. Membayar Biaya Tagihan (Listrik / Gaji)
                        </h4>
                      </div>
                      <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                          <tr>
                            <td className="p-4 w-1/2">
                              Beban Listrik (Expense)
                            </td>
                            <td className="p-4 w-1/4 text-right text-emerald-600">
                              Rp 300.000
                            </td>
                            <td className="p-4 w-1/4 text-right text-rose-500">
                              -
                            </td>
                          </tr>
                          <tr>
                            <td className="p-4 text-right italic font-normal pr-8">
                              Kas Tunai
                            </td>
                            <td className="p-4 text-right text-emerald-600">
                              -
                            </td>
                            <td className="p-4 text-right text-rose-500">
                              Rp 300.000
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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

export default JurnalGuide;
