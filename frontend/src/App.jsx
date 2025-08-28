// src/App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import Footer from './components/Footer';
import './App.css'; 

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <AppRoutes />
      </div>
      <Footer />
    </div>
  );
};

export default App;
