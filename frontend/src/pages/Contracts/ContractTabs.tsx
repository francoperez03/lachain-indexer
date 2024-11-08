import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { Contract } from '../../types/contract';
import GraphQLTab from './GraphQLTab';
import EventLogsTab from './EventLogsTab';
import AbiAndEventsTab from './AbiAndEventsTab';
import TransactionsTab from './TransactionTab';

interface ContractTabsProps {
  contract: Contract;
}

const ContractTabs: React.FC<ContractTabsProps> = ({ contract }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <nav>
        <ul>
          <li><Link to="graphql">Consulta GraphQL</Link></li>
          <li><Link to="event-logs">Event Logs</Link></li>
          <li><Link to="abi-events">ABI y Eventos</Link></li>
          <li><Link to="transactions">Transacciones</Link></li>
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
