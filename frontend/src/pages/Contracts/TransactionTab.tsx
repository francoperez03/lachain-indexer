import React from 'react';
import { Transaction } from '../../types/transaction';
import './TransactionTab.css';

interface TransactionsTabProps {
  transactions: Transaction[];
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions }) => {
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
                <p><strong>Hash de Transacción:</strong> {tx.hash}</p>
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
    </div>
  );
};

export default TransactionsTab;
