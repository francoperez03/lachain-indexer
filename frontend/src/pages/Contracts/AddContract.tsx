import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addContract } from '../../services/contractService';
import { Contract } from '../../types/contract';
import './AddContract.css';

const AddContract: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [abi, setAbi] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAddressValid, setIsAddressValid] = useState<boolean>(true);
  const [isAbiValid, setIsAbiValid] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación de la dirección
    const addressValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    setIsAddressValid(addressValid);

    // Validación del ABI JSON
    let abiValid = true;
    try {
      JSON.parse(abi);
    } catch {
      abiValid = false;
    }
    setIsAbiValid(abiValid);

    if (!addressValid || !abiValid) {
      setError('Corrige los errores antes de enviar el formulario.');
      return;
    }

    try {
      const abiJson = JSON.parse(abi);
      const contractData: Partial<Contract> = { name, address, abi: abiJson };
      await addContract(contractData);
      navigate('/contracts');
    } catch (err) {
      console.log(err);
      setError('Error al agregar el contrato. Asegúrate de que el ABI es un JSON válido.');
    }
  };

  return (
    <div className="add-contract-container">
      <form onSubmit={handleSubmit} className="add-contract-form">
        {error && <p className="error-message">{error}</p>}
        
        <div className="input-group">
          <label>Nombre del Contrato:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Dirección del Contrato:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ borderColor: isAddressValid ? 'initial' : 'red' }}
            required
          />
          {!isAddressValid && (
            <p className="error-message">Dirección no válida. Debe ser una dirección hexadecimal de 42 caracteres.</p>
          )}
        </div>

        <div className="input-group">
          <label>ABI del Contrato (formato JSON):</label>
          <textarea
            value={abi}
            onChange={(e) => setAbi(e.target.value)}
            rows={6}
            style={{ borderColor: isAbiValid ? 'initial' : 'red' }}
            required
          />
          {!isAbiValid && (
            <p className="error-message">ABI no válido. Asegúrate de que sea un JSON válido.</p>
          )}
        </div>

        <button type="submit" className="add-contract-button">Agregar Contrato</button>
      </form>
    </div>
  );
};

export default AddContract;
