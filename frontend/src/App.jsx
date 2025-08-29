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

      {/* Contenido principal */}
      <main className="flex-grow relative flex">
        {/* Fondo con imagen */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('/images/FondoHome.jpg')` }}
        >
          <div className="absolute inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-md"></div>
        </div>

        {/* Contenido centrado EXACTAMENTE */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <AppRoutes />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;

