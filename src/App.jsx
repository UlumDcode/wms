import { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./store/slices/authSlice";
import { fetchGlobalData } from "./store/slices/dataSlice";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import axiosInstance from "./utils/axios";

// Views Utama
import Dashboard from "./views/Dashboard";
import Login from "./views/Login";
import Settings from "./views/Settings";
// Views Operasional
import Pos from "./views/operasional/Pos";
import Inventory from "./views/operasional/Inventory";
import Monitoring from "./views/operasional/Monitoring";
import Orders from "./views/operasional/Orders";
import LaporanPenjualan from "./views/operasional/LaporanPenjualan";

// Views Produksi
import Laporan from "./views/produksi/Laporan";
import Barang from "./views/produksi/Barang";
import MasterChannel from "./views/produksi/MasterChannel";
import MasterStore from "./views/produksi/MasterStore";
import PriceList from "./views/produksi/PriceList";
import KalkulasiHpp from "./views/produksi/KalkulasiHpp";
import UserManagement from "./views/produksi/UserManagement";
import KalkulatorBisnis from "./views/KalkulatorBisnis";

// Views Finance
import MasterRekening from "./views/finance/MasterRekening";
import DepositReseller from "./views/finance/DepositReseller";
import UtangPiutang from "./views/finance/UtangPiutang";
import KartuMutasiBank from "./views/finance/KartuMutasiBank";
import BukuKasGlobal from "./views/finance/BukuKasGlobal";
import SetupCOA from "./views/finance/SetupCOA";
import JurnalUmum from "./views/finance/JurnalUmum";
import LaporanKeuangan from "./views/finance/LaporanKeuangan";
import DashboardFinance from "./views/finance/DashboardFinance";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated: isLoggedIn, user } = useSelector(
    (state) => state.auth,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // === LOGIKA DARK MODE (DEVICE BASED) ===
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Data States from Redux
  const { items, channels, stores, store, loading } = useSelector(
    (state) => state.data,
  );

  // States for Custom Notifications
  const [toast, setToast] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const SYNC_HOST = import.meta.env.VITE_SYNC_URL;

  // Fungsi sinkronisasi data global via Redux Thunk
  const refreshAllData = useCallback(() => {
    dispatch(fetchGlobalData());
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn) {
      refreshAllData();

      // Global Ping Sync Service (Keep-Alive Worker)
      // Menembak langsung ke sync.zulkan.id secara diam-diam (blind ping)
      // tanpa harus melewati PHP API, menghemat 100% koneksi database backend.
      const awakenSyncService = () => {
        try {
          fetch(SYNC_HOST, {
            method: "GET",
            mode: "cors",
          }).catch(() => {}); // Abaikan error CORS/Network, yang penting request terkirim
        } catch (e) {}
      };

      awakenSyncService();
      const globalAwakenInterval = setInterval(() => {
        if (!document.hidden) {
          awakenSyncService();
        }
      }, 600000); // 600 detik = 10 menit

      // Cleanup diletakkan di akhir useEffect
      window.__globalAwakenInterval = globalAwakenInterval;
    }

    // Mendaftarkan Fungsi Global Notifikasi
    window.showToast = (message, type = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    };

    window.showConfirm = (message) => {
      return new Promise((resolve) => {
        setConfirmDialog({
          message,
          onConfirm: () => {
            setConfirmDialog(null);
            resolve(true);
          },
          onCancel: () => {
            setConfirmDialog(null);
            resolve(false);
          },
        });
      });
    };

    return () => {
      if (window.__globalAwakenInterval) {
        clearInterval(window.__globalAwakenInterval);
      }
    };
  }, [isLoggedIn, refreshAllData, API_URL]);

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <Login
              onLoginSuccess={() => {
                refreshAllData();
                navigate("/dashboard");
              }}
            />
          }
        />
      </Routes>
    );
  }

  // BRIDGE UNTUK MENJAGA KOMPATIBILITAS SIDEBAR LAMA TANPA HARUS REFACTOR SIDEBAR
  const handleNavigation = (menuKey) => {
    switch (menuKey) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "inventory":
        navigate("/operasional/inventory");
        break;
      case "pos":
        navigate("/operasional/pos");
        break;
      case "monitoring":
        navigate("/operasional/monitoring");
        break;
      case "orders":
        navigate("/operasional/orders");
        break;
      case "laporan-penjualan":
        navigate("/operasional/laporan-penjualan");
        break;
      case "laporan":
        navigate("/operasional/laporan");
        break;
      case "barang":
        navigate("/produksi/barang");
        break;
      case "channels":
        navigate("/produksi/channel");
        break;
      case "master-store":
        navigate("/produksi/store");
        break;
      case "price-list":
        navigate("/produksi/pricelist");
        break;
      case "hpp":
        navigate("/produksi/hpp");
        break;
      case "users":
        navigate("/produksi/users");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "kalkulator-bisnis":
        navigate("/kalkulator-bisnis");
        break;
      case "master-rekening":
        navigate("/finance/rekening");
        break;
      case "kartu-mutasi":
        navigate("/finance/kartu-mutasi");
        break;
      case "deposit-reseller":
        navigate("/finance/deposit-reseller");
        break;
      case "finance-dashboard": // Add navigation for Dashboard Finance
        navigate("/finance/dashboard");
        break;
      case "buku-kas-global": // Add navigation for Buku Kas Global
        navigate("/finance/buku-kas-global");
        break;
      case "utang-piutang":
        navigate("/finance/utang-piutang");
        break;
      case "setup-keuangan":
        navigate("/finance/coa");
        break;
      case "jurnal-keuangan":
        navigate("/finance/jurnal");
        break;
      case "laporan-keuangan":
        navigate("/finance/laporan");
        break;
      default:
        navigate("/dashboard");
    }
  };

  let activeMenu = "dashboard";
  if (location.pathname.includes("/inventory")) activeMenu = "inventory";
  else if (location.pathname.includes("/pos")) activeMenu = "pos";
  else if (location.pathname.includes("/monitoring")) activeMenu = "monitoring";
  else if (location.pathname.includes("/operasional/orders"))
    activeMenu = "orders";
  else if (location.pathname.includes("/laporan-penjualan"))
    activeMenu = "laporan-penjualan";
  else if (location.pathname.includes("/laporan")) activeMenu = "laporan";
  else if (location.pathname.includes("/barang")) activeMenu = "barang";
  else if (location.pathname.includes("/channel")) activeMenu = "channels";
  else if (location.pathname.includes("/store")) activeMenu = "master-store";
  else if (location.pathname.includes("/pricelist")) activeMenu = "price-list";
  else if (location.pathname.includes("/hpp")) activeMenu = "hpp";
  else if (location.pathname.includes("/users")) activeMenu = "users";
  else if (location.pathname.includes("/settings")) activeMenu = "settings";
  else if (location.pathname.includes("/kalkulator-bisnis"))
    activeMenu = "kalkulator-bisnis";
  else if (location.pathname.includes("/finance/rekening"))
    activeMenu = "master-rekening";
  else if (location.pathname.includes("/finance/kartu-mutasi"))
    activeMenu = "kartu-mutasi";
  else if (location.pathname.includes("/finance/deposit-reseller"))
    activeMenu = "deposit-reseller";
  else if (location.pathname.includes("/finance/dashboard"))
    activeMenu = "finance-dashboard"; // Add active menu logic for Dashboard Finance
  else if (location.pathname.includes("/finance/buku-kas-global"))
    activeMenu = "buku-kas-global"; // Add active menu logic
  else if (location.pathname.includes("/finance/utang-piutang"))
    activeMenu = "utang-piutang";
  else if (location.pathname.includes("/finance/coa"))
    activeMenu = "setup-keuangan";
  else if (location.pathname.includes("/finance/jurnal"))
    activeMenu = "jurnal-keuangan";
  else if (location.pathname.includes("/finance/laporan"))
    activeMenu = "laporan-keuangan";

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex flex-col justify-center items-center h-full gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Syncing Store Data...
          </p>
        </div>
      );

    // Filter item yang sudah punya HPP (harga_beli / Modal > 0)
    const operationalItems = items.filter(
      (i) => parseFloat(i.harga_beli || 0) > 0,
    );

    return (
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              items={operationalItems}
              channels={channels}
              stores={stores}
              setActiveMenu={handleNavigation}
            />
          }
        />
        <Route path="/kalkulator-bisnis" element={<KalkulatorBisnis />} />
        {/* Operasional */}
        <Route
          path="/operasional/pos"
          element={
            <Pos
              items={operationalItems}
              stores={stores}
              refreshData={refreshAllData}
            />
          }
        />
        <Route
          path="/operasional/inventory"
          element={
            <Inventory items={operationalItems} refreshData={refreshAllData} />
          }
        />
        <Route path="/operasional/monitoring" element={<Monitoring />} />
        <Route path="/operasional/orders" element={<Orders />} />
        <Route
          path="/operasional/laporan-penjualan"
          element={<LaporanPenjualan />}
        />
        <Route path="/operasional/laporan" element={<Laporan />} />
        {/* Produksi */}
        <Route
          path="/produksi/barang"
          element={<Barang items={items} refreshData={refreshAllData} />}
        />
        <Route
          path="/produksi/channel"
          element={
            <MasterChannel channels={channels} refreshData={refreshAllData} />
          }
        />
        <Route
          path="/produksi/store"
          element={
            <MasterStore
              stores={stores}
              channels={channels}
              refreshData={refreshAllData}
            />
          }
        />
        <Route
          path="/produksi/pricelist"
          element={
            <PriceList
              items={items}
              channels={channels}
              refreshData={refreshAllData}
            />
          }
        />
        <Route
          path="/produksi/hpp"
          element={<KalkulasiHpp items={items} refreshData={refreshAllData} />}
        />
        <Route
          path="/produksi/users"
          element={<UserManagement currentUser={user} />}
        />
        <Route path="/settings" element={<Settings />} />
        {/* Finance */}
        <Route path="/finance/rekening" element={<MasterRekening />} />
        <Route path="/finance/kartu-mutasi" element={<KartuMutasiBank />} />
        <Route path="/finance/deposit-reseller" element={<DepositReseller />} />
        <Route
          path="/finance/buku-kas-global"
          element={<BukuKasGlobal />}
        />{" "}
        {/* Add new route */}
        <Route path="/finance/dashboard" element={<DashboardFinance />} />{" "}
        {/* Add new route for Dashboard Finance */}
        <Route path="/finance/utang-piutang" element={<UtangPiutang />} />
        <Route path="/finance/coa" element={<SetupCOA />} />
        <Route path="/finance/jurnal" element={<JurnalUmum />} />
        <Route path="/finance/laporan" element={<LaporanKeuangan />} />
        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={handleNavigation}
        onLogout={() => {
          dispatch(logout());
        }}
        role={user?.role}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative w-full lg:w-auto">
        <Navbar
          activeMenu={activeMenu}
          userData={user}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        <main className="flex-1 overflow-y-auto pt-1 px-1 md:pt-2 md:px-2 pb-0 md:pb-0">
          {renderContent()}
        </main>

        {/* ================= CUSTOM TOAST NOTIFICATION ================= */}
        {toast && (
          <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300 ${
              toast.type === "error"
                ? "bg-rose-500 text-white"
                : toast.type === "warning"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-900 text-white border-2 border-emerald-500"
            }`}
          >
            <span className="text-xl leading-none">
              {toast.type === "error"
                ? "❌"
                : toast.type === "warning"
                  ? "⚠️"
                  : "✅"}
            </span>
            <span className="font-bold text-xs tracking-wide uppercase whitespace-nowrap">
              {toast.message}
            </span>
          </div>
        )}

        {/* ================= CUSTOM CONFIRM DIALOG ================= */}
        {confirmDialog && (
          <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200 text-center border-4 border-slate-50 dark:border-slate-800">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto shadow-inner">
                🤔
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 italic uppercase">
                Konfirmasi
              </h3>
              <p className="text-xs font-bold text-slate-500 mb-8 px-4 leading-relaxed">
                {confirmDialog.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDialog.onCancel}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 bg-slate-900 hover:bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
