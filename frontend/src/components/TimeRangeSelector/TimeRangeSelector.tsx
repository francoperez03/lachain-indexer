import React from 'react';
import './TimeRangeSelector.css';

const TimeRangeSelector: React.FC = () => {
  return (
    <div className="time-range-selector">
      <label>Selecciona el rango de tiempo:</label>
      <select>
        <option>Última semana</option>
        <option>Último mes</option>
        <option>Último trimestre</option>
        <option>Último año</option>
        <option>Personalizado</option>
      </select>
    </div>
  );
};

export default TimeRangeSelector;
