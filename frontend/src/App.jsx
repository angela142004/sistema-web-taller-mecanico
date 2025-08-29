// src/App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import Footer from './components/Footer';
import './App.css'; 

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <Navbar />

      {/* Contenido principal centrado */}
      <main className="flex-grow flex items-center justify-center">
        <AppRoutes />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;

