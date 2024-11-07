import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">LOGO</Link>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/contracts">Contratos</Link>
          </li>
          <li>
            <Link to="/contracts/add">Agregar Contrato</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
