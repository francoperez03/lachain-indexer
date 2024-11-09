import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github } from 'lucide-react';
import logo from '@/assets/images/logo.webp';
import './Header.css';

export default function Header() {
  const location = useLocation();

  return (
    <header className="app-header">
      <nav className="header-container">
        {/* Logo en la izquierda */}
        <Link to="/" className="logo">
          <img src={logo} alt="EchoSmart Logo" className="logo-image" />
        </Link>
        
        {/* Links de navegación en el centro */}
        <div className="nav-links">
        <a
          href="https://github.com/francoperez03/lachain-indexer"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          <Github className="icon" />
        </a>
          <Link
            to="/contracts"
            className={`nav-link ${location.pathname === '/contracts' ? 'active' : ''}`}
          >
            <span>CONTRATOS</span>
          </Link>
          
          <Link
            to="/contracts/add"
            className={`nav-link ${location.pathname === '/contracts/add' ? 'active' : ''}`}
          >
            <span>AGREGAR</span>
          </Link>
        </div>

        {/* Icono de GitHub a la derecha */}

      </nav>
    </header>
  );
}
