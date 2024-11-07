// EventLogsTab.tsx
import React from 'react';
import { Contract } from '../../types/contract';
import EventLogRow from '../../components/EventLogRow/EventLogRow';

interface EventLogsTabProps {
  contract: Contract;
}

const EventLogsTab: React.FC<EventLogsTabProps> = ({ contract }) => {
  if (!contract?.eventLogs?.length) {
    return <p>No event logs found for this contract.</p>;
  }

  return (
    <div>
      <h3>Event Logs</h3>
      {contract.eventLogs.map((log) => (
        <EventLogRow key={log.id} log={log} />
      ))}
    </div>
  );
};

export default EventLogsTab;
