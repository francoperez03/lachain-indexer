import React from 'react';
import './loader.css';

const Loader: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <img
    src="../../assets/images/search-icon.webp"
    alt="."
    className={`loader-icon ${className}`}
    style={{
      width: size,
      height: size,
    }}
  />
);

export default Loader;
