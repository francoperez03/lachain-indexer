import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import ContractsList from './pages/Contracts/ContractsList';
import AddContract from './pages/Contracts/AddContract';
import ContractDetail from './pages/Contracts/ContractDetail';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard/Dashboard';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contracts" element={<ContractsList />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/contracts/add" element={<AddContract />} />
      <Route path="/contracts/:address/*" element={<ContractDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
