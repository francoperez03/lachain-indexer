// src/components/IndexingButton/IndexingButton.tsx

import React, { useState, useEffect } from "react";
import "./IndexingButton.css";
import { ContractStatus } from "@/types/contract";

interface IndexingButtonProps {
  onClick: () => Promise<void>;
  loading: boolean,
  percentage: number;
  status: ContractStatus;
}

const IndexingButton: React.FC<IndexingButtonProps> = ({ onClick, loading, percentage, status }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [buttonText, setButtonText] = useState("Comenzar a Indexar");

  useEffect(() => {
    if (percentage === 100) {
      setButtonText("Indexado");
      setFadeOut(true);
      setTimeout(() => setFadeOut(false), 1000);
    } else if (loading) {
      setButtonText(`${percentage.toString()}%`);
    } else {
      switch (status) {
        case "CREATED":
        case "ABI_ADDED":
          setButtonText("Comenzar a Indexar");
          break;
        case "INDEXING":
          setButtonText("Indexando...");
          break;
        case "PAUSED":
        case "FAILED":
          setButtonText("Poner al día");
          break;
        case "LISTENING":
          setButtonText("Escuchando eventos");
          break;
        default:
          setButtonText("Comenzar a Indexar");
      }
    }
  }, [status, loading, percentage]);

  const handleClick = async () => {
    setFadeOut(false);
    await onClick();
    if (percentage === 100) setFadeOut(true);
  };

  return (
    <button
      onClick={handleClick}
      className={`indexing-button ${fadeOut ? "fade-out" : ""} ${loading ? "loading" : ""} ${percentage > 0 ? "active" : ""}`}
      disabled={loading || percentage === 100}
      style={{
        background: loading
        ? `linear-gradient(to right, #51FF00 ${percentage}%, #0C0C0B ${percentage}%)`
        : "#0C0C0B",
      color: loading && percentage > 0 ? "#0C0C0B" : "#51FF00",
      }}
    >
      {buttonText}
    </button>
  );
};

export default IndexingButton;
