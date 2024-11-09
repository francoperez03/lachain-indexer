import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContractByAddress, deleteContractByAddress, startIndexing } from '../../services/contractService';
import { Contract, ContractProcess } from '../../types/contract';
import ContractTabs from './ContractTabs';
import ContractHeader from '../../components/ContractHeader/ContractHeader';
import IndexingControl from '../../components/IndexingControl/IndexingControl';

const ContractDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContract = async () => {
      try {
        if (address) {
          const data = await getContractByAddress(address);
          setContract(data);
        }
      } catch (err) {
        console.error(err);
        setError('Error al obtener los detalles del contrato.');
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [address]);

  const handleDelete = async () => {
    if (address) {
      await deleteContractByAddress(address);
      navigate('/contracts');
    }
  };

  if (loading) return <p>Cargando detalles del contrato...</p>;
  if (error || !contract) return <p>{error || 'Contrato no encontrado.'}</p>;

  const latestProcess: ContractProcess | undefined = contract.processes?.[contract.processes.length - 1];

  return (
    <div>
      <ContractHeader contract={contract} onDelete={handleDelete} />
      <IndexingControl contract={contract} latestProcess={latestProcess} onStartIndexing={startIndexing} onDelete={handleDelete} />
      <ContractTabs contract={contract} />
    </div>
  );
};

export default ContractDetail;
