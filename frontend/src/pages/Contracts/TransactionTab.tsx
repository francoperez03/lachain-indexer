// TransactionsTab.tsx
import React from 'react';
import { Transaction } from '../../types/transaction';

interface TransactionsTabProps {
  transactions: Transaction[];
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions }) => {
  return (
    <div>
      <h3>Transacciones del Contrato</h3>
      {transactions.length === 0 ? (
        <p>No hay transacciones para este contrato.</p>
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li key={tx.id}>
              <p>
                <strong>Hash de Transacción:</strong> {tx.hash}
              </p>
              <p>
                <strong>Número de Bloque:</strong> {tx.blockNumber}
              </p>
              <p>
                <strong>De:</strong> {tx.from}
              </p>
              <p>
                <strong>Para:</strong> {tx.to}
              </p>
              <p>
                <strong>Valor:</strong> {tx.value}
              </p>
              <p>
                <strong>Gas Usado:</strong> {tx.gasLimit}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionsTab;
