// src/components/TransactionsTab/TransactionsTab.tsx
import React, { useEffect, useState } from 'react';
import { getTransactionsByContractAddress } from '../../services/contractService';
import { Transaction } from '../../types/transaction';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import './TransactionTab.css';
import { Contract } from '@/types/contract';

interface TransactionsTabProps {
  contract: Contract;
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ contract }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getTransactionsByContractAddress(contract.address, page, limit);
        setTransactions(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [contract, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderPaginationItems = () => {
    const items = [];

    items.push(
      <PaginationItem key={1} className="pagination-item">
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={page === 1}
          className={`pagination-link ${page === 1 ? 'pagination-link-active' : ''}`}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (page > 4) {
      items.push(
        <PaginationItem key="start-ellipsis" className="pagination-item">
          <PaginationEllipsis />
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

  return (
    <div className="transactions-tab">
      <h3 className="transactions-title">Transacciones del Contrato</h3>
      {transactions.length === 0 ? (
        <p className="no-transactions-message">No hay transacciones para este contrato.</p>
      ) : (
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-item">
              <div className="transaction-details">
                <p>
                  <strong>Hash de Transacción:</strong> 
                  <a 
                    href={`https://explorer.lachain.network/tx/${tx.hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transaction-link"
                  >
                    {tx.hash}
                  </a>
                </p>
                <p><strong>Número de Bloque:</strong> {tx.blockNumber}</p>
              </div>
              <div className="transaction-info">
                <p><strong>De:</strong> {tx.from}</p>
                <p><strong>Para:</strong> {tx.to}</p>
                <p><strong>Valor:</strong> {tx.value}</p>
                <p><strong>Gas Usado:</strong> {tx.gasLimit}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination className="pagination-container">
        <PaginationContent className="pagination-content">
          <PaginationItem className="pagination-item">
            <PaginationPrevious onClick={() => handlePageChange(Math.max(1, page - 1))}>
              Previous
            </PaginationPrevious>
          </PaginationItem>

          {renderPaginationItems()}

          <PaginationItem className="pagination-item">
            <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, page + 1))}>
              Next
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default TransactionsTab;
