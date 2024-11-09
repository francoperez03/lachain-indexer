import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ContractCard.css';
import { ContractItem } from '../../types/contract';

interface ContractCardProps {
  contract: ContractItem;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract }) => {
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  useEffect(() => {
    const loadIcon = async () => {
      try {
        const icon = await import(`../../assets/images/${contract.address}_icon.webp`);
        setIconSrc(icon.default);
      } catch (error) {
        console.warn(`Icono no encontrado para ${contract.address}, usando icono por defecto. Error:`,{error});
        const defaultIcon = await import('../../assets/images/default_icon.webp');
        setIconSrc(defaultIcon.default);
      }
    };

    loadIcon();
  }, [contract.address]);
  return (
    <div className="contract-card">
      <div className="contract-card-icon">
        {iconSrc && <img src={iconSrc} alt={`${contract.name} Icon`} className="contract-icon" />}
      </div>
      <h3 className="contract-card-name">{contract.name}</h3>
      <p className="contract-card-address">
        {`${contract.address.slice(0, 5)}...${contract.address.slice(-3)}`}
      </p>
      
      <div className="contract-card-stats">
        <p className="contract-card-stat">
          <span>eventos</span> {contract.eventLogsCount}
        </p>
        <p className="contract-card-stat">
          <span>transacciones</span> {contract.transactionsCount}
        </p>
      </div>
      <Link to={`/contracts/${contract.address}/abi-events`} className="contract-card-details">
        Ver Detalles
      </Link>
    </div>
  );
};

export default ContractCard;
