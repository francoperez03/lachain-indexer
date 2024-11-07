import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addContract } from '../../services/contractService';
import { Contract } from '../../types/contract';

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

    // Mostrar error si hay campos inválidos
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
    <div>
      <h2>Agregar Nuevo Contrato</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Nombre del Contrato:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Dirección del Contrato:
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                borderColor: isAddressValid ? 'initial' : 'red',
              }}
              required
            />
            {!isAddressValid && (
              <p style={{ color: 'red' }}>Dirección no válida. Debe ser una dirección hexadecimal de 42 caracteres.</p>
            )}
          </label>
        </div>
        <div>
          <label>
            ABI del Contrato (formato JSON):
            <textarea
              value={abi}
              onChange={(e) => setAbi(e.target.value)}
              rows={10}
              cols={50}
              style={{
                borderColor: isAbiValid ? 'initial' : 'red',
              }}
              required
            />
            {!isAbiValid && (
              <p style={{ color: 'red' }}>ABI no válido. Asegúrate de que sea un JSON válido.</p>
            )}
          </label>
        </div>
        <button type="submit">Agregar Contrato</button>
      </form>
    </div>
  );
};

export default AddContract;
