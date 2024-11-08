// src/components/IndexingControl/IndexingControl.tsx
import React, { useState, useEffect } from 'react';
import { Contract, ContractProcess, ProcessStatus } from '../../types/contract';
import { getBlockchainInfo } from '../../services/blockchainService';

interface IndexingControlProps {
  contract: Contract;
  latestProcess: ContractProcess | undefined;
  onStartIndexing: (address: string, startBlock: number) => Promise<void>;
}

const IndexingControl: React.FC<IndexingControlProps> = ({ contract, latestProcess, onStartIndexing }) => {
  const [startBlock, setStartBlock] = useState<number>(0);
  const [isIndexing, setIsIndexing] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<number>(0);

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
      setIsIndexing(true);
      await onStartIndexing(contract.address, startBlock);
      setIsIndexing(false);
    } else {
      alert('Por favor, ingrese un bloque de inicio válido.');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <p>Bloque actual: {currentBlock}</p>
      <input
        type="number"
        placeholder="Bloque de inicio"
        value={startBlock}
        onChange={(e) => setStartBlock(Number(e.target.value))}
        disabled={isIndexing}
      />
      {latestProcess && (latestProcess.status === ProcessStatus.ABI_ADDED || latestProcess.status === ProcessStatus.FAILED) && (
        <button onClick={handleStartIndexing} disabled={isIndexing} style={{ marginLeft: '10px' }}>
          {isIndexing ? 'Indexando...' : 'Comenzar a Indexar'}
        </button>
      )}
    </div>
  );
};

export default IndexingControl;
