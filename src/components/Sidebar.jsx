import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";

const Sidebar = ({
  activeMenu,
  setActiveMenu,
  onLogout,
  role,
  isOpen,
  setIsOpen,
}) => {
  const currentRole = (role || "guest").toLowerCase().trim();

  // State untuk Dropdown (Accordion) Menu (Default yang kebuka: OPERASIONAL)
  const [openGroup, setOpenGroup] = useState("OPERASIONAL");
  const [storeData, setStoreData] = useState({
    app_name: "ARULINV",
    app_subtitle: "MANAGEMENT SYSTEM",
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await axiosInstance.get("settings.php?action=get_store");
        const data = res.data;
        if (data.app_name) {
          setStoreData({
            app_name: data.app_name,
            app_subtitle: data.app_subtitle,
          });
        }
      } catch (error) {
        console.error("Gagal load branding", error);
      }
    };
    fetchBranding();
  }, []);

  // Logika Split Nama untuk Aksen Warna
  const nameParts = storeData.app_name.split(" ");
  const firstPart = nameParts[0];
  const restPart = nameParts.slice(1).join(" ");

  // Filter akses menu berdasarkan role
  const roleAccess = {
    developer: [
      "dashboard",
      "kalkulator-bisnis",
      "inventory",
      "pos",
      "monitoring",
      "orders",
      "laporan-penjualan",
      "price-list",
      "laporan",
      "barang",
      "channels",
      "master-store",
      "users",
      "hpp",
      "setup-keuangan",
      "jurnal-keuangan",
      "laporan-keuangan",
      "finance-dashboard", // Add to developer role
      "master-rekening",
      "kartu-mutasi",
      "deposit-reseller",
      "buku-kas-global",
      "utang-piutang",
      "settings",
    ],
    owner: [
      "dashboard",
      "kalkulator-bisnis",
      "inventory",
      "pos",
      "monitoring",
      "orders",
      "laporan-penjualan",
      "price-list",
      "laporan",
      "barang",
      "channels",
      "master-store",
      "users",
      "hpp",
      "setup-keuangan",
      "jurnal-keuangan",
      "laporan-keuangan",
      "finance-dashboard", // Add to owner role
      "master-rekening",
      "kartu-mutasi",
      "deposit-reseller",
      "buku-kas-global",
      "utang-piutang",
      "master-potongan-mp",
      "settings",
    ],
    admin: [
      "dashboard",
      "kalkulator-bisnis",
      "inventory",
      "pos",
      "monitoring",
      "orders",
      "laporan-penjualan",
    ],
    user: [
      "dashboard",
      "kalkulator-bisnis",
      "laporan-penjualan",
      "laporan-keuangan",
      "laporan",
    ],
    finance: [
      "dashboard",
      "kalkulator-bisnis",
      "master-rekening",
      "kartu-mutasi",
      "deposit-reseller",
      "buku-kas-global",
      "utang-piutang",
      "setup-keuangan",
      "jurnal-keuangan",
      "finance-dashboard", // Add to finance role
      "laporan-keuangan",
    ],
    guest: [
      "dashboard",
      "kalkulator-bisnis",
      "laporan-penjualan",
      "laporan-keuangan",
      "laporan",
    ],
  };

  const allowedMenus = roleAccess[currentRole] || roleAccess["guest"];

  const menuGroups = [
    {
      title: "OPERASIONAL",
      items: [
        { id: "laporan-penjualan", label: "LAPORAN PENJUALAN", icon: "📈" },
        { id: "pos", label: "KASIR", icon: "🛒" },
        { id: "orders", label: "ORDER MASUK", icon: "📥" },
        { id: "monitoring", label: "MONITORING", icon: "⏳" },
        { id: "inventory", label: "STOK", icon: "📦" },
      ],
    },
    {
      title: "FINANCE & ACCOUNTING",
      items: [
        { id: "finance-dashboard", label: "DASHBOARD FINANCE", icon: "📊" }, // New menu item
        { id: "master-rekening", label: "MASTER REKENING", icon: "💳" },
        { id: "kartu-mutasi", label: "KARTU MUTASI BANK", icon: "🏧" },
        { id: "deposit-reseller", label: "DEPOSIT RESELLER", icon: "📖" },
        { id: "buku-kas-global", label: "BUKU KAS GLOBAL", icon: "💰" }, // New menu item
        { id: "utang-piutang", label: "UTANG PIUTANG", icon: "⚖️" },
        { id: "setup-keuangan", label: "SETUP COA", icon: "🏛️" },
        { id: "jurnal-keuangan", label: "JURNAL UMUM", icon: "📒" },
        { id: "laporan-keuangan", label: "LAPORAN KEUANGAN", icon: "📈" },
      ],
    },
    {
      title: "SISTEM (V.I.P)",
      items: [
        { id: "barang", label: "MASTER BARANG", icon: "👕" },
        { id: "hpp", label: "KALKULASI HPP", icon: "🧾" },
        { id: "price-list", label: "DAFTAR HARGA", icon: "💰" },
        { id: "channels", label: "MASTER CHANNEL", icon: "🔗" },
        { id: "master-store", label: "MASTER STORE", icon: "🏢" },
        { id: "laporan", label: "LAPORAN", icon: "📑" },
        { id: "users", label: "MANAGEMENT USER", icon: "👥" },
        { id: "settings", label: "PENGATURAN TOKO", icon: "⚙️" },
      ],
    },
  ];

  return (
    <>
      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`print:hidden fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 z-50 lg:relative lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} shadow-2xl lg:shadow-none border-r border-white/5 dark:border-slate-800 transition-colors duration-300`}
      >
        {/* LOGO SECTION */}
        <div className="p-6 pb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-5 lg:hidden text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white dark:text-slate-100 break-words">
            {firstPart}
            {restPart && <span className="text-blue-500 ml-1">{restPart}</span>}
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 dark:text-slate-500 mt-1 whitespace-normal leading-tight">
            {storeData.app_subtitle}
          </p>
        </div>

        {/* NAV SECTION (SCROLLABLE TANPA SCROLLBAR) */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-6 mt-2">
          {/* MENU STANDALONE: DASHBOARD */}
          {allowedMenus.includes("dashboard") && (
            <div className="mb-4 mt-2">
              <button
                onClick={() => {
                  setActiveMenu("dashboard");
                  if (setIsOpen) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${
                  activeMenu === "dashboard"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/50 translate-x-1"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                } dark:hover:bg-slate-800/50`}
              >
                <span className="text-base">📊</span>
                DASHBOARD
              </button>
            </div>
          )}

          {/* MENU STANDALONE: KALKULATOR BISNIS */}
          {allowedMenus.includes("kalkulator-bisnis") && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setActiveMenu("kalkulator-bisnis");
                  if (setIsOpen) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${
                  activeMenu === "kalkulator-bisnis"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/50 translate-x-1"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                } dark:hover:bg-slate-800/50`}
              >
                <span className="text-base">🧮</span>
                KALKULATOR BISNIS
              </button>
            </div>
          )}

          {menuGroups.map((group, index) => {
            // Filter item yang boleh dilihat oleh role saat ini
            const visibleItems = group.items.filter((item) =>
              allowedMenus.includes(item.id),
            );

            // Jika dalam satu grup tidak ada menu yang boleh dilihat, sembunyikan judul grupnya
            if (visibleItems.length === 0) return null;

            return (
              <div key={index} className="mb-2">
                {/* TOMBOL DROPDOWN HEADER */}
                <button
                  onClick={() =>
                    setOpenGroup(openGroup === group.title ? "" : group.title)
                  }
                  className="w-full flex justify-between items-center px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span>{group.title}</span>
                  <span
                    className={`transform transition-transform duration-300 ${openGroup === group.title ? "rotate-180" : "rotate-0"}`}
                  >
                    ▼
                  </span>
                </button>

                {/* LIST MENU DALAM DROPDOWN */}
                <div
                  className={`space-y-1 overflow-hidden transition-all duration-300 ${openGroup === group.title ? "max-h-[600px] opacity-100 mt-2 mb-6" : "max-h-0 opacity-0"}`}
                >
                  {visibleItems.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveMenu(m.id);
                        if (setIsOpen) setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${
                        activeMenu === m.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/50 translate-x-1"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      } dark:hover:bg-slate-800/50`}
                    >
                      <span className="text-base">{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* FOOTER SECTION (LOGOUT SAJA) */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 dark:bg-slate-950/20 backdrop-blur-sm mt-auto transition-colors">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 p-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all group border border-rose-500/20"
          >
            <span>Logout</span>
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
