import React from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
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

  return (
    <div className="contract-tabs-container">
      <nav className="tabs-nav">
        <ul className="tabs-list">
          <li className={`tab-item ${location.pathname.includes('abi-events') ? 'active' : ''}`}>
            <Link to="abi-events">ABI y Eventos</Link>
          </li>
          <li className={`tab-item ${location.pathname.includes('graphql') ? 'active' : ''}`}>
            <Link to="graphql">Consulta GraphQL</Link>
          </li>
          <li className={`tab-item ${location.pathname.includes('event-logs') ? 'active' : ''}`}>
            <Link to="event-logs">Eventos generados</Link>
          </li>
          <li className={`tab-item ${location.pathname.includes('transactions') ? 'active' : ''}`}>
            <Link to="transactions">Transacciones</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="graphql" element={<GraphQLTab contract={contract} />} />
        <Route path="event-logs" element={<EventLogsTab contract={contract} />} />
        <Route path="abi-events" element={<AbiAndEventsTab contract={contract} />} />
        <Route path="transactions" element={<TransactionsTab transactions={contract.transactions || []} />} />
      </Routes>
    </div>
  );
};

export default ContractTabs;
