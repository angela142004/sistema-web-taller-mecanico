import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ConfirmarCuenta() {
  const { token } = useParams();
  const [mensaje, setMensaje] = useState("Verificando...");
  const [error, setError] = useState(false);

  useEffect(() => {
    const confirmar = async () => {
      try {
        const API = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API}/mecanica/confirmar/${token}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setMensaje("¡Cuenta confirmada con éxito! 🎉");
      } catch (err) {
        setError(true);
        setMensaje(err.message || "Error al confirmar");
      }
    };
    confirmar();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div
        className={`p-8 rounded-2xl shadow-xl border ${
          error
            ? "bg-red-900/50 border-red-500"
            : "bg-green-900/50 border-green-500"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">{mensaje}</h2>
        <Link to="/" className="text-blue-400 hover:underline">
          Ir al Inicio de Sesión
        </Link>
      </div>
    </div>
  );
}
