import React from 'react';
import { Contract } from '../../types/contract';

interface ContractHeaderProps {
  contract: Contract;
  onDelete: () => void;
}

const ContractHeader: React.FC<ContractHeaderProps> = ({ contract, onDelete }) => {
  return (
    <div>
      <h2>Detalle del Contrato</h2>
      <p><strong>Nombre:</strong> {contract.name}</p>
      <p><strong>Dirección:</strong> {contract.address}</p>
      <button onClick={onDelete} style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px' }}>
        Eliminar Contrato
      </button>
    </div>
  );
};

export default ContractHeader;
