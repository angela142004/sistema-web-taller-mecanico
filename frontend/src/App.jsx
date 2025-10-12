// src/App.jsx

import React from "react";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      {/* Contenido principal que crece y ocupa el espacio disponible */}
      <main className="flex-grow">
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
