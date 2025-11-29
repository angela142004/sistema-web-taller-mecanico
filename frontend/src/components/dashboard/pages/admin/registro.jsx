// FINAL — LISTO PARA COPIAR Y PEGAR

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Wrench,
  Settings,
  Search,
  Edit2,
  Trash2,
  XCircle,
  CheckCircle,
  PlusCircle,
} from "lucide-react";

const API_BASE = "http://localhost:4001/mecanica";

const ActionNotification = ({ message, type, onClose }) => {
  if (!message) return null;

  const icon =
    type === "success" ? (
      <CheckCircle size={20} className="text-green-400" />
    ) : (
      <XCircle size={20} className="text-red-400" />
    );

  const baseClass =
    type === "success"
      ? "bg-green-800/20 border-green-700"
      : "bg-red-800/20 border-red-700";

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 ${baseClass}`}
    >
      {icon}
      <p className="text-white font-medium">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-white">
        <XCircle size={18} />
      </button>
    </div>
  );
};

// ----------------- Modal
const UserModal = ({ isOpen, onClose, user, userType, onSave }) => {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    telefono: "",
    direccion: "",
    especialidad: "",
    fechaIngreso: "",
    id_usuario: undefined,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        id_usuario: user.id_usuario,
        nombre: user.nombre || "",
        correo: user.correo || "",
        contraseña: "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        especialidad: user.especialidad || "",
        fechaIngreso:
          user.fechaIngreso || user.fecha_ingreso?.split("T")[0] || "",
      });
    } else {
      setFormData({
        nombre: "",
        correo: "",
        contraseña: "",
        telefono: "",
        direccion: "",
        especialidad: "",
        fechaIngreso: "",
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const title = isEditing
    ? `Editar Cuenta (${user?.nombre ?? ""})`
    : `Agregar Nueva Cuenta de ${userType.toUpperCase()}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, isEditing);
    onClose();
  };

  const formFields = [
    { name: "nombre", label: "Nombre Completo", type: "text", required: true },
    {
      name: "correo",
      label: "Correo Electrónico",
      type: "email",
      required: true,
    },
    {
      name: "contraseña",
      label: "Contraseña",
      type: "password",
      required: !isEditing,
    },

    ...(userType === "cliente"
      ? [
          { name: "telefono", label: "Teléfono", type: "text" },
          { name: "direccion", label: "Dirección", type: "text" },
        ]
      : userType === "mecanico"
      ? [
          { name: "telefono", label: "Teléfono", type: "text" },
          { name: "especialidad", label: "Especialidad", type: "text" },
        ]
      : []),
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
      <div className="bg-[#1b223b] p-6 rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields.map((field) => (
            <div key={field.name}>
              <label className="text-sm text-gray-300">
                {field.label} {field.required ? "*" : ""}
              </label>
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                value={formData[field.name] ?? ""}
                onChange={handleChange}
                className="w-full p-2 bg-[#13182b] text-white border border-gray-600 rounded-lg"
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded-lg text-white"
            >
              Cancelar
            </button>
            <button className="px-4 py-2 bg-blue-600 rounded-lg text-white">
              {isEditing ? "Guardar Cambios" : "Crear Cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------- Main component
export default function App() {
  const [selectedTab, setSelectedTab] = useState("cliente");
  const [usuarios, setUsuarios] = useState({
    cliente: [],
    mecanico: [],
    admin: [],
  });
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [userToEdit, setUserToEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/users/rol/${selectedTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No autorizado");

      const data = await res.json();

      const normalized = data.map((u) => {
        const cliente = u.cliente ?? null;
        const mecanico = u.mecanico ?? null;

        return {
          ...u,
          displayId:
            cliente?.id_cliente ?? mecanico?.id_mecanico ?? u.id_usuario,
          telefono: cliente?.telefono ?? mecanico?.telefono ?? "",
          direccion: cliente?.direccion ?? "",
          especialidad: mecanico?.especialidad ?? "",
          fechaIngreso: mecanico?.fecha_ingreso
            ? mecanico.fecha_ingreso.split("T")[0]
            : "",
        };
      });

      setUsuarios((prev) => ({ ...prev, [selectedTab]: normalized }));
    } catch (err) {
      console.error(err);
      setUsuarios((prev) => ({ ...prev, [selectedTab]: [] }));
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [selectedTab]);

  const handleSaveUser = async (data, isEditing) => {
    try {
      const token = localStorage.getItem("token");

      let payload = {
        nombre: data.nombre,
        correo: data.correo,
        rol: selectedTab,
      };

      if (data.contraseña && data.contraseña.trim() !== "") {
        payload.contraseña = data.contraseña;
      }

      if (selectedTab === "cliente") {
        payload.telefono = data.telefono || "";
        payload.direccion = data.direccion || "";
      }

      if (selectedTab === "mecanico") {
        payload.telefono = data.telefono || "";
        payload.especialidad = data.especialidad || "";
      }

      if (isEditing && !data.contraseña) delete payload.contraseña;

      const url = isEditing
        ? `${API_BASE}/users/${data.id_usuario}`
        : `${API_BASE}/register`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      await loadUsuarios();
      showNotification(
        isEditing
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente",
        "success"
      );
    } catch (err) {
      console.error(err);
      showNotification("Error al guardar usuario", "error");
    }
  };

  const handleDelete = async (user) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/users/${user.id_usuario}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      setUsuarios((prev) => ({
        ...prev,
        [selectedTab]: prev[selectedTab].filter(
          (u) => u.id_usuario !== user.id_usuario
        ),
      }));

      showNotification("Usuario eliminado", "success");
    } catch {
      showNotification("Error al eliminar usuario", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const filteredUsuarios = useMemo(() => {
    return usuarios[selectedTab].filter((u) =>
      Object.values(u).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [usuarios, selectedTab, searchTerm]);

  const tabIcons = {
    cliente: Users,
    mecanico: Wrench,
    admin: Settings,
  };

  return (
    <>
      <ActionNotification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: "", type: "" })}
      />

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {["cliente", "mecanico", "admin"].map((t) => {
          const Icon = tabIcons[t];
          return (
            <button
              key={t}
              onClick={() => setSelectedTab(t)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                selectedTab === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              <Icon size={18} />
              {t.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Buscador */}
      <div className="flex items-center bg-[#1b223b] p-2 rounded-lg mb-4">
        <Search className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar usuario..."
          className="flex-1 bg-transparent text-white p-2"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button
        onClick={() => {
          setUserToEdit(null);
          setIsModalOpen(true);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 flex items-center gap-2"
      >
        <PlusCircle size={18} /> Nuevo {selectedTab}
      </button>

      {/* Tabla */}
      <div className="overflow-x-auto bg-[#11172b] rounded-xl shadow-lg border border-gray-700">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-[#1b223b] text-gray-300 text-sm uppercase tracking-wider">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Correo</th>
              <th className="px-6 py-3">Contraseña</th>

              {selectedTab === "cliente" && (
                <>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Dirección</th>
                </>
              )}

              {selectedTab === "mecanico" && (
                <>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Especialidad</th>
                  <th className="px-6 py-3">Fecha Ingreso</th>
                </>
              )}

              <th className="px-6 py-3 w-36 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsuarios.map((u, index) => (
              <tr
                key={u.id_usuario}
                className="border-b border-gray-700 hover:bg-[#1f2942] transition"
              >
                <td className="px-6 py-4 text-white">{index + 1}</td>

                <td className="px-6 py-4 text-white">{u.nombre}</td>
                <td className="px-6 py-4 text-gray-300">{u.correo}</td>

                {/* Mostramos solo puntitos */}
                <td className="px-6 py-4 text-gray-300">{"●".repeat(8)}</td>

                {selectedTab === "cliente" && (
                  <>
                    <td className="px-6 py-4 text-gray-300">{u.telefono}</td>
                    <td className="px-6 py-4 text-gray-300">{u.direccion}</td>
                  </>
                )}

                {selectedTab === "mecanico" && (
                  <>
                    <td className="px-6 py-4 text-gray-300">{u.telefono}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {u.especialidad}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {u.fechaIngreso}
                    </td>
                  </>
                )}

                <td className="px-6 py-4 w-36 flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setUserToEdit(u);
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-blue-700/40 text-blue-300 rounded-lg hover:bg-blue-700/60"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(u)}
                    className="p-2 bg-red-700/40 text-red-300 rounded-lg hover:bg-red-700/60"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={userToEdit}
        userType={selectedTab}
        onSave={handleSaveUser}
      />
    </>
  );
}
