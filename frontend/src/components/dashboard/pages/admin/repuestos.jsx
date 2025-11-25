import { useState } from "react";
import { PlusCircle, Edit, Trash2, Save, X, Search } from "lucide-react";

// --- Datos de Marcas y Modelos de ejemplo (Simulación de JOIN/Foreign Keys) ---
const marcasEjemplo = [
  { id_marca: 1, nombre: "Toyota" },
  { id_marca: 2, nombre: "Ford" },
  { id_marca: 3, nombre: "Honda" },
];

const modelosEjemplo = [
  { id_modelo: 101, id_marca: 1, nombre: "Corolla" },
  { id_modelo: 102, id_marca: 1, nombre: "Hilux" },
  { id_modelo: 201, id_marca: 2, nombre: "Fiesta" },
  { id_modelo: 301, id_marca: 3, nombre: "Civic" },
];

// --- Datos de Repuestos de ejemplo (Simulación de la tabla Repuestos) ---
const repuestosIniciales = [
  {
    id_repuesto: 1,
    descripcion: "Filtro de Aceite Genérico Original",
    id_marca: 1,
    id_modelo: 101,
    anio: 2020,
    precio_compra: 8.50,
    precio_venta: 15.99,
    stock: 50,
  },
  {
    id_repuesto: 2,
    descripcion: "Pastillas de Freno Delanteras Cerámicas",
    id_marca: 2,
    id_modelo: 201,
    anio: 2018,
    precio_compra: 35.00,
    precio_venta: 69.99,
    stock: 20,
  },
  {
    id_repuesto: 3,
    descripcion: "Bujía de Encendido Iridium",
    id_marca: 3,
    id_modelo: 301,
    anio: 2022,
    precio_compra: 12.00,
    precio_venta: 24.50,
    stock: 30,
  },
  {
    id_repuesto: 4,
    descripcion: "Amortiguador Trasero Izquierdo",
    id_marca: 1,
    id_modelo: 102,
    anio: 2021,
    precio_compra: 75.00,
    precio_venta: 149.99,
    stock: 10,
  },
];

