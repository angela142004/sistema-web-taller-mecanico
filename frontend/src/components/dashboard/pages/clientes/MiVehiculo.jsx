import React, { useEffect, useMemo, useState, useRef } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

// === COMPONENTE INTERNO: SELECT CON BÚSQUEDA ===
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className={value ? "text-white" : "text-white/70"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/70 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-[#3b138d] border border-white/20 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-white/10 sticky top-0 bg-[#3b138d]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                autoFocus
                type="text"
                placeholder="Filtrar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#2a0e66] text-white text-sm rounded-lg py-2 pl-9 pr-3 outline-none border border-white/10 placeholder:text-white/40"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 flex items-center justify-between ${
                    value === opt ? "bg-white/20 font-medium" : "text-white/80"
                  }`}
                >
                  {opt}
                  {value === opt && <Check className="w-3 h-3" />}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-white/50 text-center">
                Sin resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// Fallbacks
const BRANDS = [
  "Toyota",
  "Hyundai",
  "Kia",
  "Nissan",
  "Chevrolet",
  "Volkswagen",
];
const MODELS_BY_BRAND = {
  Toyota: ["Corolla", "Hilux", "Yaris", "RAV4"],
  Hyundai: ["Accent", "Elantra", "Tucson"],
  Kia: ["Rio", "Sportage", "Cerato"],
  Nissan: ["Versa", "Sentra", "Kicks"],
  Chevrolet: ["Onix", "Spark", "Tracker"],
  Volkswagen: ["Gol", "Polo", "T-Cross"],
};

// Estilo base (el mismo que tenías)
const pill =
  "h-12 w-full rounded-full bg-[#3b138d] text-white placeholder:text-white/70 px-5 outline-none border border-white/10 focus:ring-2 focus:ring-white/20";

export default function MiVehiculo() {
  const [marcasBackend, setMarcasBackend] = useState([]);
  const [modelosBackend, setModelosBackend] = useState({});
  const [vehiculos, setVehiculos] = useState([]);

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editId, setEditId] = useState(null);

  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  // 1. Cargar marcas
  const loadMarcasFromBackend = async () => {
    try {
      const res = await fetch(`${API}/mecanica/marcas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setMarcasBackend([]);
        return;
      }
      const data = await res.json();
      setMarcasBackend(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("Error marcas:", e.message);
      setMarcasBackend([]);
    }
  };

  useEffect(() => {
    loadMarcasFromBackend();
    fetchVehiculos();
    // eslint-disable-next-line
  }, []);

  // 2. Cargar modelos dinámicamente
  useEffect(() => {
    const loadModelos = async () => {
      const marcaObj = marcasBackend.find((m) => m.nombre === marca);
      if (!marcaObj) return;

      // Si ya los tenemos en cache, no recargar
      if (modelosBackend[marcaObj.id_marca]) return;

      try {
        const res = await fetch(
          `${API}/mecanica/modelos?marcaId=${marcaObj.id_marca}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (!res.ok) return;
        const data = await res.json();
        setModelosBackend((prev) => ({
          ...prev,
          [marcaObj.id_marca]: data || [],
        }));
      } catch (e) {
        console.warn("Error modelos:", e.message);
      }
    };
    loadModelos();
  }, [marca, marcasBackend, API, token, modelosBackend]);

  // Lista de Nombres de Marcas (para el Select)
  const brandOptions = useMemo(() => {
    return marcasBackend.length > 0
      ? marcasBackend.map((m) => m.nombre)
      : BRANDS;
  }, [marcasBackend]);

  // Lista de Nombres de Modelos (para el Select)
  const modelOptions = useMemo(() => {
    const marcaObj = marcasBackend.find((m) => m.nombre === marca);
    if (marcaObj && modelosBackend[marcaObj.id_marca]?.length) {
      return modelosBackend[marcaObj.id_marca].map((m) => m.nombre);
    }
    return marca && MODELS_BY_BRAND[marca] ? MODELS_BY_BRAND[marca] : [];
  }, [marca, marcasBackend, modelosBackend]);

  const fetchVehiculos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/mecanica/vehiculos`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401 || res.status === 403) {
        setError("No autorizado. Inicia sesión nuevamente.");
        setVehiculos([]);
        return;
      }
      if (!res.ok) throw new Error("No se pudieron obtener los vehículos");

      const data = await res.json();
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMarca("");
    setModelo("");
    setAnio("");
    setPlaca("");
    setEditId(null);
    setError("");
    setSuccess("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    if (!marca || !modelo || !anio || !placa) {
      setError("Todos los campos son obligatorios");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        marca,
        modelo,
        anio: Number(anio),
        placa: placa.trim(),
      };
      const url = editId
        ? `${API}/mecanica/vehiculos/${editId}`
        : `${API}/mecanica/vehiculos`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      setSuccess(editId ? "Vehículo actualizado" : "Vehículo guardado");
      resetForm();
      await fetchVehiculos();
    } catch (e) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v) => {
    const id = v.id_vehiculo ?? v.id ?? v.idVehiculo;
    setEditId(id);
    setMarca(v.modelo?.marca?.nombre ?? v.marca ?? "");
    setModelo(v.modelo?.nombre ?? v.modelo ?? "");
    setAnio(v.anio ? String(v.anio) : "");
    setPlaca(v.placa ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este vehículo?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/mecanica/vehiculos/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("No se pudo eliminar");
      setSuccess("Vehículo eliminado");
      await fetchVehiculos();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {editId ? "Editar vehículo" : "Agregar vehículo"}
        </h2>

        <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-4">
          {/* MARCA (Searchable) */}
          <div className="md:col-span-1">
            <label className="text-white font-semibold block mb-2">Marca</label>
            <SearchableSelect
              options={brandOptions}
              value={marca}
              onChange={(val) => {
                setMarca(val);
                setModelo("");
              }}
              placeholder="Seleccionar marca"
              className={pill}
            />
          </div>

          {/* MODELO (Searchable) */}
          <div className="md:col-span-1">
            <label className="text-white font-semibold block mb-2">
              Modelo
            </label>
            <SearchableSelect
              options={modelOptions}
              value={modelo}
              onChange={setModelo}
              placeholder={marca ? "Seleccionar modelo" : "Escribe modelo"}
              disabled={!marca}
              className={pill}
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-white font-semibold block mb-2">Año</label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className={pill}
              placeholder="2023"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-white font-semibold block mb-2">Placa</label>
            <input
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className={pill}
              placeholder="ABC-123"
            />
          </div>

          <div className="md:col-span-4 flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className={`h-12 px-6 rounded-xl font-semibold transition ${
                saving
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-[#3b138d] hover:bg-[#4316a1]"
              }`}
            >
              {saving
                ? "Guardando..."
                : editId
                ? "Actualizar vehículo"
                : "Agregar vehículo"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="h-12 px-4 rounded-xl bg-white/5 text-white/90 hover:bg-white/10"
            >
              Limpiar
            </button>
          </div>
        </form>

        {(error || success) && (
          <div className="mt-4">
            {error && <p className="text-red-400">{error}</p>}
            {success && <p className="text-green-400">{success}</p>}
          </div>
        )}
      </section>

      {/* Listado de vehículos */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Mis vehículos</h3>

        {loading ? (
          <div className="text-white/70">Cargando vehículos...</div>
        ) : vehiculos.length === 0 ? (
          <div className="text-white/60">No tienes vehículos registrados.</div>
        ) : (
          <div className="grid gap-4">
            {vehiculos.map((v) => {
              const id = v.id_vehiculo || v.id || v.idVehiculo;
              const marcaNombre = v?.modelo?.marca?.nombre ?? v.marca ?? "—";
              const modeloNombre =
                v?.modelo?.nombre ?? v.modelo ?? v.model ?? "—";
              return (
                <div
                  key={id}
                  className="p-4 rounded-xl bg-slate-800/60 flex items-center justify-between border border-white/5 hover:border-white/20 transition"
                >
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {marcaNombre}{" "}
                      <span className="text-white/70 font-normal">
                        {modeloNombre}
                      </span>
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                      Año: {v.anio || "—"} • Placa:{" "}
                      <span className="text-white font-mono bg-white/10 px-1 rounded">
                        {v.placa || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="px-3 py-1.5 rounded-md bg-white/5 text-white hover:bg-white/10 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="px-3 py-1.5 rounded-md bg-red-600/20 text-red-300 hover:bg-red-600/40 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
