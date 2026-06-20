import React from "react";

const Navbar = ({
  activeMenu,
  userData,
  onOpenSidebar,
  isDarkMode,
  setIsDarkMode,
}) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Warna badge berdasarkan role
  const getRoleColor = (role) => {
    switch (role) {
      case "Developer":
        return "bg-rose-500 text-white";
      case "Owner":
        return "bg-purple-600 text-white";
      case "Admin":
        return "bg-blue-600 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  return (
    <nav className="print:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 flex items-center justify-between z-10 sticky top-0 shadow-sm shadow-slate-50 dark:shadow-none transition-colors duration-300">
      {/* Kiri: Judul Menu Aktif & Tombol Mobile */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden flex items-center justify-center bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 md:w-6 md:h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter italic leading-none">
            {activeMenu.replace(/([A-Z])/g, " $1").trim()}
          </h2>
          <p className="text-[9px] text-blue-600 font-black tracking-[0.2em] uppercase mt-1 opacity-80">
            Active Workspace
          </p>
        </div>
      </div>

      {/* Kanan: Profil & Role */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* === TOMBOL TOGGLE DARK MODE === */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 group"
          title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        >
          {isDarkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-slate-600 group-hover:-rotate-12 transition-transform"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          )}
        </button>

        <div className="text-right hidden sm:block">
          <p className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
            {userData?.nama || "Unknown User"}
          </p>
          {/* Badge Role */}
          <span
            className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${getRoleColor(userData?.role)}`}
          >
            {userData?.role || "Guest"}
          </span>
        </div>

        {/* Avatar Bulat */}
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white font-black text-[10px] md:text-xs shadow-lg dark:shadow-none transition-colors">
          {getInitials(userData?.nama)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
