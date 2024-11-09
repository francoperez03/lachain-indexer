// src/components/IndexingControl/IndexingControl.tsx
import React, { useState, useEffect } from 'react';
import { Contract, ContractProcess, ProcessStatus } from '../../types/contract';
import { getBlockchainInfo } from '../../services/blockchainService';
import { previewLogs } from '../../services/contractService';
import './IndexingControl.css'
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
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout>  | null>(null);
  const [indexingLoading, setIndexingLoading] = useState<boolean>(false);
  
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
        }
      }, 2000);
      setTypingTimeout(timeout);
    }
  };

 return (
  <div className="indexing-control-container">
    <div className="indexing-control">
      <p className="logs-count">
        Indexar eventos desde el bloque:
        <input
          onChange={handleStartBlockChange}
          className="indexing-input"
          disabled={indexingLoading}
        />
      </p>
      <p className="logs-count">
        Número total de bloques actuales: <strong style={{ color: '#51FF00' }}>{currentBlock}</strong>
      </p>
      {logsCount !== null && (
        <p className="logs-count">Logs a guardar desde el bloque {startBlock.toString()}: {logsCount}</p>
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
    </div>
  </div>

  );
};

export default IndexingControl