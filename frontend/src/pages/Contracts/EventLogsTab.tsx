import React, { useEffect, useState } from 'react';
import { Contract } from '../../types/contract';
import EventLogRow from '../../components/EventLogRow/EventLogRow';
import { getEventLogsByContractAddress } from '../../services/contractService';
import { EventLog } from '../../types/event';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import './EventLogsTab.css';

interface EventLogsTabProps {
  contract: Contract;
}

const EventLogsTab: React.FC<EventLogsTabProps> = ({ contract }) => {
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchEventLogs = async () => {
      try {
        const response = await getEventLogsByContractAddress(contract.address, page, limit);
        setEventLogs(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error fetching event logs:', error);
      }
    };

    fetchEventLogs();
  }, [contract.address, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderPaginationItems = () => {
    const items = [];

    items.push(
      <PaginationItem key={1} className="pagination-item">
        <PaginationLink
          onClick={() => handlePageChange(1)}
          className={`pagination-link ${page === 1 ? 'pagination-link-active' : ''}`}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (page > 4) {
      items.push(
        <PaginationItem key="start-ellipsis" className="pagination-item">
          <PaginationEllipsis className="pagination-ellipsis">...</PaginationEllipsis>
        </PaginationItem>
      );
    }

    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) {
      items.push(
        <PaginationItem key={i} className="pagination-item">
          <PaginationLink
            onClick={() => handlePageChange(i)}
            className={`pagination-link ${page === i ? 'pagination-link-active' : ''}`}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (page < totalPages - 3) {
      items.push(
        <PaginationItem key="end-ellipsis" className="pagination-item">
          <PaginationEllipsis className="pagination-ellipsis">...</PaginationEllipsis>
        </PaginationItem>
      );
    }

    items.push(
      <PaginationItem key={totalPages} className="pagination-item">
        <PaginationLink
          onClick={() => handlePageChange(totalPages)}
          className={`pagination-link ${page === totalPages ? 'pagination-link-active' : ''}`}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );

    return items;
  };

  if (!eventLogs.length) {
    return <p>No event logs found for this contract.</p>;
  }

  return (
    <div>
      <h3>Event Logs</h3>
      {eventLogs.map((log) => (
        <EventLogRow key={log.id} log={log} />
      ))}

      <Pagination className="pagination-container">
        <PaginationContent className="pagination-content">
          <PaginationItem className="pagination-item">
            <PaginationPrevious onClick={() => handlePageChange(Math.max(1, page - 1))} className="pagination-previous">
              Previous
            </PaginationPrevious>
          </PaginationItem>

          {renderPaginationItems()}

          <PaginationItem className="pagination-item">
            <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, page + 1))} className="pagination-next">
              Next
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default EventLogsTab;
