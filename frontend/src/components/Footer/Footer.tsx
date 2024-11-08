import React, { useEffect, useState } from 'react';
import './Footer.css';

export default function Footer() {
  const [text, setText] = useState("from");

  useEffect(() => {
    const interval = setInterval(() => {
      setText((prevText) => (prevText === "from" ? "for" : "from"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">
            Built with 💚 <span className="animated-text">{text}</span> LaTam
          </p>
        </div>
      </div>
    </footer>
  );
}
