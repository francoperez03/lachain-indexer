import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Bienvenido al Dashboard de Contratos Blockchain</h1>
      <p>Monitorea y gestiona tus contratos inteligentes de forma sencilla.</p>
      <nav>
        <ul>
          <li>
            <Link to="/contracts">Ver Contratos</Link>
          </li>
          <li>
            <Link to="/contracts/add">Agregar Nuevo Contrato</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
