import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, Routes, Route } from 'react-router-dom';
import { getContractByAddress, deleteContractByAddress } from '../../services/contractService';
import { Contract } from '../../types/contract';
import GraphQLTab from './GraphQLTab';
import EventLogsTab from './EventLogsTab';
import AbiAndEventsTab from './AbiAndEventsTab';
import TransactionsTab from './TransactionTab';

const ContractDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletionError, setDeletionError] = useState<string | null>(null);
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
        navigate('/contracts'); // Redirige a la lista de contratos después de eliminar
      }
    } catch (err) {
      console.error(err);
      setDeletionError('Error al eliminar el contrato.');
    }
  };

  if (loading) return <p>Cargando detalles del contrato...</p>;
  if (error) return <p>{error}</p>;

  if (!contract) return <p>Contrato no encontrado.</p>;

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
      {deletionError && <p style={{ color: 'red' }}>{deletionError}</p>}

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
