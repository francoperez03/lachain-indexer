import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div>
      <h2>Página No Encontrada</h2>
      <p>
        La página que buscas no existe. Regresa a la{' '}
        <Link to="/">página principal</Link>.
      </p>
    </div>
  );
};

export default NotFound;
