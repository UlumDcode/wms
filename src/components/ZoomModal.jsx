import React from "react";

const ZoomModal = ({ zoomedImage, setZoomedImage }) => {
  if (!zoomedImage) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-300 cursor-zoom-out"
      onClick={() => setZoomedImage(null)}
    >
      <div
        className="relative flex items-center justify-center max-w-[95vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setZoomedImage(null)}
          className="absolute -top-12 right-0 text-white text-4xl hover:text-rose-500 transition-colors"
        >
          ✕
        </button>
        {zoomedImage === "no-image" ? (
          <div className="w-64 h-64 md:w-96 md:h-96 bg-slate-100 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white/10">
            <span className="text-8xl md:text-9xl opacity-30">📦</span>
          </div>
        ) : (
          <img
            src={zoomedImage}
            alt="Preview Zoom"
            className="rounded-2xl shadow-2xl max-w-full max-h-[90vh] object-contain border-4 border-white/10"
          />
        )}
      </div>
    </div>
  );
};

export default ZoomModal;
