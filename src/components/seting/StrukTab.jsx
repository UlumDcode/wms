import React from "react";

const StrukTab = ({
  storeConfig,
  setStoreConfig,
  isSaving,
  saveStoreConfig,
  handleResetTemplates,
  formatPreview,
}) => (
  <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b dark:border-slate-800 pb-4 gap-4">
      <div>
        <h3 className="font-black italic uppercase text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">
          Visual <span className="text-purple-600">Nota & Struk</span>
        </h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
          Sesuaikan pesan otomatis yang dikirim via WhatsApp
        </p>
      </div>
      <button
        onClick={handleResetTemplates}
        className="text-[9px] font-black bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all shadow-sm"
      >
        🔄 Salin Template Default
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* KOLOM KIRI: NOTA TRANSAKSI UTAMA */}
      <div className="space-y-6">
        <SectionHeader
          title="Nota Transaksi Utama"
          icon="🛍️"
          color="text-blue-600 dark:text-blue-400"
        />

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
          <TemplateEditor
            label="Nota Penjualan (POS)"
            value={storeConfig.template_pos}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_pos: v })
            }
            preview={formatPreview(storeConfig.template_pos)}
            previewClass="bg-[#DCF8C6] border-[#B7D9A0] dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300"
            previewLabel="WhatsApp POS"
          />

          <TemplateEditor
            label="Nota Inbound (Supplier)"
            value={storeConfig.template_inbound}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_inbound: v })
            }
            preview={formatPreview(storeConfig.template_inbound)}
            previewClass="bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-300"
            previewLabel="WhatsApp Supplier"
          />

          <TemplateEditor
            label="Pelunasan Piutang"
            value={storeConfig.template_pelunasan_piutang}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_pelunasan_piutang: v })
            }
            preview={formatPreview(storeConfig.template_pelunasan_piutang)}
            previewClass="bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300"
            previewLabel="WhatsApp Piutang"
          />

          <TemplateEditor
            label="Pelunasan Hutang"
            value={storeConfig.template_pelunasan_hutang}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_pelunasan_hutang: v })
            }
            preview={formatPreview(storeConfig.template_pelunasan_hutang)}
            previewClass="bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300"
            previewLabel="WhatsApp Hutang"
          />

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">
              Pesan Struk (Footer)
            </label>
            <input
              type="text"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-purple-500 dark:focus:border-purple-500 shadow-sm text-slate-900 dark:text-slate-100"
              value={storeConfig.pesan_struk || ""}
              onChange={(e) =>
                setStoreConfig({ ...storeConfig, pesan_struk: e.target.value })
              }
            />
          </div>
        </div>

        <SectionHeader
          title="Daftar Variabel (Tags)"
          icon="💡"
          color="text-amber-600 dark:text-amber-400"
        />
        <div className="bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 grid grid-cols-2 gap-2">
          <TagHelp tag="{{nama_toko}}" desc="Nama Toko" />
          <TagHelp tag="{{tanggal}}" desc="Tgl Transaksi" />
          <TagHelp tag="{{no_trx}}" desc="No. Invoice/PO" />
          <TagHelp tag="{{customer}}" desc="Nama Pembeli" />
          <TagHelp tag="{{supplier}}" desc="Nama Supplier" />
          <TagHelp tag="{{pihak}}" desc="Pihak/Target" />
          <TagHelp tag="{{items}}" desc="Daftar Barang" />
          <TagHelp tag="{{size}}" desc="Size Barang" />
          <TagHelp tag="{{total}}" desc="Total Rp" />
          <TagHelp tag="{{terbayar}}" desc="Jml Dibayar" />
          <TagHelp tag="{{sisa}}" desc="Sisa Tagihan" />
          <TagHelp tag="{{metode}}" desc="Metode Bayar" />
          <TagHelp tag="{{no_resi}}" desc="Nomor Resi" />
          <TagHelp tag="{{status}}" desc="Status Trx" />
          <TagHelp tag="{{kompensasi}}" desc="Opsi Ganti Rugi" />
          <TagHelp tag="{{alasan}}" desc="Alasan Reject" />
          <TagHelp tag="{{total_penjualan}}" desc="Total Omzet Hari Ini" />
          <TagHelp tag="{{jumlah_transaksi}}" desc="Jumlah Order" />
          <TagHelp tag="{{sisa_piutang}}" desc="Sisa Piutang" />
          <TagHelp tag="{{sisa_hutang}}" desc="Sisa Hutang" />
          <TagHelp tag="{{nama_user}}" desc="Nama Karyawan" />
          <TagHelp tag="{{gaji_pokok}}" desc="Gaji Utama" />
          <TagHelp tag="{{bonus}}" desc="Lembur/Bonus" />
          <TagHelp tag="{{total_diterima}}" desc="Total Transfer" />
          <TagHelp tag="{{model}}" desc="Model Produksi" />
          <TagHelp tag="{{qty}}" desc="Qty Produksi" />
          <TagHelp tag="{{hpp_pcs}}" desc="HPP per Pcs" />
          <TagHelp tag="{{detail_supplier}}" desc="Detail Biaya & DP Supplier" />
          <TagHelp tag="{{channel}}" desc="Channel Order" />
        </div>
      </div>

      {/* KOLOM KANAN: NOTIFIKASI SISTEM & LOGISTIK */}
      <div className="space-y-6">
        <SectionHeader
          title="Notifikasi Internal & Stok"
          icon="🔔"
          color="text-emerald-600 dark:text-emerald-400"
        />
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
          <TemplateEditor
            label="Notifikasi Inbound Staff"
            value={storeConfig.template_notif_internal}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_notif_internal: v })
            }
            preview={formatPreview(storeConfig.template_notif_internal)}
            previewClass="bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300"
            previewLabel="Notif Internal"
          />
          <TemplateEditor
            label="Laporan HPP (Owner)"
            value={storeConfig.template_notif_hpp}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_notif_hpp: v })
            }
            preview={formatPreview(storeConfig.template_notif_hpp)}
            previewClass="bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-300"
            previewLabel="Notif HPP"
          />
          <TemplateEditor
            label="Laporan POS (Owner)"
            value={storeConfig.template_notif_penjualan_owner}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_notif_penjualan_owner: v })
            }
            preview={formatPreview(storeConfig.template_notif_penjualan_owner)}
            previewClass="bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-300"
            previewLabel="Notif Penjualan Owner"
          />
          <TemplateEditor
            label="Laporan Reject (Non-MP)"
            value={storeConfig.template_notif_reject}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_notif_reject: v })
            }
            preview={formatPreview(storeConfig.template_notif_reject)}
            previewClass="bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300"
            previewLabel="Notif Reject"
          />
          <TemplateEditor
            label="Peringatan Stok Kritis"
            value={storeConfig.template_stok_kritis}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_stok_kritis: v })
            }
            preview={formatPreview(storeConfig.template_stok_kritis)}
            previewClass="bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/50 dark:text-orange-300"
            previewLabel="Notif Stok"
          />
          <TemplateEditor
            label="Slip Gaji Digital"
            value={storeConfig.template_gaji}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_gaji: v })
            }
            preview={formatPreview(storeConfig.template_gaji)}
            previewClass="bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300"
            previewLabel="WhatsApp Gaji"
          />
          <TemplateEditor
            label="Rekap Penjualan Harian"
            value={storeConfig.template_rekap_harian}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_rekap_harian: v })
            }
            preview={formatPreview(storeConfig.template_rekap_harian)}
            previewClass="bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-300"
            previewLabel="Rekap Harian"
          />
        </div>

        <SectionHeader
          title="Marketplace & Logistik"
          icon="🚛"
          color="text-purple-600 dark:text-purple-400"
        />
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
          <TemplateEditor
            label="Bulk Settlement MP"
            value={storeConfig.template_bulk_settle}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_bulk_settle: v })
            }
            preview={formatPreview(storeConfig.template_bulk_settle)}
            previewClass="bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/50 dark:text-purple-300"
            previewLabel="Notif Settlement"
          />
          <TemplateEditor
            label="Update Status Outbound"
            value={storeConfig.template_status_update}
            onChange={(v) =>
              setStoreConfig({ ...storeConfig, template_status_update: v })
            }
            preview={formatPreview(storeConfig.template_status_update)}
            previewClass="bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300"
            previewLabel="Update Logistik"
          />
        </div>
      </div>
    </div>

    <div className="pt-4 border-t dark:border-slate-800">
      <button
        onClick={saveStoreConfig}
        disabled={isSaving}
        className="w-full md:w-auto bg-slate-900 dark:bg-purple-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-purple-600 dark:hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-50"
      >
        {isSaving ? "⌛ MENYIMPAN..." : "💾 SIMPAN SEMUA TEMPLATE"}
      </button>
    </div>
  </div>
);

