// EventLogRow.tsx
import React from 'react';
import { EventLog } from '../../types/eventLog';
import './EventLogRow.css';

interface EventLogRowProps {
  log: EventLog;
}

const EventLogRow: React.FC<EventLogRowProps> = ({ log }) => {
  return (
    <div className="event-log-row">
      <div className="event-log-row-header">
        <h4>{log.eventName}</h4>
        <p><strong>Block:</strong> {log.blockNumber}</p>
        <p><strong>Tx Hash:</strong> {log.transactionHash}</p>
      </div>
      <div className="event-log-row-parameters">
        <h5>Parameters:</h5>
        <ul>
          {log.parameters.map((param) => (
            <li key={param.id}>
              <strong>{param.name}:</strong> {param.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventLogRow;
