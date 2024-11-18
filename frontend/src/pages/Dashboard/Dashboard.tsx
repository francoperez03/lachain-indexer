import React, { useEffect, useState } from "react";
import TimeRangeSelector from "@/components/TimeRangeSelector/TimeRangeSelector";
import GraphWithControls from "@/components/GraphWithControls/GraphWithControls";
import "./Dashboard.css";
import DataSelectionModal from "@/components/DataSelectionModal/DataSelectionModal";
import { ContractItem } from "@/types/contract";
import { fetchEventLogs } from "@/services/analyticsService";
import { GraphData } from "@/types/analytics";
import { ScrollArea } from "@/components/ui/scroll-area";

const Dashboard: React.FC = () => {
  const [selectedData, setSelectedData] = useState<
    { contract: ContractItem; event: string }[]
  >([]);
  const [enabledData, setEnabledData] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [startBlock, setStartBlock] = useState<number | null>(null);
  const [endBlock, setEndBlock] = useState<number | null>(null);
  const [graphData, setGraphData] = useState<GraphData[]>([]);

  const onToogleEvent = (data: { contract: ContractItem; event: string }) => {
    setSelectedData((prevSelected) => {
      const exists = prevSelected.some(
        (item) =>
          item.contract.address === data.contract.address &&
          item.event === data.event
      );

      if (exists) {
        return prevSelected.filter(
          (item) =>
            !(
              item.contract.address === data.contract.address &&
              item.event === data.event
            )
        );
      } else {
        return [...prevSelected, data];
      }
    });
  };

  const toggleEnabled = (index: number) => {
    setEnabledData((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  useEffect(() => {
    const fetchAndSetEventLogs = async () => {
      if (startBlock !== null && endBlock !== null) {
        const enabledItems = selectedData.filter((_, index) =>
          enabledData.includes(index)
        );

        if (enabledItems.length > 0) {
          try {
            const results = await fetchEventLogs(
              enabledItems,
              startBlock,
              endBlock
            );
            const resultsWithContractName = results.map((result) => {
              const matchingContract = selectedData.find(
                (data) =>
                  data.contract.address === result.contractAddress &&
                  data.event === result.eventName
              );
              return {
                ...result,
                contractName: matchingContract
                  ? matchingContract.contract.name
                  : null,
              };
            });
            setGraphData(resultsWithContractName);
          } catch (error) {
            console.error("Error fetching event logs:", error);
          }
        }
      }
    };

    fetchAndSetEventLogs();
  }, [enabledData, selectedData, startBlock, endBlock]);

  return (
    <div className="dashboard-container">
      <TimeRangeSelector
        onRangeChange={(start: number, end: number) => {
          setStartBlock(start);
          setEndBlock(end);
        }}
      />
      <div className="data-controls">
        <ScrollArea className="selected-data-scroll">
          <ul className="selected-data-list">
            {selectedData.map((data, index) => (
              <li
                key={index}
                className={`data-item ${
                  enabledData.includes(index) ? "enabled" : ""
                }`}
                onClick={() => toggleEnabled(index)}
              >
                <div
                  className={`data-box ${
                    enabledData.includes(index) ? "data-box-enabled" : ""
                  }`}
                >
                  {data.contract.name} - {data.event}
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <button className="add-data-button" onClick={() => setModalOpen(true)}>
          Agregar +
        </button>
      </div>
      <GraphWithControls graphData={graphData} />
      <DataSelectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedData={selectedData}
        onToggleEvent={onToogleEvent}
      />
    </div>
  );
};

export default Dashboard;
