import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, PlusCircle } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  
  return (
    <header className="fixed w-full bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-purple-500/20 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-300">
              EchoSmart
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/contracts"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === '/contracts'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              <Eye className="h-5 w-5" />
              <span>Contratos</span>
            </Link>
            
            <Link
              to="/contracts/add"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === '/contracts/add'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              <PlusCircle className="h-5 w-5" />
              <span>Agregar</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}