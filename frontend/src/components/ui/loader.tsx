import React from 'react';
import './Loader.css';

const Loader: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <img
    src="../../src/assets/images/search-icon.webp"
    alt="Loading..."
    className={`loader-icon ${className}`}
    style={{
      width: size,
      height: size,
    }}
  />
);

export default Loader;