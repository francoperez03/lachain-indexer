import React from 'react';
import { Contract } from '../../types/contract';
import './AbiAndEventsTab.css';
import JsonView from '@uiw/react-json-view';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';

interface AbiAndEventsTabProps {
  contract: Contract;
}

const AbiAndEventsTab: React.FC<AbiAndEventsTabProps> = ({ contract }) => {
  return (
    <div className="abi-events-tab">
      <h3 className="transactions-title">Eventos del Contrato</h3>

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
          <JsonView value={contract.abi} style={githubDarkTheme}  />
        </pre>
      </div>  
    </div>
  );
};

export default AbiAndEventsTab;
