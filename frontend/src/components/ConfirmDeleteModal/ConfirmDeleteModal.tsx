// src/components/ConfirmDeleteModal/ConfirmDeleteModal.tsx

import React from 'react';
import './ConfirmDeleteModal.css';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>¿Estás seguro de que quieres eliminar el contrato?</h2>
        <p>Esta acción no se puede deshacer.</p>
        <div className="modal-actions">
          <button className="confirm-button" onClick={onConfirm}>Sí, eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
