import React from 'react';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/50 backdrop-blur-xl border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <p className="text-gray-400">© 2024 echoSmart. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#6E2FE5] transition-colors duration-300"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}