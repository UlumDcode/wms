import { useState, useRef, useEffect } from "react";

const CoaSearchSelect = ({ value, onChange, options, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Cari item yang terpilih berdasarkan value
  const selectedItem = options.find((opt) => opt.id.toString() === value?.toString());

  // Set nilai search awal dari item yang terpilih
  useEffect(() => {
    if (selectedItem && !isOpen) {
      setSearchTerm(`${selectedItem.kode_akun} - ${selectedItem.nama_akun}`);
    } else if (!selectedItem && !isOpen) {
      setSearchTerm("");
    }
  }, [selectedItem, value, isOpen]);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Proteksi: Jika klik di luar dan searchTerm tidak sama dengan selectedItem, kembalikan ke selectedItem
        if (selectedItem) {
          setSearchTerm(`${selectedItem.kode_akun} - ${selectedItem.nama_akun}`);
        } else {
          setSearchTerm("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, [selectedItem]);

  const filteredOptions = options.filter(
    (opt) =>
      opt.kode_akun.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.nama_akun.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm focus:border-blue-500 shadow-sm outline-none text-slate-700"
        placeholder="-- Cari Akun --"
        value={searchTerm}
        required={required && !value}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          // Jika user mengetik (mengubah teks), hapus value sementara agar tidak submit form dengan nilai yang salah
          if (value) {
            onChange(""); 
          }
        }}
        onFocus={() => setIsOpen(true)}
      />
      {/* Icon dropdown kecil di kanan */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
        ▼
      </div>

      {isOpen && (
        <ul className="absolute z-[70] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-52 overflow-y-auto custom-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt.id}
                className={`py-2 px-3 hover:bg-blue-50 cursor-pointer text-xs font-bold transition-colors ${
                  value?.toString() === opt.id.toString() 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-700 hover:text-blue-600"
                }`}
                onMouseDown={(e) => {
                  // Gunakan onMouseDown bukan onClick agar event tembak lebih dulu dari onBlur
                  e.preventDefault(); 
                  onChange(opt.id);
                  setSearchTerm(`${opt.kode_akun} - ${opt.nama_akun}`);
                  setIsOpen(false);
                }}
              >
                {opt.kode_akun} - {opt.nama_akun}
              </li>
            ))
          ) : (
            <li className="py-2 px-3 text-xs text-slate-400 italic">
              Akun tidak ditemukan
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CoaSearchSelect;
