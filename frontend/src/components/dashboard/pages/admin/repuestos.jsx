import { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Loader2,
} from "lucide-react";

// URL Base del Backend
const API = import.meta.env.VITE_API_URL || "http://localhost:4001";

export default function AdminInventario() {
  // === ESTADOS ===
  const [repuestos, setRepuestos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]); // Todos los modelos cargados
  const [modelosFiltrados, setModelosFiltrados] = useState([]); // Modelos según la marca seleccionada en el modal

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repuestoEditando, setRepuestoEditando] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  const token = localStorage.getItem("token");

  // === CARGA INICIAL DE DATOS (API) ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Cargar Repuestos
        const resRep = await fetch(`${API}/mecanica/repuestos`, { headers });
        const dataRep = await resRep.json();

        // 2. Cargar Marcas
        const resMarcas = await fetch(`${API}/mecanica/marcas`, { headers });
        const dataMarcas = await resMarcas.json();

        // 3. Cargar Modelos (Todos)
        // Nota: Si son muchos, podrías cargarlos por demanda, pero para empezar está bien cargar todos
        const resModelos = await fetch(`${API}/mecanica/modelos`, { headers });
        const dataModelos = await resModelos.json();

        setRepuestos(Array.isArray(dataRep) ? dataRep : []);
        setMarcas(Array.isArray(dataMarcas) ? dataMarcas : []);
        setModelos(Array.isArray(dataModelos) ? dataModelos : []);
      } catch (error) {
        console.error("Error cargando inventario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // === FILTRADO VISUAL (BÚSQUEDA) ===
  const repuestosFiltrados = repuestos.filter((r) => {
    const term = filtroBusqueda.toLowerCase();
    const marcaNombre = r.marca?.nombre || "";
    const modeloNombre = r.modelo?.nombre || "";

    return (
      r.descripcion.toLowerCase().includes(term) ||
      marcaNombre.toLowerCase().includes(term) ||
      modeloNombre.toLowerCase().includes(term) ||
      String(r.anio).includes(term)
    );
  });

  // === MANEJO DEL MODAL ===

  const openCreateModal = () => {
    // Valores por defecto
    const primeraMarca = marcas.length > 0 ? marcas[0].id_marca : "";

    setRepuestoEditando({
      id_repuesto: null,
      descripcion: "",
      id_marca: primeraMarca,
      id_modelo: "", // Se llenará al filtrar modelos
      anio: new Date().getFullYear(),
      precio_compra: 0,
      precio_venta: 0,
      stock: 0,
    });

    // Filtrar modelos para la primera marca
    actualizarModelosDelModal(primeraMarca);
    setIsModalOpen(true);
  };

  const openEditModal = (repuesto) => {
    setRepuestoEditando({
      ...repuesto,
      id_marca: repuesto.id_marca,
      id_modelo: repuesto.id_modelo,
    });
    // Filtrar modelos según la marca que ya tiene el repuesto
    actualizarModelosDelModal(repuesto.id_marca);
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setRepuestoEditando(null);
  };

  // Función auxiliar para filtrar el combo de modelos
  const actualizarModelosDelModal = (idMarca) => {
    const filtrados = modelos.filter((m) => m.id_marca === Number(idMarca));
    setModelosFiltrados(filtrados);

    // Si estamos creando o si el modelo actual no está en la nueva lista, seleccionar el primero
    // Pero si estamos editando, intentar mantener el modelo original si es válido
    return filtrados;
  };

  // === MANEJO DEL FORMULARIO ===

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // Si cambia la marca, actualizar la lista de modelos
    if (name === "id_marca") {
      const nuevaMarca = Number(value);
      const nuevosModelos = actualizarModelosDelModal(nuevaMarca);

      setRepuestoEditando((prev) => ({
        ...prev,
        id_marca: nuevaMarca,
        id_modelo: nuevosModelos.length > 0 ? nuevosModelos[0].id_modelo : "", // Resetear modelo
      }));
    } else {
      setRepuestoEditando((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const {
      id_repuesto,
      descripcion,
      id_marca,
      id_modelo,
      anio,
      precio_compra,
      precio_venta,
      stock,
    } = repuestoEditando;

    const payload = {
      descripcion,
      id_marca: Number(id_marca),
      id_modelo: Number(id_modelo),
      anio: Number(anio),
      precio_compra: Number(precio_compra),
      precio_venta: Number(precio_venta),
      stock: Number(stock),
    };

    try {
      let res;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (id_repuesto) {
        // EDITAR
        res = await fetch(`${API}/mecanica/repuestos/${id_repuesto}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // CREAR
        res = await fetch(`${API}/mecanica/repuestos`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Error al guardar");

      // Recargar datos (la forma más segura de tener la tabla actualizada)
      const resRep = await fetch(`${API}/mecanica/repuestos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataRep = await resRep.json();
      setRepuestos(dataRep);

      closeModals();
    } catch (error) {
      alert("Error al guardar el repuesto: " + error.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este repuesto?")) return;

    try {
      const res = await fetch(`${API}/mecanica/repuestos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar");

      // Actualizar estado local
      setRepuestos((prev) => prev.filter((r) => r.id_repuesto !== id));
    } catch (error) {
      alert("No se pudo eliminar: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" /> Cargando inventario...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
        📦 Gestión de Inventario
      </h2>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition duration-150 shadow-md w-full md:w-auto justify-center"
        >
          <PlusCircle size={20} /> Crear Nuevo Repuesto
        </button>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por descripción, marca..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            className="w-full p-2 pl-10 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70"
          />
        </div>
      </div>

      {/* --- TABLA DESKTOP --- */}
      <div className="hidden md:block overflow-x-auto bg-white/10 rounded-xl shadow-lg border border-white/20">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-white/15">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">
                Marca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">
                Modelo (Año)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase">
                Costo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase">
                Precio
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white/70 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {repuestosFiltrados.map((repuesto) => (
              <tr
                key={repuesto.id_repuesto}
                className="hover:bg-white/5 transition duration-150"
              >
                <td className="px-6 py-4 text-sm text-white">
                  {repuesto.id_repuesto}
                </td>
                <td className="px-6 py-4 text-sm text-white">
                  {repuesto.descripcion}
                </td>
                <td className="px-6 py-4 text-sm text-white">
                  {repuesto.marca?.nombre || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-white">
                  {repuesto.modelo?.nombre || "N/A"} ({repuesto.anio})
                </td>
                <td className="px-6 py-4 text-sm text-right text-red-300">
                  $ {Number(repuesto.precio_compra).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-green-300">
                  $ {Number(repuesto.precio_venta).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-bold text-yellow-300">
                  {repuesto.stock}
                </td>
                <td className="px-6 py-4 text-sm font-medium flex justify-center space-x-2">
                  <button
                    onClick={() => openEditModal(repuesto)}
                    className="p-2 text-blue-400 hover:text-blue-500 transition"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleEliminar(repuesto.id_repuesto)}
                    className="p-2 text-red-400 hover:text-red-500 transition"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {repuestosFiltrados.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-white/50">
                  No hay repuestos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MÓVIL (CARDS) --- */}
      <div className="md:hidden space-y-4">
        {repuestosFiltrados.map((r) => (
          <div
            key={r.id_repuesto}
            className="bg-white/10 rounded-xl p-4 border border-white/20 shadow-md"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-semibold text-white">
                {r.descripcion}
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(r)}
                  className="p-2 text-blue-400"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleEliminar(r.id_repuesto)}
                  className="p-2 text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-white/70 text-sm">
              Marca: {r.marca?.nombre} - Modelo: {r.modelo?.nombre} ({r.anio})
            </p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-red-300">
                Costo: ${Number(r.precio_compra).toFixed(2)}
              </span>
              <span className="text-green-300">
                Venta: ${Number(r.precio_venta).toFixed(2)}
              </span>
            </div>
            <p className="text-white text-sm mt-2 font-bold">
              Stock: <span className="text-yellow-300">{r.stock}</span>
            </p>
          </div>
        ))}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && repuestoEditando && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] p-6 sm:p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {repuestoEditando.id_repuesto
                  ? "Editar Repuesto"
                  : "Nuevo Repuesto"}
              </h3>
              <button
                onClick={closeModals}
                className="text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Descripción
                </label>
                <input
                  name="descripcion"
                  value={repuestoEditando.descripcion}
                  onChange={handleFormChange}
                  required
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Marca
                  </label>
                  <select
                    name="id_marca"
                    value={repuestoEditando.id_marca}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                  >
                    {marcas.map((m) => (
                      <option
                        key={m.id_marca}
                        value={m.id_marca}
                        className="bg-gray-800"
                      >
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Modelo
                  </label>
                  <select
                    name="id_modelo"
                    value={repuestoEditando.id_modelo}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                  >
                    {modelosFiltrados.map((m) => (
                      <option
                        key={m.id_modelo}
                        value={m.id_modelo}
                        className="bg-gray-800"
                      >
                        {m.nombre}
                      </option>
                    ))}
                    {modelosFiltrados.length === 0 && (
                      <option value="" className="bg-gray-800">
                        Sin modelos
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    name="anio"
                    value={repuestoEditando.anio}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={repuestoEditando.stock}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Costo ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_compra"
                    value={repuestoEditando.precio_compra}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Precio Venta ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_venta"
                    value={repuestoEditando.precio_venta}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Save size={20} /> Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
