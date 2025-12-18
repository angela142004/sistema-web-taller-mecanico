import { useState, useEffect } from "react";
import {
  MessageSquareText,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Send,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Topbar({ onOpenSidebar = () => {} }) {
  const [openChat, setOpenChat] = useState(false);
  const [openConversation, setOpenConversation] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  // === NOTIFICACIONES DE COTIZACIONES ===
  const [cotizacionesPendientes, setCotizacionesPendientes] = useState([]);
  const [estadosServicio, setEstadosServicio] = useState([]);

  useEffect(() => {
    if (!openNotif) return; // solo cargar cuando se abra el dropdown

    const fetchCotizaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API}/mecanica/cotizaciones`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();

        const pendientes = data.filter(
          (c) => c.estado.toLowerCase() === "pendiente"
        );

        setCotizacionesPendientes(pendientes);
      } catch (error) {
        console.error("Error cargando cotizaciones pendientes:", error);
      }
    };

    fetchCotizaciones();
  }, [openNotif]);

  // 1. ESTADO PARA EL USUARIO (Con foto)
  const [userData, setUserData] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user")) || {};
    return {
      nombre: stored.nombre || "Usuario",
      correo: stored.correo || "",
      rol: stored.rol || "cliente",
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
        console.error("Error cargando perfil cliente:", error);
      }
    };

    fetchUserData();
  }, []);

  // 2. EFECTO: Sincronizar datos y escuchar cambios
  // === CARGAR NOTIFICACIONES APENAS ENTRE EL USUARIO ===
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchAllNotifications = async () => {
      try {
        // COTIZACIONES
        const resCot = await fetch(`${API}/mecanica/cotizaciones`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resCot.ok) {
          const data = await resCot.json();
          const pendientes = data.filter(
            (c) => c.estado.toLowerCase() === "pendiente"
          );
          setCotizacionesPendientes(pendientes);
        }

        // ESTADOS DE SERVICIO
        const resServ = await fetch(`${API}/mecanica/asignaciones-cliente`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resServ.ok) {
          const data2 = await resServ.json();
          setEstadosServicio(data2);
        }
      } catch (error) {
        console.error("Error cargando notificaciones iniciales:", error);
      }
    };

    // Ejecutar carga inicial
    fetchAllNotifications();
  }, []);

  // ... (Chats y funciones auxiliares siguen igual) ...
  const chats = [
    {
      id: 1,
      nombre: "Carlos Ruiz (Mecánico)",
      avatar: "👨‍🔧",
      mensajes: [
        {
          de: "mecanico",
          texto: "Hola Jeremy, ya estoy revisando tu vehículo 🚗.",
          hora: "10:15",
        },
      ],
    },
    {
      id: 2,
      nombre: "Soporte Técnico",
      avatar: "💬",
      mensajes: [
        { de: "soporte", texto: "Bienvenido al sistema.", hora: "09:05" },
      ],
    },
  ];

  const closeAll = () => {
    setOpenChat(false);
    setOpenProfile(false);
    setOpenNotif(false);
    setOpenConversation(null);
    setIsTyping(false);
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
      console.error(error);
    } finally {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  const sendMessage = () => {
    /* ... tu lógica de chat ... */
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
          {/* Chat y Notificaciones (Sin cambios) */}
          {cotizacionesPendientes.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
          )}

          <button
            onClick={() => {
              closeAll();
              setOpenNotif(true);
            }}
            className="p-2 rounded-xl text-white hover:bg-violet-600/40 relative transition"
          >
            <Bell size={20} />

            {(cotizacionesPendientes.length > 0 ||
              estadosServicio.length > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
            )}
          </button>

          {/* === ICONO DE PERFIL EN EL HEADER === */}
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
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.classList.add(
                    "grid",
                    "place-items-center"
                  );
                }}
              />
            ) : (
              <div className="w-full h-full grid place-items-center">
                <User size={18} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ... (Chats flotantes) ... */}

      {/* === DROPDOWN DE PERFIL === */}
      {openProfile && (
        <div className="fixed right-4 top-20 z-50 w-72 rounded-2xl bg-[#1d1a38] border border-white/10 p-5 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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
            {/* FOTO GRANDE EN EL MENÚ */}
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
                navigate("/dashboard/cliente/configuracion");
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

      {/* === DROPDOWN DE NOTIFICACIONES === */}
      {openNotif && (
        <div
          className="fixed right-4 top-20 z-50 w-80 rounded-2xl 
                  bg-gradient-to-br from-[#1d1a38] to-[#14122b]
                  border border-white/10 p-4 text-white 
                  shadow-[0_8px_25px_rgba(0,0,0,0.35)]
                  animate-in fade-in slide-in-from-top-3 duration-200"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold tracking-wide">
              Notificaciones
            </h3>
            <button
              onClick={() => setOpenNotif(false)}
              className="hover:bg-white/10 p-1.5 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* CONTENIDO */}
          {cotizacionesPendientes.length === 0 ? (
            <div className="py-6 flex flex-col items-center">
              <Bell size={32} className="text-white/40 mb-2" />
              <p className="text-white/60 text-sm text-center">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {cotizacionesPendientes.map((c) => (
                <div
                  key={c.id_cotizacion}
                  onClick={() =>
                    navigate(
                      `/dashboard/cliente/cotizaciones/${c.id_cotizacion}`
                    )
                  }
                  className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer
                       hover:bg-violet-600/20 hover:border-violet-500/40 
                       active:scale-[0.98] transition-all shadow-sm
                       backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-violet-300">
                      Cotización #{c.id_cotizacion}
                    </p>

                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  </div>

                  <p className="text-xs text-white/50 mt-1">
                    Estado:{" "}
                    <span className="text-yellow-400 font-medium">
                      Pendiente
                    </span>
                  </p>

                  {/* TEXTO NUEVO */}
                  <p className="text-xs text-white/60 mt-2 italic">
                    Confirma o rechaza tu cotización desde aquí.
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* === ESTADOS DE SERVICIO === */}
          {estadosServicio.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-white/50 mb-2">
                Actualizaciones de tu servicio
              </p>

              {estadosServicio.map((s) => (
                <div
                  key={s.id_asignacion}
                  onClick={() =>
                    navigate(`/dashboard/cliente/servicio/${s.id_asignacion}`)
                  }
                  className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer
                   hover:bg-blue-600/20 hover:border-blue-500/40 
                   active:scale-[0.98] transition-all shadow-sm
                   backdrop-blur-md mb-3"
                >
                  <p className="text-sm font-semibold text-blue-300">
                    {s.cotizacion.reserva.servicio.nombre}
                  </p>

                  <p className="text-xs text-white/60 mt-1">
                    Vehículo:{" "}
                    <span className="text-white">
                      {s.cotizacion.reserva.vehiculo.modelo.marca.nombre}{" "}
                      {s.cotizacion.reserva.vehiculo.modelo.nombre}
                    </span>
                  </p>

                  <p className="text-xs text-white/60 mt-1">
                    Mecánico asignado:{" "}
                    <span className="text-white">
                      {s.mecanico.usuario.nombre}
                    </span>
                  </p>

                  <p className="text-xs text-white/50 mt-1">
                    Estado actual:{" "}
                    <span className="text-blue-400 font-medium">
                      {s.estado || "Sin actualizar"}
                    </span>
                  </p>

                  <p className="text-xs text-white/60 mt-2 italic">
                    Recibirás nuevas actualizaciones del servicio.
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
