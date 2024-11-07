import React from 'react';
import AppRouter from './router';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <div className="content">
        <AppRouter />
      </div>
      <Footer />
    </div>
  );
};


export default App;
