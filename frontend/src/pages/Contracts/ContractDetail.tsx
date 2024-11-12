import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getContractByAddress,
  deleteContractByAddress,
  startIndexing,
} from "../../services/contractService";
import { Contract } from "../../types/contract";
import ContractTabs from "./ContractTabs";
import ContractHeader from "../../components/ContractHeader/ContractHeader";
import IndexingControl from "../../components/IndexingControl/IndexingControl";
import webSocketService from "../../services/websocketService";

const ContractDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const handleMessage = (data: { percentage: number }) => {
      console.log("Mensaje recibido desde WebSocket:", data);
      setPercentage(data.percentage);
    };

    webSocketService.connect(handleMessage);

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const fetchContract = useCallback(async () => {
    try {
      if (address) {
        const data = await getContractByAddress(address);
        setContract(data);
      }
    } catch (err) {
      console.error(err);
      setError("Error al obtener los detalles del contrato.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleDelete = async () => {
    if (address) {
      await deleteContractByAddress(address);
    }
  };

  if (loading) return <p>Cargando detalles del contrato...</p>;
  if (error || !contract) return <p>{error || "Contrato no encontrado."}</p>;

  return (
    <div>
      <ContractHeader contract={contract} onDelete={handleDelete} />
      <IndexingControl
        contract={contract}
        onStartIndexing={startIndexing}
        onDelete={handleDelete}
        onIndexingComplete={fetchContract}
        percentage={percentage}
      />
      <ContractTabs contract={contract} />
    </div>
  );
};

export default ContractDetail;
