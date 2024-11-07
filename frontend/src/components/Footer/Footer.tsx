import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} Blockchain Dashboard. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;