const SectionHeader = ({ title, icon, color }) => (
  <div className="flex items-center gap-2 ml-1">
    <span className="text-sm">{icon}</span>
    <h4 className={`text-[10px] font-black uppercase tracking-widest ${color}`}>
      {title}
    </h4>
  </div>
);

const TagHelp = ({ tag, desc }) => (
  <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
    <code className="text-[9px] font-black text-purple-600 dark:text-purple-400">
      {tag}
    </code>
    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">
      {desc}
    </span>
  </div>
);

const TemplateEditor = ({
  label,
  value,
  onChange,
  preview,
  previewClass,
  previewLabel,
}) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 ml-1">
      {label}
    </label>
    <textarea
      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-mono text-[10px] h-28 resize-none outline-none focus:border-purple-500 dark:focus:border-purple-500 shadow-sm text-slate-900 dark:text-slate-100"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
    <div
      className={`p-3 rounded-xl border relative shadow-inner min-h-[80px] ${previewClass}`}
    >
      <span className="absolute top-1 right-2 text-[7px] font-black opacity-30 uppercase tracking-widest italic text-slate-500 dark:text-slate-400">
        Preview {previewLabel}
      </span>
      <div className="text-[10px] whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200 leading-snug">
        {preview}
      </div>
    </div>
  </div>
);

export default StrukTab;
