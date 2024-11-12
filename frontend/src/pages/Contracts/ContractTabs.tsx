import React, { useEffect } from 'react';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Contract } from '../../types/contract';
import GraphQLTab from './GraphQLTab';
import EventLogsTab from './EventLogsTab';
import AbiAndEventsTab from './AbiAndEventsTab';
import TransactionsTab from './TransactionTab';
import './ContractTabs.css';

interface ContractTabsProps {
  contract: Contract;
}

const ContractTabs: React.FC<ContractTabsProps> = ({ contract }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirige a la pestaña 'abi-events' si no hay ninguna ruta específica seleccionada
    if (location.pathname === '/') {
      navigate('abi-events');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="contract-tabs-container">
      <nav className="tabs-nav">
        <ul className="tabs-list">
          <li className={`tab-item ${location.pathname.includes('abi-events') ? 'active' : ''}`}>
            <Link to="abi-events" className="tab-link">ABI y Eventos</Link>
          </li>
          <li className={`tab-item ${location.pathname.includes('graphql') ? 'active' : ''}`}>
            <Link to="graphql" className="tab-link">Consulta GraphQL</Link>
          </li>
          <li className={`tab-item ${location.pathname.includes('event-logs') ? 'active' : ''}`}>
            <Link to="event-logs" className="tab-link">Eventos generados</Link>
          </li>
          <li className={`tab-item ${location.pathname.includes('transactions') ? 'active' : ''}`}>
            <Link to="transactions" className="tab-link">Transacciones</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="abi-events" element={<AbiAndEventsTab contract={contract} />} />
        <Route path="graphql" element={<GraphQLTab contract={contract} />} />
        <Route path="event-logs" element={<EventLogsTab contract={contract} />} />
        <Route path="transactions" element={<TransactionsTab contract={contract} />} />
      </Routes>
    </div>
  );
};

export default ContractTabs;
