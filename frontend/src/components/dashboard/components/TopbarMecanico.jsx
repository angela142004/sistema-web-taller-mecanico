import { useState, useEffect } from "react";
import { Bell, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4001";

export default function Topbar({ onOpenSidebar = () => {} }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const navigate = useNavigate();

  const [asignacionesMecanico, setAsignacionesMecanico] = useState([]);

  // ================================
  // ================================
  // USER DATA
  // ================================
  const [userData, setUserData] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user")) || {};
    return {
      nombre: stored.nombre || "Usuario",
      correo: stored.correo || "Cargando...",
      rol: stored.rol || "mecanico",
      foto: stored.foto || null,
    };
  });

  // ================================
  // ================================
  // FUNCIÓN CORREGIDA PARA CARGAR ASIGNACIONES
  // ================================
  const loadAsignaciones = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStored = JSON.parse(localStorage.getItem("user")) || {};

      if (!token || !userStored?.id_usuario) return;

      const res = await fetch(`${API}/mecanica/asignaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();

      // 🔥 Filtrar solo asignaciones del mecánico Y SOLO PENDIENTES
      const filtradas = data.filter(
        (a) =>
          a.mecanico?.usuario?.id_usuario === userStored.id_usuario &&
          (!a.estado || a.estado.toLowerCase() === "pendiente") // manejo de variaciones
      );

      setAsignacionesMecanico(filtradas);
    } catch (error) {
      console.error("Error cargando asignaciones:", error);
    }
  };

  // ================================
  // CARGA INMEDIATA AL MONTAR
  // ================================
  useEffect(() => {
    loadAsignaciones();
  }, []);

  // ================================
  // RECARGAR ASIGNACIONES AL CAMBIAR USER EN LOCALSTORAGE
  // (cuando cierras sesión y vuelves a entrar)
  // ================================
  useEffect(() => {
    const syncUser = () => {
      loadAsignaciones(); // recarga inmediata
    };

    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // ================================
  // CARGAR CUANDO ABRES NOTIFICACIONES
  // ================================
  useEffect(() => {
    if (openNotif) loadAsignaciones();
  }, [openNotif]);

  // ================================
  // CARGAR PERFIL DE USUARIO
  // ================================
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
        console.error("Error cargando perfil en Topbar:", error);
      }
    };

    fetchUserData();

    const handleStorageChange = () => {
      const stored = JSON.parse(localStorage.getItem("user")) || {};
      setUserData((prev) => ({ ...prev, ...stored }));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ================================
  // LOGOUT
  // ================================
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
      console.error(error);
    } finally {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  const closeAll = () => {
    setOpenProfile(false);
    setOpenNotif(false);
  };

  return (
    <>
      {/* HEADER TOPBAR */}
      <header className="sticky top-0 z-40 h-16 w-full flex items-center justify-between border-b border-white/10 bg-[#14122b]/90 backdrop-blur-md px-4 sm:px-6">
        {/* BOTÓN SIDEBAR */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition"
        >
          <Menu size={22} />
        </button>

        {/* ICONOS DERECHA */}
        <div className="flex items-center gap-3 ml-auto">
          {/* NOTIFICACIONES */}
          <button
            onClick={() => {
              closeAll();
              setOpenNotif(true);
            }}
            className="p-2 rounded-xl text-white hover:bg-violet-600/40 relative transition"
          >
            <Bell size={20} />

            {/* 🔥 Punto amarillo si hay asignaciones pendientes */}
            {asignacionesMecanico.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
            )}
          </button>

          {/* PERFIL */}
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

      {/* ================================ */}
      {/* DROPDOWN PERFIL */}
      {/* ================================ */}
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
              {userData.rol}
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setOpenProfile(false);
                navigate("/dashboard/mecanico/configuracion");
              }}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-medium transition active:scale-95"
            >
              <Settings size={16} /> Editar perfil
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-600/20 text-sm font-medium transition active:scale-95"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* ================================ */}
      {/* DROPDOWN NOTIFICACIONES */}
      {/* ================================ */}
      {openNotif && (
        <div
          className="fixed right-4 top-20 z-50 w-96 max-h-[70vh] overflow-y-auto 
      rounded-2xl bg-[#1d1a38] border border-white/10 p-5 text-white 
      shadow-2xl"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold">Notificaciones</h3>
            <button
              onClick={() => setOpenNotif(false)}
              className="hover:bg-white/10 p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {asignacionesMecanico.length === 0 && (
            <p className="text-center text-white/50 py-6">
              No tienes servicios pendientes
            </p>
          )}

          {asignacionesMecanico.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-white/50 mb-2">Servicios pendientes</p>

              {asignacionesMecanico.map((a) => (
                <div
                  key={a.id_asignacion}
                  onClick={() =>
                    navigate(`/dashboard/mecanico/servicio/${a.id_asignacion}`)
                  }
                  className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer
               hover:bg-blue-600/20 hover:border-blue-500/40 active:scale-[0.98]
               transition-all shadow-sm backdrop-blur-md mb-3"
                >
                  <p className="text-sm font-semibold text-blue-300">
                    {a.cotizacion.reserva.servicio.nombre}
                  </p>

                  <p className="text-xs text-white/60 mt-1">
                    Cliente:{" "}
                    <span className="text-white">
                      {a.cotizacion.reserva.cliente.usuario.nombre}
                    </span>
                  </p>

                  <p className="text-xs text-white/60 mt-1">
                    Vehículo:{" "}
                    <span className="text-white">
                      {a.cotizacion.reserva.vehiculo.modelo.marca.nombre}{" "}
                      {a.cotizacion.reserva.vehiculo.modelo.nombre}
                    </span>
                  </p>

                  <p className="text-xs text-white/50 mt-1">
                    Estado actual:{" "}
                    <span className="text-yellow-300 font-medium">
                      {a.estado || "pendiente"}
                    </span>
                  </p>

                  <p className="text-xs text-white/60 mt-2 italic">
                    Tienes un nuevo servicio pendiente.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
