import React from "react";

const Home = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="bg-slate-800/80 rounded-2xl shadow-xl p-10 text-white text-center">
      <h1 className="text-4xl font-bold mb-4">
        Bienvenido al Dashboard Cliente
      </h1>
      <p className="text-lg">
        Aquí puedes gestionar tus reservas, ver tu historial y más.
      </p>
    </div>
  </div>
);

export default Home;
