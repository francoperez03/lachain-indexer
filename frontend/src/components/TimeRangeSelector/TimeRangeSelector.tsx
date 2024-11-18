import React, { useEffect, useState } from "react";

interface TimeRangeSelectorProps {
  onRangeChange: (start: number, end: number) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  onRangeChange,
}) => {
  const [start, setStart] = useState<number>(10471451);
  const [end, setEnd] = useState<number>(11471451);

  const handleApply = () => {
    onRangeChange(start, end);
  };
  useEffect(() => {
    onRangeChange(start, end);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  return (
    <div className="time-range-selector">
      <input
        type="number"
        value={start}
        onChange={(e) => setStart(Number(e.target.value))}
        placeholder="Start Block"
      />
      <input
        type="number"
        value={end}
        onChange={(e) => setEnd(Number(e.target.value))}
        placeholder="End Block"
      />
      <button onClick={handleApply}>Aplicar</button>
    </div>
  );
};

export default TimeRangeSelector;
