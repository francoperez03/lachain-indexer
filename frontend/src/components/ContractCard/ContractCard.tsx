import React from 'react';
import { Link } from 'react-router-dom';
import './ContractCard.css'; // Opcional: si estás usando CSS Modules o similar
import { Contract } from '../../types/contract';

interface ContractCardProps {
  contract: Contract;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract }) => {
  return (
    <div className="contract-card">
      <h3>{contract.name}</h3>
      <p>
        <strong>Dirección:</strong> {contract.address}
      </p>
      <p>
        <strong>Creado en:</strong> {new Date(contract.createdAt).toLocaleString()}
      </p>
      <Link to={`/contracts/${contract.address}`}>Ver Detalles</Link>
    </div>
  );
};

export default ContractCard;
