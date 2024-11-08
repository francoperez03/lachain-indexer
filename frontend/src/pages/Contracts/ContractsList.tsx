import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getContracts } from '../../services/contractService';
import { ContractItem } from '../../types/contract';
import ContractCard from '../../components/ContractCard/ContractCard';
import searchIcon from '../../assets/images/search-icon.webp';
import './ContractsList.css';

const ContractsList: React.FC = () => {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const data = await getContracts();
        setContracts(data);
      } catch (err) {
        console.error(err);
        setError('Error al obtener los contratos.');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  if (loading) return <p>Cargando contratos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="contracts-list-container">
      <h2 className="contracts-list-title">Lista de Contratos</h2>
      
      {/* Barra de búsqueda */}
      <div className="search-bar">
        <img src={searchIcon} alt="Buscar" className="search-icon" />
        <input
          type="text"
          placeholder="0xDe0A7....."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Link to="/contracts/add" className="add-contract-link">Agregar Nuevo Contrato</Link>
      
      <div className="contracts-list">
        {contracts.map((contract) => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
      </div>
    </div>
  );
};

export default ContractsList;
