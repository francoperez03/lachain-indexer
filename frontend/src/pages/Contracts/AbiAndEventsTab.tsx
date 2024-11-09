import React from 'react';
import { Contract } from '../../types/contract';
import './AbiAndEventsTab.css';
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';

interface AbiAndEventsTabProps {
  contract: Contract;
}

const AbiAndEventsTab: React.FC<AbiAndEventsTabProps> = ({ contract }) => {
  return (
    <div className="abi-events-tab">
      {contract.events.length === 0 ? (
        <p className="no-events-message">No hay eventos para este contrato.</p>
      ) : (
        <div className="events-list">
          {contract.events.map((event) => (
            <div key={event.id} className="event-item">
              <span className="event-name">{event.name}</span>
              <span className="event-signature">Firma: {event.signature}</span>
            </div>
          ))}
        </div>
      )}

      <div className="abi-container">
        <h3 className="abi-title">ABI del Contrato</h3>
        <pre className="abi-content">
          <JsonView value={contract.abi} style={darkTheme}  />
        </pre>
      </div>  
    </div>
  );
};

export default AbiAndEventsTab;
