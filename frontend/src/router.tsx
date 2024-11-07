import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import ContractsList from './pages/Contracts/ContractsList';
import AddContract from './pages/Contracts/AddContract';
import ContractDetail from './pages/Contracts/ContractDetail';
import NotFound from './pages/NotFound/NotFound';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contracts" element={<ContractsList />} />
        <Route path="/contracts/add" element={<AddContract />} />
        <Route path="/contracts/:address/*" element={<ContractDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
