import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4001";

export default function Configuracion() {
  // === ESTADOS ===
  const [usuario, setUsuario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    especialidad: "",
    rol: "mecanico",
  });

  const [form, setForm] = useState({
    nuevoNombre: "",
    nuevoCorreo: "",
    nuevoTelefono: "",
    nuevaEspecialidad: "",
    nuevaPass: "",
    repetirPass: "",
  });

  const [preview, setPreview] = useState("/default-avatar.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [msg, setMsg] = useState("");

  // === 1. CARGAR DATOS (RUTA EXCLUSIVA DE MECÁNICO) ===
  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userStored = JSON.parse(localStorage.getItem("user")) || {};
      const userId =
        userStored.id_usuario || localStorage.getItem("id_usuario");

      if (!userId) return;

      // 👇 USAMOS DIRECTAMENTE LA RUTA DEL CONTROLADOR DE MECÁNICOS
      const res = await fetch(`${API}/mecanica/mecanicos/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener perfil del mecánico");
      const data = await res.json();

      setUsuario(data);

      // Foto
      if (data.foto) {
        setPreview(`${API}/uploads/${data.foto}`);
      } else {
        setPreview("/default-avatar.png");
      }

      // Llenar formulario
      setForm((f) => ({
        ...f,
        nuevoNombre: data.nombre,
        nuevoCorreo: data.correo,
        nuevoTelefono: data.telefono || "",
        nuevaEspecialidad: data.especialidad || "", // Campo exclusivo mecánico
      }));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // === 2. SUBIR FOTO (Esta ruta es compartida y está bien) ===
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return alert("Selecciona imagen");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("foto", selectedFile);

    try {
      const res = await fetch(`${API}/mecanica/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPreview(`${API}/uploads/${data.foto}`);
        setMsg("✅ Foto actualizada");

        // Actualizar localStorage para Topbar
        const userStored = JSON.parse(localStorage.getItem("user")) || {};
        userStored.foto = data.foto;
        localStorage.setItem("user", JSON.stringify(userStored));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) {
      console.error(e);
      setMsg("❌ Error al subir imagen");
    }
  };

  // === 3. ACTUALIZAR DATOS (RUTA EXCLUSIVA DE MECÁNICO) ===
  const handleUpdateField = async () => {
    const token = localStorage.getItem("token");
    const userStored = JSON.parse(localStorage.getItem("user")) || {};
    const userId = userStored.id_usuario;

    try {
      // 👇 USAMOS LA RUTA DEL CONTROLADOR DE MECÁNICOS
      const url = `${API}/mecanica/mecanicos/profile/${userId}`;

      const payload = {
        nombre: form.nuevoNombre,
        correo: form.nuevoCorreo,
        telefono: form.nuevoTelefono,
        especialidad: form.nuevaEspecialidad, // Campo clave del mecánico
      };

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      setMsg("✅ Datos de mecánico actualizados correctamente");

      // Actualizar localStorage
      userStored.nombre = form.nuevoNombre;
      userStored.correo = form.nuevoCorreo;
      localStorage.setItem("user", JSON.stringify(userStored));

      loadUser();
    } catch (e) {
      console.error(e);
      setMsg("❌ Error al actualizar datos");
    }
  };

  // === 4. CAMBIAR CONTRASEÑA (RUTA EXCLUSIVA DE MECÁNICO) ===
  const handleChangePassword = async () => {
    const token = localStorage.getItem("token");
    const userStored = JSON.parse(localStorage.getItem("user")) || {};
    const userId = userStored.id_usuario;

    if (form.nuevaPass !== form.repetirPass) {
      return setMsg("⚠️ Las contraseñas no coinciden");
    }
    if (!form.nuevaPass) return setMsg("⚠️ Escribe una contraseña");

    try {
      // El controlador updateMecanicoProfile también maneja la contraseña
      const url = `${API}/mecanica/mecanicos/profile/${userId}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contraseña: form.nuevaPass }),
      });

      if (!res.ok) throw new Error("Error al cambiar contraseña");

      setMsg("✅ Contraseña actualizada correctamente");
      setForm((f) => ({ ...f, nuevaPass: "", repetirPass: "" }));
    } catch {
      setMsg("❌ Error al cambiar contraseña");
    }
  };

  // Estilos
  const input =
    "w-full h-12 px-4 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#3b138d] outline-none";
  const button =
    "h-12 px-6 rounded-xl bg-[#3b138d] hover:bg-[#4316a1] text-white font-semibold transition w-full sm:w-auto";

  return (
    <div className="text-white w-full space-y-10 p-6 sm:p-10">
      {/* HEADER PERFIL */}
      <section className="w-full rounded-2xl bg-[#1a1730]/80 p-8 flex flex-col sm:flex-row items-center justify-center gap-8 shadow-md">
        <div className="flex flex-col items-center">
          <img
            src={preview}
            alt="perfil"
            className="w-48 h-48 rounded-full object-cover border-4 border-[#3b138d]"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="fotoPerfil"
            className="hidden"
          />
          <label
            htmlFor="fotoPerfil"
            className="mt-4 cursor-pointer bg-[#3b138d] hover:bg-[#4316a1] px-6 py-2 rounded-lg text-sm transition"
          >
            Cambiar foto
          </label>
          <button
            onClick={handleUploadPhoto}
            className="mt-2 text-sm text-white/70 underline hover:text-white"
          >
            Subir
          </button>
        </div>

        <div className="text-center sm:text-left max-w-md">
          <h2 className="text-2xl font-semibold">{usuario.nombre}</h2>
          <p className="text-white/80">{usuario.correo}</p>
          <div className="text-white/70 mt-2">
            <p>
              Rol:{" "}
              <span className="uppercase font-bold text-violet-400">
                MECÁNICO
              </span>
            </p>
            <p>Teléfono: {usuario.telefono || "—"}</p>
            <p>Especialidad: {usuario.especialidad || "—"}</p>
          </div>
        </div>
      </section>

      {/* FORMULARIOS */}
      <section className="grid md:grid-cols-2 gap-8">
        {/* DATOS PERSONALES */}
        <div className="rounded-2xl bg-[#1a1730]/80 p-6 space-y-4 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Datos personales</h3>

          <div>
            <label className="text-sm text-gray-400">Nombre</label>
            <input
              className={input}
              value={form.nuevoNombre}
              onChange={(e) =>
                setForm({ ...form, nuevoNombre: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Correo</label>
            <input
              className={input}
              value={form.nuevoCorreo}
              onChange={(e) =>
                setForm({ ...form, nuevoCorreo: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Teléfono</label>
            <input
              className={input}
              value={form.nuevoTelefono}
              onChange={(e) =>
                setForm({ ...form, nuevoTelefono: e.target.value })
              }
            />
          </div>

          {/* CAMPO EXCLUSIVO MECÁNICO */}
          <div>
            <label className="text-sm text-gray-400">Especialidad</label>
            <input
              className={input}
              value={form.nuevaEspecialidad}
              onChange={(e) =>
                setForm({ ...form, nuevaEspecialidad: e.target.value })
              }
              placeholder="Ej: Motores, Frenos..."
            />
          </div>

          <button onClick={handleUpdateField} className={button}>
            Guardar cambios
          </button>
        </div>

        {/* CAMBIO DE CONTRASEÑA */}
        <div className="rounded-2xl bg-[#1a1730]/80 p-6 space-y-4 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Cambiar contraseña</h3>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              className={input}
              placeholder="Nueva contraseña"
              value={form.nuevaPass}
              onChange={(e) => setForm({ ...form, nuevaPass: e.target.value })}
            />
            <span
              className="absolute right-4 top-4 cursor-pointer text-gray-600"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff /> : <Eye />}
            </span>
          </div>
          <div className="relative">
            <input
              type={showRepeat ? "text" : "password"}
              className={input}
              placeholder="Repetir contraseña"
              value={form.repetirPass}
              onChange={(e) =>
                setForm({ ...form, repetirPass: e.target.value })
              }
            />
            <span
              className="absolute right-4 top-4 cursor-pointer text-gray-600"
              onClick={() => setShowRepeat(!showRepeat)}
            >
              {showRepeat ? <EyeOff /> : <Eye />}
            </span>
          </div>
          <button onClick={handleChangePassword} className={button}>
            Actualizar contraseña
          </button>
        </div>
      </section>

      {msg && (
        <div
          className={`mt-6 px-6 py-3 rounded-xl max-w-2xl mx-auto border text-center ${
            msg.includes("❌") || msg.includes("⚠️")
              ? "bg-red-500/20 border-red-500 text-red-200"
              : "bg-green-500/20 border-green-500 text-green-200"
          }`}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
