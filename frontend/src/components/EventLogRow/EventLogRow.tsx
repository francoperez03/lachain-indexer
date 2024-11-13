import React from 'react';
import { EventLog } from '../../types/event';
import './EventLogRow.css';

interface EventLogRowProps {
  log: EventLog;
}

const EventLogRow: React.FC<EventLogRowProps> = ({ log }) => {
  return (
    <div className="event-log-row">
      <div className="event-log-row-header">
        <h4 className="event-signature"><strong>Firma: </strong> {log.signature}</h4>
        <div className="event-details">
          <strong>Tx Hash: </strong>
          <a 
            href={`https://explorer.lachain.network/tx/${log.transactionHash}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="transaction-link"
          >
            {log.transactionHash}
          </a>
        </div>
      </div>
      <div className="event-log-row-parameters">
        <h5 className="parameters-title">Parámetros:</h5>
        <ul className="parameters-list">
          {log.parameters.map((param) => (
            <li key={param.id} className="parameter-item">
              <strong>{param.name}:</strong> {param.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventLogRow;
