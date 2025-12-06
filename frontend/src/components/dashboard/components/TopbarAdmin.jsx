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

export default function Topbar({ onOpenSidebar = () => {} }) {
  const [openChat, setOpenChat] = useState(false);
  const [openConversation, setOpenConversation] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  const user = {
    nombre: localStorage.getItem("nombre") || "Usuario",
    correo: localStorage.getItem("correo") || "correo@ejemplo.com",
    rol: localStorage.getItem("rol") || "cliente",
  };

  const chats = [
    {
      id: 1,
      nombre: "Carlos Ruiz (Mecánico)",
      avatar: "👨‍🔧",
      mensajes: [
        { de: "mecanico", texto: "Hola Jeremy, ya estoy revisando tu vehículo 🚗.", hora: "10:15" },
        { de: "cliente", texto: "Perfecto, gracias.", hora: "10:17" },
        { de: "mecanico", texto: "En unos minutos te mando foto del avance.", hora: "10:18" },
      ],
      respuestas: [
        "Ya casi está listo.",
        "Encontré un pequeño detalle en los frenos, te aviso cuando lo solucione.",
        "Podrías confirmar si deseas el cambio de aceite también?",
      ],
    },
    {
      id: 2,
      nombre: "Soporte Técnico",
      avatar: "💬",
      mensajes: [
        { de: "soporte", texto: "Bienvenido al sistema, ¿necesitas ayuda con algo?", hora: "09:05" },
      ],
      respuestas: [
        "Recuerda que puedes revisar tus facturas desde el menú principal.",
        "Si necesitas asistencia, estamos disponibles 24/7.",
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const nuevo = {
      de: "cliente",
      texto: message,
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedConv = {
      ...openConversation,
      mensajes: [...openConversation.mensajes, nuevo],
    };
    setOpenConversation(updatedConv);
    setMessage("");
    setIsTyping(true);

    // Simular respuesta del mecánico
    setTimeout(() => {
      const randomRespuesta =
        openConversation.respuestas[
          Math.floor(Math.random() * openConversation.respuestas.length)
        ];
      const reply = {
        de: "mecanico",
        texto: randomRespuesta,
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setOpenConversation((prev) => ({
        ...prev,
        mensajes: [...prev.mensajes, reply],
      }));
      setIsTyping(false);
    }, 2500 + Math.random() * 1500); // 2.5–4s de delay aleatorio
  };

  return (
    <>
      {/* 🔵 Topbar */}
      <header className="sticky top-0 z-40 h-16 w-full flex items-center justify-between border-b border-white/10 bg-[#14122b]/90 backdrop-blur-md px-4 sm:px-6">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-3 ml-auto">
          {/* Chat */}
          <button
            onClick={() => {
              closeAll();
              setOpenChat(true);
            }}
            className="p-2 rounded-xl text-white hover:bg-violet-600/40 relative transition"
          >
            <MessageSquareText size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {/* Notificaciones */}
          <button
            onClick={() => {
              closeAll();
              setOpenNotif(true);
            }}
            className="p-2 rounded-xl text-white hover:bg-violet-600/40 relative transition"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
          </button>

          {/* Perfil */}
          <div
            onClick={() => {
              closeAll();
              setOpenProfile(true);
            }}
            className="ml-1 w-9 h-9 rounded-full bg-white/20 hover:bg-violet-600/40 cursor-pointer grid place-items-center transition"
          >
            <User size={18} />
          </div>
        </div>
      </header>

      {/* 💬 Lista de chats */}
      {openChat && !openConversation && (
        <div className="fixed bottom-4 right-4 z-50 w-80 rounded-2xl bg-[#1d1a38] border border-white/10 shadow-2xl p-4 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold">Mensajes</h3>
            <button onClick={() => setOpenChat(false)} className="hover:bg-white/10 p-1 rounded-lg">
              <X size={18} />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {chats.map((c) => (
              <div
                key={c.id}
                onClick={() => setOpenConversation(c)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-700/20 cursor-pointer transition"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-lg">
                  {c.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{c.nombre}</p>
                  <p className="text-xs text-white/60 truncate italic">
                    {c.mensajes[c.mensajes.length - 1].texto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🗨️ Conversación */}
      {openConversation && (
        <div className="fixed bottom-4 right-4 z-50 w-96 h-[450px] rounded-2xl bg-[#1e1a3a] border border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#2a2760]/70 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenConversation(null)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <ArrowLeft size={16} />
              </button>
              <p className="font-semibold">{openConversation.nombre}</p>
            </div>
            <button
              onClick={() => setOpenConversation(null)}
              className="p-1 hover:bg-white/10 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#18152e]">
            {openConversation.mensajes.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.de === "cliente" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 text-sm rounded-2xl shadow-md transition ${
                    m.de === "cliente"
                      ? "bg-violet-600 text-white rounded-br-none"
                      : "bg-white/10 text-white/90 rounded-bl-none"
                  }`}
                >
                  {m.texto}
                  <div className="text-[10px] opacity-70 mt-1 text-right">{m.hora}</div>
                </div>
              </div>
            ))}

            {/* Indicador typing */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-1">
                  <span className="text-white/70 text-sm animate-pulse">Escribiendo</span>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce delay-100" />
                    <span className="w-1 h-1 bg-white/70 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campo de mensaje */}
          <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#2b2762]/60">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 h-9 rounded-xl bg-white/10 border border-white/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Perfil */}
      {openProfile && (
        <div className="fixed right-4 top-20 z-50 w-72 rounded-2xl bg-[#1d1a38] border border-white/10 p-5 text-white shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold">Tu Perfil</h3>
            <button onClick={() => setOpenProfile(false)} className="hover:bg-white/10 p-1 rounded-lg">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col items-center text-center mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 grid place-items-center mb-2 shadow-lg">
              <User size={30} />
            </div>
            <p className="font-semibold">{user.nombre}</p>
            <p className="text-sm text-white/70">{user.correo}</p>
            <p className="text-xs text-white/50 mt-1">Rol: {user.rol}</p>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={() => navigate("/dashboard/admin/configuracion")}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm transition"
            >
              <Settings size={16} /> Editar perfil
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm transition"
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
            <button onClick={() => setOpenNotif(false)} className="hover:bg-white/10 p-1 rounded-lg">
              <X size={18} />
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="bg-white/10 p-3 rounded-xl flex items-start gap-2">
              <span>⚙️</span>
              <div><b>Mantenimiento:</b> agendado para el <i>20/11</i>.</div>
            </li>
            <li className="bg-white/10 p-3 rounded-xl flex items-start gap-2">
              <span>💬</span>
              <div>Nuevo mensaje de <b>Carlos Ruiz</b>.</div>
            </li>
            <li className="bg-white/10 p-3 rounded-xl flex items-start gap-2">
              <span>🧾</span>
              <div>Tu factura del último servicio está disponible.</div>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
