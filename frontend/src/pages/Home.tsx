import React from 'react';
import { Link } from 'react-router-dom';
import echosmartLanding from '@/assets/images/echosmartLanding.webp';

const Home: React.FC = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${echosmartLanding})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
      }}
    >
      <nav>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          <li style={{ margin: '1rem 0' }}>
            <Link to="/contracts">Ver Contratos</Link>
          </li>
          <li style={{ margin: '1rem 0' }}>
            <Link to="/contracts/add">Agregar Nuevo Contrato</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
