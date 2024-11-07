import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getContracts } from '../../services/contractService';
import { Contract } from '../../types/contract';
import ContractCard from '../../components/ContractCard/ContractCard';

const ContractsList: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const data = await getContracts();
        setContracts(data);
      } catch (err) {
        console.error(err)
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
    <div>
      <h2>Lista de Contratos</h2>
      <Link to="/contracts/add">Agregar Nuevo Contrato</Link>
      <div className="contracts-list">
        {contracts.map((contract) => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
      </div>
    </div>
  );
};

export default ContractsList;
