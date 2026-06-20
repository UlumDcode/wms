import React from "react";

const FotoBarang = ({
  foto,
  apiUrl,
  containerClass,
  iconClass,
  imgClass = "absolute inset-0 w-full h-full object-cover",
  onClick,
}) => {
  return (
    <div 
      className={`${containerClass} ${onClick ? "cursor-zoom-in" : ""}`}
      onClick={onClick}
    >
      <span className={iconClass}>📦</span>
      {foto && (
        <img
          src={`${apiUrl}/uploads/${foto}`}
          className={imgClass}
          onError={(e) => (e.target.style.display = "none")}
          alt=""
        />
      )}
    </div>
  );
};

export default FotoBarang;