export default function AdminInventario() {
  const [repuestos, setRepuestos] = useState(repuestosIniciales);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repuestoEditando, setRepuestoEditando] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  // --- Funciones de Utilidad (Obtener nombres por IDs) ---
  const getMarcaNombre = (id) => marcasEjemplo.find((m) => m.id_marca === id)?.nombre || "N/A";
  const getModeloNombre = (id) => modelosEjemplo.find((m) => m.id_modelo === id)?.nombre || "N/A";
  
  const getModelosPorMarca = (idMarca) => modelosEjemplo.filter((m) => m.id_marca === idMarca);

  // --- Lógica de filtrado de repuestos ---
  const repuestosFiltrados = repuestos.filter((repuesto) => {
    const busquedaLower = filtroBusqueda.toLowerCase();
    const descripcionLower = repuesto.descripcion.toLowerCase();

    // 🎯 Lógica Simplificada: Buscar por Descripción del Producto (nombre)
    // Mantengo los otros campos (Marca, Modelo, Año) por ser útiles, pero la Descripción es la principal.
    return (
      descripcionLower.includes(busquedaLower) || // Búsqueda principal por descripción
      getMarcaNombre(repuesto.id_marca).toLowerCase().includes(busquedaLower) || // Búsqueda secundaria por marca
      getModeloNombre(repuesto.id_modelo).toLowerCase().includes(busquedaLower) || // Búsqueda secundaria por modelo
      String(repuesto.anio).includes(busquedaLower)
    );
  });

  // --- Manejo del Formulario de Creación/Edición (CRUD) ---

  const openEditModal = (repuesto) => {
    setRepuestoEditando({ 
        ...repuesto,
        precio_compra: String(repuesto.precio_compra),
        precio_venta: String(repuesto.precio_venta)
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setRepuestoEditando({
      id_repuesto: null,
      descripcion: "",
      id_marca: marcasEjemplo[0].id_marca,
      id_modelo: getModelosPorMarca(marcasEjemplo[0].id_marca)[0]?.id_modelo || 0,
      anio: new Date().getFullYear(),
      precio_compra: 0.00,
      precio_venta: 0.00,
      stock: 0,
    });
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setRepuestoEditando(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (type === 'number' && name !== 'precio_compra' && name !== 'precio_venta') {
        newValue = parseFloat(value) || 0; 
    } else if (name.startsWith("id_") || name === 'stock' || name === 'anio') {
        newValue = parseInt(value, 10);
    }
    
    if (name === "id_marca") {
        const nuevosModelos = getModelosPorMarca(parseInt(value, 10));
        setRepuestoEditando((prev) => ({
            ...prev,
            [name]: parseInt(value, 10),
            id_modelo: nuevosModelos.length > 0 ? nuevosModelos[0].id_modelo : 0,
        }));
        return;
    }

    setRepuestoEditando((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!repuestoEditando.descripcion || repuestoEditando.stock < 0) {
      alert("Por favor completa todos los campos requeridos y asegura que el stock no sea negativo.");
      return;
    }

    const datosGuardar = {
      ...repuestoEditando,
      precio_compra: parseFloat(repuestoEditando.precio_compra),
      precio_venta: parseFloat(repuestoEditando.precio_venta),
    };

    if (datosGuardar.id_repuesto) {
      setRepuestos((prev) =>
        prev.map((r) =>
          r.id_repuesto === datosGuardar.id_repuesto ? datosGuardar : r
        )
      );
    } else {
      const newId = Math.max(...repuestos.map(r => r.id_repuesto), 0) + 1;
      setRepuestos((prev) => [
        ...prev,
        { ...datosGuardar, id_repuesto: newId },
      ]);
    }
    closeModals();
  };

  // --- Función de Eliminación ---
  const handleEliminar = (idRepuesto) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este repuesto del inventario?")) {
      setRepuestos((prev) =>
        prev.filter((r) => r.id_repuesto !== idRepuesto)
      );
    }
  };


  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">📦 Gestión de Inventario</h2>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition duration-150 shadow-md w-full md:w-auto justify-center"
        >
          <PlusCircle size={20} /> Crear Nuevo Repuesto
        </button>

        {/* --- Barra de Búsqueda --- */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por descripción del producto..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            className="w-full p-2 pl-10 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
        </div>
      </div>

      {/* --- Versión para Desktop/Tablet (Tabla) --- */}
      <div className="hidden md:block overflow-x-auto bg-white/10 rounded-xl shadow-lg border border-white/20">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-white/15">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Marca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Modelo / Año</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">Costo (C)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">Precio (V)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {repuestosFiltrados.map((repuesto) => (
              <tr key={repuesto.id_repuesto} className="hover:bg-white/5 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{repuesto.id_repuesto}</td>
                <td className="px-6 py-4 text-sm text-white">{repuesto.descripcion}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{getMarcaNombre(repuesto.id_marca)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{getModeloNombre(repuesto.id_modelo)} ({repuesto.anio})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-300">$ {repuesto.precio_compra.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-300">$ {repuesto.precio_venta.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-yellow-300">{repuesto.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center space-x-2">
                  <button
                    onClick={() => openEditModal(repuesto)}
                    className="p-2 text-blue-400 hover:text-blue-500 rounded-full transition duration-150"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleEliminar(repuesto.id_repuesto)}
                    className="p-2 text-red-400 hover:text-red-500 rounded-full transition duration-150"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {repuestosFiltrados.length === 0 && (
                <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-white/70">
                        No se encontraron repuestos con el filtro "{filtroBusqueda}".
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Versión para Móvil (Tarjetas Apiladas) --- */}
      <div className="md:hidden space-y-4">
        {repuestosFiltrados.map((repuesto) => (
          <div key={repuesto.id_repuesto} className="bg-white/10 rounded-xl p-4 border border-white/20 shadow-md">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-semibold text-white">{repuesto.descripcion}</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(repuesto)}
                  className="p-2 text-blue-400 hover:text-blue-500 rounded-full transition duration-150"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleEliminar(repuesto.id_repuesto)}
                  className="p-2 text-red-400 hover:text-red-500 rounded-full transition duration-150"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-white/70 text-sm">ID: {repuesto.id_repuesto}</p>
            <p className="text-white/70 text-sm">Marca: {getMarcaNombre(repuesto.id_marca)}</p>
            <p className="text-white/70 text-sm">Modelo: {getModeloNombre(repuesto.id_modelo)} ({repuesto.anio})</p>
            <p className="text-white/70 text-sm">Costo (C): <span className="text-red-300 font-medium">${repuesto.precio_compra.toFixed(2)}</span></p>
            <p className="text-white/70 text-sm">Precio (V): <span className="text-green-300 font-medium">${repuesto.precio_venta.toFixed(2)}</span></p>
            <p className="text-white text-sm mt-2">Stock: <span className="font-bold text-yellow-300">{repuesto.stock}</span></p>
          </div>
        ))}
        {repuestosFiltrados.length === 0 && (
            <div className="text-center p-6 text-white/70 border border-white/10 rounded-xl">
                No se encontraron repuestos con el filtro "{filtroBusqueda}".
            </div>
        )}
      </div>


      {/* --- Modal de Creación/Edición (CRUD) --- */}
      {isModalOpen && repuestoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {repuestoEditando.id_repuesto ? "Editar Repuesto" : "Crear Nuevo Repuesto"}
              </h3>
              <button onClick={closeModals} className="text-white/70 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-white/70 mb-1">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  id="descripcion"
                  value={repuestoEditando.descripcion}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 rounded-lg bg-gray-700 border border-violet-500 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Marca */}
              <div>
                <label htmlFor="id_marca" className="block text-sm font-medium text-white/70 mb-1">Marca</label>
                <select
                  name="id_marca"
                  id="id_marca"
                  value={repuestoEditando.id_marca}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-violet-500 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {marcasEjemplo.map((marca) => (
                    <option key={marca.id_marca} value={marca.id_marca} className="bg-[#2a2a2a]">
                      {marca.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modelo */}
              <div>
                <label htmlFor="id_modelo" className="block text-sm font-medium text-white/70 mb-1">Modelo</label>
                <select
                  name="id_modelo"
                  id="id_modelo"
                  value={repuestoEditando.id_modelo}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded-lg bg-gray-700 border border-violet-500 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {getModelosPorMarca(repuestoEditando.id_marca).map((modelo) => (
                    <option key={modelo.id_modelo} value={modelo.id_modelo} className="bg-[#2a2a2a]">
                      {modelo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Año y Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="anio" className="block text-sm font-medium text-white/70 mb-1">Año</label>
                    <input
                        type="number"
                        name="anio"
                        id="anio"
                        value={repuestoEditando.anio}
                        onChange={handleFormChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                        className="w-full p-2 rounded-lg bg-gray-700 border border-violet-500 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>
                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-white/70 mb-1">Stock (Cantidad)</label>
                    <input
                        type="number"
                        name="stock"
                        id="stock"
                        value={repuestoEditando.stock}
                        onChange={handleFormChange}
                        min="0"
                        required
                        className="w-full p-2 rounded-lg bg-gray-700 border border-violet-500 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>
              </div>

              {/* Precios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="precio_compra" className="block text-sm font-medium text-white/70 mb-1">Costo de Compra ($)</label>
                  <input
                    type="number"
                    name="precio_compra"
                    id="precio_compra"
                    value={repuestoEditando.precio_compra}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full p-2 rounded-lg bg-gray-700 border border-violet-500 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label htmlFor="precio_venta" className="block text-sm font-medium text-white/70 mb-1">Precio de Venta ($)</label>
                  <input
                    type="number"
                    name="precio_venta"
                    id="precio_venta"
                    value={repuestoEditando.precio_venta}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full p-2 rounded-lg bg-gray-700 border border-violet-500 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition duration-150"
              >
                <Save size={20} /> Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}