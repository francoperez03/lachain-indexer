// src/pages/Dashboard/Dashboard.tsx

import React from 'react';
import TimeRangeSelector from '@/components/TimeRangeSelector/TimeRangeSelector';
import GraphWithControls from '@/components/GraphWithControls/GraphWithControls';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <TimeRangeSelector />
      <GraphWithControls />
    </div>
  );
};

export default Dashboard;
