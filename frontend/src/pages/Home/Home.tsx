import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import echosmartLanding from '@/assets/images/echosmartLanding.webp';
import './Home.css';

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
      <div className="button-container">
      <Link to="/contracts">
        <Button className="custom-button primary-button">Ver contratos</Button>
      </Link>
      <Link to="/contracts/add">
        <Button className="custom-button secondary-button">Agregar Nuevo Contrato</Button>
      </Link>

      </div>
    </div>
  );
};

export default Home;
