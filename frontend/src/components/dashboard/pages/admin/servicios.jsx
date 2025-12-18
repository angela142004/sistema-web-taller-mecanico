import { useEffect, useState } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Loader2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function AdminServicio() {
  const [servicios, setServicios] = useState([]);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  // --- PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  // reset página cuando cambian filtro, tamaño de página o listado
  useEffect(() => setPage(1), [filtroBusqueda, perPage, servicios.length]);

  // Filtrado (ya existente)
  const serviciosFiltrados = servicios.filter((s) => {
    const term = filtroBusqueda.toLowerCase();
    return (
      s.nombre.toLowerCase().includes(term) ||
      (s.descripcion || "").toLowerCase().includes(term)
    );
  });

  const total = serviciosFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const displayedServicios = serviciosFiltrados.slice(startIndex, endIndex);
  // --- FIN PAGINACIÓN ---

  const token = localStorage.getItem("token");

  // === CARGA INICIAL ===
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/mecanica/servicios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setServicios(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando servicios", error);
      } finally {
        setLoading(false);
      }
    };
    cargarServicios();
  }, [token]);

  // === MODAL ===
  const openCreateModal = () => {
    setServicioEditando({
      id_servicio: null,
      nombre: "",
      descripcion: "",
      duracion: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (servicio) => {
    setServicioEditando({ ...servicio });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setServicioEditando(null);
  };

  // === FORM ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setServicioEditando((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const method = servicioEditando.id_servicio ? "PUT" : "POST";
      const url = servicioEditando.id_servicio
        ? `${API}/mecanica/servicios/${servicioEditando.id_servicio}`
        : `${API}/mecanica/servicios`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: servicioEditando.nombre,
          descripcion: servicioEditando.descripcion,
          duracion: servicioEditando.duracion,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar");

      const reload = await fetch(`${API}/mecanica/servicios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServicios(await reload.json());

      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este servicio?")) return;

    try {
      const res = await fetch(`${API}/mecanica/servicios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo eliminar");
      setServicios((prev) => prev.filter((s) => s.id_servicio !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" /> Cargando servicios...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white">
        🛠️ Gestión de Servicios
      </h2>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-xl text-white font-semibold"
        >
          <PlusCircle size={20} /> Nuevo Servicio
        </button>

        <div className="relative md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
          <input
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            placeholder="Buscar servicio..."
            className="w-full pl-10 p-2 rounded-xl bg-white/10 text-white border border-white/20"
          />
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block bg-white/10 rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-white/15">
            <tr>
              <th className="px-6 py-3 text-white/70">#</th>
              <th className="px-6 py-3 text-white/70">Nombre</th>
              <th className="px-6 py-3 text-white/70">Descripción</th>
              <th className="px-6 py-3 text-white/70">Duración</th>
              <th className="px-6 py-3 text-white/70 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedServicios.map((s, idx) => (
              <tr key={s.id_servicio} className="hover:bg-white/5">
                <td className="px-6 py-3 text-white">{startIndex + idx + 1}</td>
                <td className="px-6 py-3 text-white">{s.nombre}</td>
                <td className="px-6 py-3 text-white">{s.descripcion || "—"}</td>
                <td className="px-6 py-3 text-white">{s.duracion || "—"}</td>
                <td className="px-6 py-3 flex justify-center gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="text-blue-400"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id_servicio)}
                    className="text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINADOR DESKTOP */}
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-white/70">
            Mostrando {Math.min(startIndex + 1, total)}-
            {Math.min(endIndex, total)} de {total}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white/10 text-white p-2 rounded"
            >
              <option value={5}>5 / pág</option>
              <option value={8}>8 / pág</option>
              <option value={12}>12 / pág</option>
            </select>

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Anterior
            </button>

            <div className="flex items-center gap-1 overflow-auto max-w-[360px] px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-[36px] px-3 py-1 rounded text-sm ${
                    n === page
                      ? "bg-violet-600 text-white"
                      : "bg-[#2a2a2a] text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden space-y-4">
        {displayedServicios.map((s, idx) => (
          <div key={s.id_servicio} className="bg-white/10 p-4 rounded-xl">
            <div className="flex justify-between">
              <h4 className="text-white font-bold">{s.nombre}</h4>
              <div className="flex gap-2">
                <Edit
                  onClick={() => openEditModal(s)}
                  className="text-blue-400"
                />
                <Trash2
                  onClick={() => handleDelete(s.id_servicio)}
                  className="text-red-400"
                />
              </div>
            </div>
            <p className="text-white/70 text-sm">{s.descripcion}</p>
            <p className="text-white mt-1 text-sm">
              Duración: <b>{s.duracion || "—"}</b>
            </p>
          </div>
        ))}
      </div>

      {/* PAGINADOR MOBILE */}
      <div className="flex md:hidden flex-col gap-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/70">
            {startIndex + 1} - {Math.min(endIndex, total)} de {total}
          </div>
          <div className="text-sm text-white/70">
            {page}/{totalPages}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex-1 px-3 py-2 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
          >
            Anterior
          </button>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white/10 text-white p-2 rounded"
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
          </select>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex-1 px-3 py-2 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && servicioEditando && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-[#1e1e1e] p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="text-white font-bold">
                {servicioEditando.id_servicio
                  ? "Editar Servicio"
                  : "Nuevo Servicio"}
              </h3>
              <button onClick={closeModal}>
                <X className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <input
                name="nombre"
                placeholder="Nombre"
                value={servicioEditando.nombre}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-white/10 text-white"
              />
              <textarea
                name="descripcion"
                placeholder="Descripción"
                value={servicioEditando.descripcion}
                onChange={handleChange}
                className="w-full p-3 rounded bg-white/10 text-white"
              />
              <input
                name="duracion"
                placeholder="Duración (min)"
                value={servicioEditando.duracion}
                onChange={handleChange}
                className="w-full p-3 rounded bg-white/10 text-white"
              />

              <button className="w-full bg-violet-600 py-3 rounded-xl text-white flex justify-center gap-2">
                <Save size={20} /> Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
