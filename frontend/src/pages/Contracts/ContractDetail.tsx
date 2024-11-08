import { Contract, ContractProcess, ProcessStatus } from '../../types/contract';
import { getContractByAddress, deleteContractByAddress, startIndexing } from '../../services/contractService';
import { useParams, Link, useNavigate, Routes, Route } from 'react-router-dom';
import AbiAndEventsTab from './AbiAndEventsTab';
import EventLogsTab from './EventLogsTab';
import GraphQLTab from './GraphQLTab';
import React, { useEffect, useState } from 'react';
import TransactionsTab from './TransactionTab';


const ContractDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [indexingError, setIndexingError] = useState<string | null>(null);
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
    try {
      if (address) {
        await deleteContractByAddress(address);
        navigate('/contracts');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      setDeleteError('Failed to delete contract. Please try again later.');
    }
  };

  const handleStartIndexing = async () => {
    try {
      if (address) {
        await startIndexing(address);
        setIndexingError(null);
        // Refrescar el contrato para ver el nuevo estado
        const updatedContract = await getContractByAddress(address);
        setContract(updatedContract);
      }
    } catch (error) {
      console.error('Error starting indexing:', error);
      setIndexingError('Failed to start indexing. Please try again later.');
    }
  };

  if (loading) return <p>Cargando detalles del contrato...</p>;
  if (error) return <p>{error}</p>;
  if (!contract) return <p>Contrato no encontrado.</p>;

  const latestProcess: ContractProcess | undefined = contract.processes?.[contract.processes.length - 1];

  return (
    <div>
      <h2>Detalle del Contrato</h2>
      <p>
        <strong>Nombre:</strong> {contract.name}
      </p>
      <p>
        <strong>Dirección:</strong> {contract.address}
      </p>

      <button onClick={handleDelete} style={{ marginTop: '10px', backgroundColor: 'red', color: 'white', padding: '5px 10px' }}>
        Eliminar Contrato
      </button>
      {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}

      {latestProcess && (
        <p>
          <strong>Estado del Proceso:</strong> {latestProcess.status}
        </p>
      )}

      {(latestProcess?.status === ProcessStatus.ABI_ADDED || latestProcess?.status === ProcessStatus.FAILED) && (
        <button onClick={handleStartIndexing} style={{ marginTop: '10px', backgroundColor: 'blue', color: 'white', padding: '5px 10px' }}>
          Comenzar a Indexar
        </button>
      )}
      {indexingError && <p style={{ color: 'red' }}>{indexingError}</p>}

      <nav style={{ marginTop: '20px' }}>
        <ul>
          <li>
            <Link to={`/contracts/${address}/graphql`}>Consulta GraphQL</Link>
          </li>
          <li>
            <Link to={`/contracts/${address}/event-logs`}>Event Logs</Link>
          </li>
          <li>
            <Link to={`/contracts/${address}/abi-events`}>ABI y Eventos</Link>
          </li>
          <li>
            <Link to={`/contracts/${address}/transactions`}>Transacciones</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="graphql" element={<GraphQLTab contract={contract} />} />
        <Route path="event-logs" element={<EventLogsTab contract={contract} />} />
        <Route path="abi-events" element={<AbiAndEventsTab contract={contract} />} />
        <Route path="transactions" element={<TransactionsTab transactions={contract.transactions || []} />} />
        <Route path="*" element={<GraphQLTab contract={contract} />} />
      </Routes>
    </div>
  );
};

export default ContractDetail;
