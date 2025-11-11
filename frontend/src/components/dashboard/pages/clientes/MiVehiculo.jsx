import React, { useEffect, useMemo, useState } from "react";

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

const pill =
  "h-12 w-full rounded-full bg-[#3b138d] text-white placeholder:text-white/70 px-5 outline-none border border-white/10 focus:ring-2 focus:ring-white/20";

export default function MiVehiculo() {
  const [marcasBackend, setMarcasBackend] = useState([]); // [{ id_marca, nombre }]
  const [modelosBackend, setModelosBackend] = useState({}); // { [id_marca]: [ { id_modelo, nombre } ] }

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

  // API base from .env (Vite)
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  // Cargar marcas desde el backend (usada en useEffect inicial)
  const loadMarcasFromBackend = async () => {
    try {
      const res = await fetch(`${API}/mecanica/marcas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        console.warn("[MiVehiculo] loadMarcasFromBackend no ok:", res.status);
        setMarcasBackend([]);
        return;
      }
      const data = await res.json();
      setMarcasBackend(Array.isArray(data) ? data : []);
      console.log(
        "[MiVehiculo] marcas cargadas:",
        Array.isArray(data) ? data.length : 0
      );
    } catch (e) {
      console.warn("[MiVehiculo] loadMarcasFromBackend error:", e.message);
      setMarcasBackend([]);
    }
  };

  // --- UNICO useEffect inicial: cargar marcas y vehículos ---
  useEffect(() => {
    // diagnóstico rápido
    console.log("[MiVehiculo] API:", API, "token presente:", !!token);
    loadMarcasFromBackend();
    fetchVehiculos();
    // eslint-disable-next-line
  }, []);

  // cargar marcas del backend (fallback al array BRANDS)
  const loadMarcas = async () => {
    try {
      const res = await fetch(`${API}/mecanica/marcas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setMarcasBackend([]); // fallback
        return;
      }
      const data = await res.json();
      setMarcasBackend(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("No se pudo cargar marcas:", e.message);
      setMarcasBackend([]);
    }
  };

  // cargar modelos del backend cuando cambia la marca (usa API)
  useEffect(() => {
    const loadModelos = async () => {
      const marcaObj = marcasBackend.find((m) => m.nombre === marca);
      if (!marcaObj) {
        // limpiar modelos si marca se deselecciona
        return;
      }
      try {
        const res = await fetch(
          `${API}/mecanica/modelos?marcaId=${marcaObj.id_marca}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (!res.ok) {
          // fallback: no asignar
          return;
        }
        const data = await res.json();
        setModelosBackend((prev) => ({
          ...prev,
          [marcaObj.id_marca]: data || [],
        }));
      } catch (e) {
        console.warn("No se pudo cargar modelos:", e.message);
      }
    };
    loadModelos();
  }, [marca, marcasBackend, API, token]);

  // modelOptions: prioriza backend, luego fallback local
  const modelOptions = useMemo(() => {
    const marcaObj = marcasBackend.find((m) => m.nombre === marca);
    if (marcaObj && modelosBackend[marcaObj.id_marca]?.length) {
      return modelosBackend[marcaObj.id_marca].map((m) => m.nombre);
    }
    return marca && MODELS_BY_BRAND[marca] ? MODELS_BY_BRAND[marca] : [];
  }, [marca, marcasBackend, modelosBackend]);

  // función para cargar vehículos del cliente (enviar token y manejar 401/403)
  const fetchVehiculos = async () => {
    setLoading(true);
    setError("");
    try {
      console.log(
        "[MiVehiculo] GET /mecanica/vehiculos - enviando Authorization:",
        !!token
      );
      const res = await fetch(`${API}/mecanica/vehiculos`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      console.log("[MiVehiculo] GET /mecanica/vehiculos status:", res.status);

      if (res.status === 401 || res.status === 403) {
        // Mostrar mensaje claro al usuario
        const body = await res.json().catch(() => ({}));
        const msg = body.message || "No autorizado. Inicia sesión nuevamente.";
        setError(msg);
        setVehiculos([]);
        return;
      }

      if (!res.ok) {
        // otros errores
        const body = await res.text().catch(() => "");
        console.warn("[MiVehiculo] fetchVehiculos no ok:", res.status, body);
        throw new Error("No se pudieron obtener los vehículos");
      }

      const data = await res.json();
      console.log("[MiVehiculo] Datos de vehiculos:", data);
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[MiVehiculo] Error fetchVehiculos:", e);
      setError(e.message || "Error al cargar vehículos");
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

      console.log("[MiVehiculo] enviando", method, url, "con token:", !!token);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}), // ← asegurar que token se envía
        },
        body: JSON.stringify(payload),
      });

      console.log("[MiVehiculo]", method, "response status:", res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      setSuccess(editId ? "Vehículo actualizado" : "Vehículo guardado");
      resetForm();
      await fetchVehiculos();
    } catch (e) {
      console.error("[MiVehiculo] error:", e);
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v) => {
    const id = v.id_vehiculo ?? v.id ?? v.idVehiculo;
    setEditId(id);
    // preferir la relación que viene del backend (modelo.marca.nombre)
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "No se pudo eliminar");
      }
      setSuccess("Vehículo eliminado");
      await fetchVehiculos();
    } catch (e) {
      setError(e.message || "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario: añadir/editar vehículo */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {editId ? "Editar vehículo" : "Agregar vehículo"}
        </h2>

        <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <label className="text-white font-semibold block mb-2">Marca</label>
            <select
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className={`${pill}`}
            >
              <option value="">Seleccionar marca</option>
              {marcasBackend.length > 0
                ? marcasBackend.map((m) => (
                    <option key={m.id_marca} value={m.nombre}>
                      {m.nombre}
                    </option>
                  ))
                : BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-white font-semibold block mb-2">
              Modelo
            </label>
            <select
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className={`${pill}`}
            >
              <option value="">
                {modelOptions.length ? "Seleccionar modelo" : "Escribe modelo"}
              </option>
              {modelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-white font-semibold block mb-2">Año</label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className={`${pill}`}
              placeholder="2023"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-white font-semibold block mb-2">Placa</label>
            <input
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className={`${pill}`}
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
              className="h-12 px-4 rounded-xl bg-white/5 text-white/90"
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
                  className="p-4 rounded-xl bg-slate-800/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {marcaNombre} {modeloNombre}
                    </div>
                    <div className="text-sm text-white/70">
                      Año: {v.anio || v.year || "—"}
                    </div>
                    <div className="text-sm text-white/70">
                      Placa: {v.placa || v.plate || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(v)}
                      className="px-3 py-1 rounded-md bg-white/5 text-white hover:bg-white/10"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="px-3 py-1 rounded-md bg-red-600/80 text-white hover:bg-red-600"
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
