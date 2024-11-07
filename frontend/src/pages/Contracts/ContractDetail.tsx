import React, { useEffect, useState } from 'react';
import { useParams, Link, Routes, Route } from 'react-router-dom';
import { getContractByAddress } from '../../services/contractService';
import { Contract } from '../../types/contract';
import GraphQLTab from './GraphQLTab';
import EventLogsTab from './EventLogsTab';

const ContractDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        if (address) {
          const data = await getContractByAddress(address);
          setContract(data);
        }
      } catch (err) {
        console.error(err)
        setError('Error al obtener los detalles del contrato.');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [address]);

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
      <nav>
        <ul>
          <li>
            <Link to={`/contracts/${address}/graphql`}>Consulta GraphQL</Link>
          </li>
          <li>
            <Link to={`/contracts/${address}/event-logs`}>Event Logs</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="graphql" element={<GraphQLTab contract={contract} />} />
        <Route path="event-logs" element={<EventLogsTab contract={contract} />} />
        <Route path="*" element={<GraphQLTab contract={contract} />} />
      </Routes>
    </div>
  );
};

export default ContractDetail;
