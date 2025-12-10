import { useState, useEffect } from "react";
import { Bell, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4001";

export default function TopbarAdmin({ onOpenSidebar = () => {} }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const navigate = useNavigate();

  // === NOTIFICACIONES ===
  const [notifStock, setNotifStock] = useState([]);
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [cotizacionesConfirmadas, setCotizacionesConfirmadas] = useState([]);

  useEffect(() => {
    const fetchStockBajo = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/mecanica/repuestos/stock-bajo`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setNotifStock(data);
      } catch (error) {
        console.error("Error cargando stock bajo:", error);
      }
    };

    fetchStockBajo();
  }, []);

  useEffect(() => {
    const fetchReservasPendientes = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/mecanica/reservas/pendientes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        setReservasPendientes(await res.json());
      } catch (error) {
        console.error("Error cargando reservas pendientes:", error);
      }
    };

    fetchReservasPendientes();
  }, []);

  useEffect(() => {
    const fetchCotizacionesConfirmadas = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/mecanica/cotizaciones/confirmadas`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        setCotizacionesConfirmadas(await res.json());
      } catch (error) {
        console.error("Error cargando cotizaciones confirmadas:", error);
      }
    };

    fetchCotizacionesConfirmadas();
  }, []);

  // === Usuario ===
  const [userData, setUserData] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user")) || {};
    return {
      nombre: stored.nombre || "Administrador",
      correo: stored.correo || "admin@taller.com",
      rol: stored.rol || "admin",
      foto: stored.foto || null,
    };
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userStored = JSON.parse(localStorage.getItem("user")) || {};
        const userId =
          userStored.id_usuario || localStorage.getItem("id_usuario");

        if (!userId || !token) return;

        const res = await fetch(`${API}/mecanica/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUserData({
            nombre: data.nombre,
            correo: data.correo,
            rol: data.rol,
            foto: data.foto,
          });

          localStorage.setItem("user", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };

    fetchUserData();
  }, []);

  const closeAll = () => {
    setOpenProfile(false);
    setOpenNotif(false);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/mecanica/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 w-full flex items-center justify-between border-b border-white/10 bg-[#14122b]/90 backdrop-blur-md px-4 sm:px-6">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-3 ml-auto">
          {/* Notificaciones */}
          <button
            onClick={() => {
              closeAll();
              setOpenNotif(true);
            }}
            className="p-2 rounded-xl text-white hover:bg-violet-600/40 relative transition"
          >
            <Bell size={20} />

            {notifStock.length + reservasPendientes.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {notifStock.length + reservasPendientes.length}
              </span>
            )}
          </button>

          {/* Perfil */}
          <div
            onClick={() => {
              closeAll();
              setOpenProfile(true);
            }}
            className="ml-1 w-9 h-9 rounded-full bg-white/20 hover:bg-violet-600/40 cursor-pointer overflow-hidden transition border border-white/10"
          >
            {userData.foto ? (
              <img
                src={`${API}/uploads/${userData.foto}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-items-center">
                <User size={18} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Perfil */}
      {openProfile && (
        <div className="fixed right-4 top-20 z-50 w-72 rounded-2xl bg-[#1d1a38] border border-white/10 p-5 text-white shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold">Tu Perfil</h3>
            <button
              onClick={() => setOpenProfile(false)}
              className="hover:bg-white/10 p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 mb-2 shadow-lg overflow-hidden border-2 border-white/20">
              {userData.foto ? (
                <img
                  src={`${API}/uploads/${userData.foto}`}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <User size={30} />
                </div>
              )}
            </div>

            <p className="font-semibold text-lg">{userData.nombre}</p>
            <p className="text-sm text-white/70">{userData.correo}</p>
            <span className="mt-1 px-2 py-0.5 rounded-md bg-white/10 text-[10px] uppercase tracking-wider font-medium text-violet-300">
              Administrador
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setOpenProfile(false);
                navigate("/dashboard/admin/configuracion");
              }}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-medium transition"
            >
              <Settings size={16} /> Configuración
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-600/20 text-sm font-medium transition"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {openNotif && (
        <div className="fixed right-4 top-20 z-50 w-80 rounded-2xl bg-[#1d1a38] border border-white/10 p-4 text-white shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold">Notificaciones</h3>
            <button
              onClick={() => setOpenNotif(false)}
              className="hover:bg-white/10 p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <ul className="space-y-2 text-sm max-h-72 overflow-y-auto">
            {notifStock.length === 0 &&
            reservasPendientes.length === 0 &&
            cotizacionesConfirmadas.length === 0 ? (
              <li className="text-white/60 text-center py-4">
                No hay notificaciones nuevas.
              </li>
            ) : (
              <>
                {notifStock.map((item) => (
                  <li
                    key={item.id_repuesto}
                    className="bg-white/10 p-3 rounded-xl flex items-start gap-2"
                  >
                    <span>⚠️</span>
                    <div>
                      <b>Stock bajo:</b> {item.descripcion}
                      <br />
                      <span className="text-red-400 font-semibold">
                        Quedan {item.stock} unidades
                      </span>
                    </div>
                  </li>
                ))}

                {reservasPendientes.length > 0 && (
                  <li className="bg-white/10 p-3 rounded-xl flex items-start gap-2">
                    <span>📅</span>
                    <div>
                      {reservasPendientes.length} reservas pendientes de
                      aprobación.
                    </div>
                  </li>
                )}

                {cotizacionesConfirmadas.length > 0 && (
                  <li className="bg-white/10 p-3 rounded-xl flex items-start gap-2">
                    <span>📝</span>
                    <div>
                      {cotizacionesConfirmadas.length} cotizaciones confirmadas
                      listas para asignar.
                    </div>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
