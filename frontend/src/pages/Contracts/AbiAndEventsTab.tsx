import React from 'react';
import { Contract } from '../../types/contract';

interface AbiAndEventsTabProps {
  contract: Contract;
}

const AbiAndEventsTab: React.FC<AbiAndEventsTabProps> = ({ contract }) => {
  return (
    <div>
      <h3>ABI del Contrato</h3>
      <pre>{JSON.stringify(contract.abi, null, 2)}</pre>

      <h3>Eventos del Contrato</h3>
      {contract.events.length === 0 ? (
        <p>No hay eventos para este contrato.</p>
      ) : (
        <ul>
          {contract.events.map((event) => (
            <li key={event.id}>
              <strong>Nombre del Evento:</strong> {event.name} <br />
              <strong>Firma:</strong> {event.signature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AbiAndEventsTab;
