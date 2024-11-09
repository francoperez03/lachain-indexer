// src/components/IndexingControl/IndexingControl.tsx
import React, { useState, useEffect } from 'react';
import { Contract, ContractProcess, ProcessStatus } from '../../types/contract';
import { getBlockchainInfo } from '../../services/blockchainService';
import { previewLogs } from '../../services/contractService';
import './IndexingControl.css'
import Loader from '../ui/loader';
interface IndexingControlProps {
  contract: Contract;
  latestProcess: ContractProcess | undefined;
  onStartIndexing: (address: string, startBlock: bigint) => Promise<void>;
  onDelete: () => Promise<void>;
}

const IndexingControl: React.FC<IndexingControlProps> = ({ contract, latestProcess, onStartIndexing, onDelete }) => {
  const [startBlock, setStartBlock] = useState<bigint>(BigInt(0));
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [logsCount, setLogsCount] = useState<number | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [indexingLoading, setIndexingLoading] = useState<boolean>(false);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  const calculateCreationTime = () => {
    const createdAt = new Date(contract.createdAt);
    const now = new Date();
    const differenceInMs = now.getTime() - (createdAt.getTime() - (1000 * 60 * 60 * 3));
    const daysAgo = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    return  daysAgo === 0?  'Hoy' : `hace ${daysAgo} día${daysAgo !== 1 ? 's' : ''}`
  };

  useEffect(() => {
    const fetchCurrentBlock = async () => {
      try {
        const info = await getBlockchainInfo();
        setCurrentBlock(parseInt(info.blockNumber, 10));
      } catch (err) {
        console.error('Error fetching blockchain info:', err);
      }
    };
    fetchCurrentBlock();
  }, []);

  const handleStartIndexing = async () => {
    if (startBlock > 0 && startBlock <= currentBlock) {
      setIndexingLoading(true);
      await onStartIndexing(contract.address, startBlock);
      setIndexingLoading(false);
    } else {
      console.error('Error starting indexing:');
      setIndexingLoading(false);
    }
  };

  const handleStartBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = BigInt(e.target.value);
    setStartBlock(value);
    setLogsCount(null);
    setLoadingLogs(true);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (value && currentBlock && value >= BigInt(0) && value <= currentBlock) {
      const timeout = setTimeout(async () => {
        try {
          const logsData = await previewLogs(contract.address || '', value);
          setLogsCount(logsData);
        } catch (err) {
          console.error('Error previewing logs:', err);
        } finally {
          setLoadingLogs(false);
        }
      }, 1000);
      setTypingTimeout(timeout);
    } else {
      setLoadingLogs(false); // Desactiva el spinner si no cumple la condición
    }
  };

  return (
    <div className="indexing-control-container">
      <div className="indexing-control">
        <div className="logs-count-wrapper">
          <p className="logs-count">
            Indexar eventos desde el bloque:
            <input
              onChange={handleStartBlockChange}
              className="indexing-input"
              disabled={indexingLoading}
            />
          </p>
        </div>
        <p className="logs-count">
          Número total de bloques actuales: <strong style={{ color: '#51FF00' }}>{currentBlock}</strong>
        </p>
        {startBlock > 0 && (
          <p className="logs-count">
            Eventos a guardar desde el bloque <strong style={{ color: '#51FF00' }}>{startBlock.toString()}</strong>: {logsCount}
            {loadingLogs && <Loader className="loader" />}
          </p>
        )}
        <div className="button-group">
          {latestProcess && (latestProcess.status === ProcessStatus.ABI_ADDED || latestProcess.status === ProcessStatus.FAILED) && (
            <button onClick={handleStartIndexing} className="indexing-button" disabled={indexingLoading}>
              {indexingLoading ? 'Indexando...' : 'Comenzar a Indexar'}
            </button>
          )}
          <button onClick={onDelete} className="delete-button">
            Eliminar Contrato
          </button>
        </div>
        <div className="contract-info">
          <span>{contract.eventLogs.length} eventos</span> |
          <span>{contract.transactions.length} transacciones</span> |
          <span>creado {calculateCreationTime()}</span>
        </div>
      </div>
    </div>

  );
};

export default IndexingControl