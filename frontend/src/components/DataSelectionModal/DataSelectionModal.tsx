import React, { useEffect, useState } from "react";
import "./DataSelectionModal.css";
import { getContracts } from "@/services/contractService";
import { ContractItem } from "@/types/contract";
import { ScrollArea } from "@/components/ui/scroll-area"
import './DataSelectionModal.css'
interface DataSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: { contract: ContractItem; event: string }[];
  onToggleEvent: (data: { contract: ContractItem; event: string }) => void;
}

const DataSelectionModal: React.FC<DataSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedData,
  onToggleEvent,
}) => {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(
    null
  );

  useEffect(() => {
    const fetchContracts = async () => {
      if (isOpen) {
        const data = await getContracts();
        setContracts(data);
      }
    };
    fetchContracts();
  }, [isOpen]);

  const handleContractSelect = (contract: ContractItem) => {
    setSelectedContract(contract);
  };

  const handleEventToggle = (event: string) => {
    if (selectedContract) {
      onToggleEvent({ contract: selectedContract, event });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
        <h3>Seleccionar Contrato y Evento</h3>
        <div className="contracts-list">
          <h4>Contratos:</h4>
          {contracts?.map((contract) => (
            <button
              key={contract.address}
              onClick={() => handleContractSelect(contract)}
              className={
                selectedContract?.address === contract.address
                  ? "contract-button selected"
                  : "contract-button"
              }
            >
              {contract.name}
            </button>
          ))}
        </div>
        {selectedContract && (
          <div className="events-modal-list">
            <h4>Eventos:</h4>
            <ScrollArea className="events-scroll-area">
              {selectedContract.events.map((event) => {
                const isSelected = selectedData.some(
                  (data) =>
                    data.contract.address === selectedContract.address &&
                    data.event === event.name
                );

                return (
                  <button
                    key={event.id}
                    onClick={() => handleEventToggle(event.name)}
                    className={`event-button ${isSelected ? "selected" : ""}`}
                  >
                    {event.name}
                  </button>
                );
              })}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSelectionModal;
