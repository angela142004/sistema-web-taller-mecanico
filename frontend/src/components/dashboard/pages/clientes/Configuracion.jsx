import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
const token = localStorage.getItem("token") || "";

export default function Configuracion() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
  });

  const [form, setForm] = useState({
    nuevoNombre: "",
    nuevoCorreo: "",
    nuevoTelefono: "",
    nuevaDireccion: "",
    nuevaPass: "",
    repetirPass: "",
  });

  const [preview, setPreview] = useState("/default-avatar.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [msg, setMsg] = useState("");

  // ======== Cargar usuario ========
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Error al cargar usuario");
        const data = await res.json();
        setUsuario(data);
        setForm((f) => ({
          ...f,
          nuevoNombre: data.nombre,
          nuevoCorreo: data.correo,
          nuevoTelefono: data.telefono || "",
          nuevaDireccion: data.direccion || "",
        }));
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  // ======== Cambiar foto ========
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return alert("Selecciona una imagen primero");
    const formData = new FormData();
    formData.append("foto", selectedFile);

    try {
      const res = await fetch(`${API}/auth/upload-photo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Error al subir imagen");
      setMsg("✅ Foto actualizada correctamente");
    } catch {
      setMsg("❌ Error al subir imagen");
    }
  };

  // ======== Actualizar datos ========
  const handleUpdateField = async () => {
    try {
      const payload = {
        nombre: form.nuevoNombre,
        correo: form.nuevoCorreo,
        telefono: form.nuevoTelefono,
        direccion: form.nuevaDireccion,
      };
      const res = await fetch(`${API}/auth/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al actualizar datos");
      setMsg("✅ Datos actualizados correctamente");
    } catch {
      setMsg("❌ Error al actualizar datos");
    }
  };

  // ======== Cambiar contraseña ========
  const handleChangePassword = async () => {
    if (form.nuevaPass !== form.repetirPass) {
      setMsg("⚠️ Las contraseñas no coinciden");
      return;
    }
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  // ======== Estilos ========
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
          <h2 className="text-2xl font-semibold">{usuario.nombre || "Usuario"}</h2>
          <p className="text-white/80">{usuario.correo || "correo@ejemplo.com"}</p>
          <p className="text-white/70 mt-2">
            Teléfono: {usuario.telefono || "—"} <br />
            Dirección: {usuario.direccion || "—"}
          </p>
        </div>
      </section>

      {/* ===== FORMULARIOS ===== */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-[#1a1730]/80 p-6 space-y-6">
          <h3 className="text-xl font-semibold mb-4">Datos personales</h3>

          <div>
            <label className="block mb-2 font-medium">Nombre</label>
            <input
              className={input}
              value={form.nuevoNombre}
              onChange={(e) => setForm({ ...form, nuevoNombre: e.target.value })}
              placeholder="Nuevo nombre"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Correo</label>
            <input
              className={input}
              value={form.nuevoCorreo}
              onChange={(e) => setForm({ ...form, nuevoCorreo: e.target.value })}
              placeholder="Nuevo correo"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Teléfono</label>
            <input
              className={input}
              value={form.nuevoTelefono}
              onChange={(e) => setForm({ ...form, nuevoTelefono: e.target.value })}
              placeholder="Nuevo teléfono"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Dirección</label>
            <input
              className={input}
              value={form.nuevaDireccion}
              onChange={(e) => setForm({ ...form, nuevaDireccion: e.target.value })}
              placeholder="Nueva dirección"
            />
          </div>

          <button className={button} onClick={handleUpdateField}>
            Guardar cambios
          </button>
        </div>

        {/* CAMBIO DE CONTRASEÑA */}
        <div className="rounded-2xl bg-[#1a1730]/80 p-6 space-y-6">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700"
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
              onChange={(e) => setForm({ ...form, repetirPass: e.target.value })}
            />
            <button
              onClick={() => setShowRepeat(!showRepeat)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700"
            >
              {showRepeat ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <button className={button} onClick={handleChangePassword}>
            Cambiar contraseña
          </button>
        </div>
      </section>

      {msg && (
        <div className="mt-6 bg-white/10 text-center text-white/90 px-6 py-3 rounded-xl max-w-2xl mx-auto">
          {msg}
        </div>
      )}
    </div>
  );
}
