// src/pages/DashboardCliente.jsx
import React from "react";

const DashboardCliente = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="p-10 bg-slate-800 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-4">Panel de Cliente</h1>
        <p className="text-slate-300">
          Bienvenido, aquí puedes ver tus servicios, historial y estado de tu
          vehículo.
        </p>
      </div>
    </div>
  );
};

export default DashboardCliente;
