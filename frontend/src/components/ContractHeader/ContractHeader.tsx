import React, { useEffect, useState } from 'react';
import { Contract } from '../../types/contract';
import './ContractHeader.css';

interface ContractHeaderProps {
  contract: Contract;
  onDelete: () => void;
}


const ContractHeader: React.FC<ContractHeaderProps> = ({ contract }) => {

  const [iconSrc, setIconSrc] = useState<string | null>(null);
  useEffect(() => {
    const loadIcon = async () => {
      try {
        const icon = await import(`../../assets/images/${contract.address}_detail.webp`);
        setIconSrc(icon.default);
      } catch (error) {
        console.warn(`Icono no encontrado para ${contract.address}, usando icono por defecto. Error:`,{error});
        const defaultIcon = await import('../../assets/images/default_detail.webp');
        setIconSrc(defaultIcon.default);
      }
    };

    loadIcon();
  }, [contract.address]);
  
  return (
    <div className="contract-header">
      <div className="contract-icon">
        {iconSrc && <img src={iconSrc} alt={`${contract.name} Icon`} className="contract-icon" />}
      </div>
      <div>
        <h2 className="contract-header-text">{contract.name}</h2>
        <p className="contract-address">{contract.address}</p>
      </div>

    </div>
  );
};

export default ContractHeader;
