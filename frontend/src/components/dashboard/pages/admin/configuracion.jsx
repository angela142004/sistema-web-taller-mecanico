import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4001";

export default function Configuracion() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    correo: "",
  });

  const [form, setForm] = useState({
    nuevoNombre: "",
    nuevoCorreo: "",
    nuevaPass: "",
    repetirPass: "",
  });

  const [preview, setPreview] = useState("/default-avatar.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [msg, setMsg] = useState("");

  // ======== 1. Cargar datos del Admin ========
  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const userStored = JSON.parse(localStorage.getItem("user")) || {};
      const userId =
        userStored.id_usuario || localStorage.getItem("id_usuario");

      if (!userId) {
        console.warn("No se encontró ID de usuario");
        return;
      }

      // Reutilizamos el mismo endpoint que el cliente
      const res = await fetch(`${API}/mecanica/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al obtener usuario");
      const data = await res.json();

      setUsuario(data);

      // Lógica de Foto (Igual que cliente)
      if (data.foto) {
        setPreview(`${API}/uploads/${data.foto}`);
      } else {
        setPreview("/default-avatar.png");
      }

      // Llenamos el formulario (Sin teléfono ni dirección)
      setForm((f) => ({
        ...f,
        nuevoNombre: data.nombre,
        nuevoCorreo: data.correo,
      }));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ======== 2. Previsualizar Foto ========
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ======== 3. Subir Foto (Igual que cliente) ========
  const handleUploadPhoto = async () => {
    if (!selectedFile) return alert("Selecciona una imagen primero");

    const token = localStorage.getItem("token") || "";
    const formData = new FormData();
    formData.append("foto", selectedFile);

    try {
      setMsg("⏳ Subiendo imagen...");

      const res = await fetch(`${API}/mecanica/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir imagen");

      const data = await res.json();

      setPreview(`${API}/uploads/${data.foto}`);
      setMsg("✅ Foto actualizada correctamente");
      setSelectedFile(null);

      // Actualizar localStorage para el Topbar
      const userStored = JSON.parse(localStorage.getItem("user")) || {};
      userStored.foto = data.foto;
      localStorage.setItem("user", JSON.stringify(userStored));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
      setMsg("❌ Error al subir imagen");
    }
  };

  // ======== 4. Actualizar Datos (Solo Nombre y Correo) ========
  const handleUpdateField = async () => {
    const token = localStorage.getItem("token") || "";
    const userStored = JSON.parse(localStorage.getItem("user")) || {};
    const userId = userStored.id_usuario || localStorage.getItem("id_usuario");

    if (!userId) {
      setMsg("❌ Error: No se identifica el usuario.");
      return;
    }

    try {
      // Solo enviamos nombre y correo (El backend ignora lo demás si no lo enviamos)
      const payload = {
        nombre: form.nuevoNombre,
        correo: form.nuevoCorreo,
      };

      const res = await fetch(`${API}/mecanica/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al actualizar datos");
      setMsg("✅ Datos actualizados correctamente");
      loadUser();
    } catch {
      setMsg("❌ Error al actualizar datos");
    }
  };

  // ======== 5. Cambiar Contraseña (Igual que cliente) ========
  const handleChangePassword = async () => {
    const token = localStorage.getItem("token") || "";
    const userStored = JSON.parse(localStorage.getItem("user")) || {};
    const userId = userStored.id_usuario || localStorage.getItem("id_usuario");

    if (form.nuevaPass !== form.repetirPass) {
      setMsg("⚠️ Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch(`${API}/mecanica/users/${userId}`, {
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

  const input =
    "w-full h-12 px-4 rounded-xl bg-white text-black placeholder:text-gray-600 focus:ring-2 focus:ring-[#3b138d] outline-none";
  const button =
    "h-12 px-6 rounded-xl bg-[#3b138d] hover:bg-[#4316a1] text-white font-semibold transition w-full sm:w-auto";

  return (
    <div className="text-white w-full space-y-10 p-6 sm:p-10">
      {/* ===== PERFIL ===== */}
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
          <h2 className="text-2xl font-semibold">
            {usuario.nombre || "Usuario"}
          </h2>
          <p className="text-white/80">
            {usuario.correo || "correo@ejemplo.com"}
          </p>
          <p className="text-white/50 text-sm mt-2 font-mono uppercase bg-white/10 px-2 py-1 rounded w-fit mx-auto sm:mx-0">
            Administrador
          </p>
        </div>
      </section>

      {/* ===== FORMULARIOS ===== */}
      <section className="grid md:grid-cols-2 gap-8">
        {/* COLUMNA 1: DATOS PERSONALES (Sin dirección/teléfono) */}
        <div className="rounded-2xl bg-[#1a1730]/80 p-6 space-y-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Datos personales</h3>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-300">
              Nombre
            </label>
            <input
              className={input}
              value={form.nuevoNombre}
              onChange={(e) =>
                setForm({ ...form, nuevoNombre: e.target.value })
              }
              placeholder="Nuevo nombre"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-300">
              Correo Electrónico
            </label>
            <input
              className={input}
              value={form.nuevoCorreo}
              onChange={(e) =>
                setForm({ ...form, nuevoCorreo: e.target.value })
              }
              placeholder="Nuevo correo"
            />
          </div>

          <div className="pt-4">
            <button className={button} onClick={handleUpdateField}>
              Guardar cambios
            </button>
          </div>
        </div>

        {/* COLUMNA 2: CAMBIO DE CONTRASEÑA */}
        <div className="rounded-2xl bg-[#1a1730]/80 p-6 space-y-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Cambiar contraseña</h3>

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              className={input}
              placeholder="Nueva contraseña"
              value={form.nuevaPass}
              onChange={(e) => setForm({ ...form, nuevaPass: e.target.value })}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPass ? <EyeOff /> : <Eye />}
            </button>
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
            <button
              onClick={() => setShowRepeat(!showRepeat)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showRepeat ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <div className="pt-4">
            <button className={button} onClick={handleChangePassword}>
              Actualizar contraseña
            </button>
          </div>
        </div>
      </section>

      {msg && (
        <div className="mt-6 bg-white/10 text-center text-white/90 px-6 py-3 rounded-xl max-w-2xl mx-auto border border-white/20">
          {msg}
        </div>
      )}
    </div>
  );
}
