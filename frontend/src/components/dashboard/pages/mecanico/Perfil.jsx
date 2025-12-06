import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4001";

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

  // ======== Cargar datos usuario desde backend ========
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

      const res = await fetch(`${API}/mecanica/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al obtener usuario");
      const data = await res.json();

      console.log("Usuario cargado:", data);

      setUsuario(data);

      // === LÓGICA DE FOTO: Si existe, construimos la URL completa ===
      if (data.foto) {
        setPreview(`${API}/uploads/${data.foto}`);
      } else {
        setPreview("/default-avatar.png");
      }

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
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ======== Seleccionar foto (Vista previa local) ========
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ======== Subir foto al Backend ========
  const handleUploadPhoto = async () => {
    // 1. Verificar que haya una imagen seleccionada
    if (!selectedFile) return alert("Selecciona una imagen primero");

    // 2. Obtener el token para tener permiso
    const token = localStorage.getItem("token") || "";

    // 3. Crear el paquete de datos (FormData)
    const formData = new FormData();
    // ✅ IMPORTANTE: El nombre "foto" aquí debe coincidir exactamente
    // con lo que pusimos en el backend: upload.single("foto")
    formData.append("foto", selectedFile);

    try {
      setMsg("⏳ Subiendo imagen..."); // Feedback visual

      // ✅ 4. LA RUTA CORRECTA
      // Basado en tu index.js (app.use("/mecanica", userRoutes))
      // y tu user.routes.js (router.post("/upload-photo", ...))
      const res = await fetch(`${API}/mecanica/upload-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ✅ OJO: NO agregar "Content-Type": "application/json" aquí.
          // fetch lo detecta automáticamente al usar FormData. Si lo pones, falla.
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al subir imagen");
      }

      const data = await res.json();

      // 5. Éxito: Actualizar la vista con la URL real del servidor
      // Ahora la imagen viene de http://localhost:4001/uploads/....
      setPreview(`${API}/uploads/${data.foto}`);
      setMsg("✅ Foto actualizada correctamente");
      setSelectedFile(null); // Limpiamos la selección

      // ✅ 6. Actualizar el localStorage para que el Topbar se entere
      const userStored = JSON.parse(localStorage.getItem("user")) || {};
      userStored.foto = data.foto; // Guardamos el nuevo nombre de archivo
      localStorage.setItem("user", JSON.stringify(userStored));

      // Opcional: Disparar un evento para avisar al Topbar que recargue (si fuera necesario)
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error(error);
      setMsg(`❌ Error: ${error.message}`);
    }
  };

  // ======== Actualizar campos usuario ========
  const handleUpdateField = async () => {
    const token = localStorage.getItem("token") || "";
    const userStored = JSON.parse(localStorage.getItem("user")) || {};
    const userId = userStored.id_usuario || localStorage.getItem("id_usuario");

    if (!userId) {
      setMsg("❌ Error: No se identifica el usuario.");
      return;
    }

    try {
      const payload = {
        nombre: form.nuevoNombre,
        correo: form.nuevoCorreo,
        telefono: form.nuevoTelefono,
        direccion: form.nuevaDireccion,
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

  // ======== Cambiar contraseña ========
  const handleChangePassword = async () => {
    const token = localStorage.getItem("token") || "";
    const userStored = JSON.parse(localStorage.getItem("user")) || {};
    const userId = userStored.id_usuario || localStorage.getItem("id_usuario");

    if (!userId) {
      setMsg("❌ Error: No se identifica el usuario.");
      return;
    }

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
            }} // Si falla la carga, poner default
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
            {usuario.nombre || "Cargando..."}
          </h2>
          <p className="text-white/80">{usuario.correo || "..."}</p>
          <p className="text-white/70 mt-2">
            Teléfono: {usuario.telefono || "—"} <br />
            Dirección: {usuario.direccion || "—"}
          </p>
        </div>
      </section>

      {/* ===== EDITAR INFORMACIÓN ===== */}
      <section className="w-full rounded-2xl bg-[#1a1730]/80 p-8 shadow-md space-y-4">
        <h3 className="text-xl font-semibold">Actualizar datos personales</h3>
        <input
          className={input}
          placeholder="Nuevo nombre"
          value={form.nuevoNombre}
          onChange={(e) => setForm({ ...form, nuevoNombre: e.target.value })}
        />
        <input
          className={input}
          placeholder="Nuevo correo"
          value={form.nuevoCorreo}
          onChange={(e) => setForm({ ...form, nuevoCorreo: e.target.value })}
        />
        <input
          className={input}
          placeholder="Nuevo teléfono"
          value={form.nuevoTelefono}
          onChange={(e) => setForm({ ...form, nuevoTelefono: e.target.value })}
        />
        <input
          className={input}
          placeholder="Nueva dirección"
          value={form.nuevaDireccion}
          onChange={(e) => setForm({ ...form, nuevaDireccion: e.target.value })}
        />
        <button onClick={handleUpdateField} className={button}>
          Guardar cambios
        </button>
      </section>

      {/* ===== CAMBIAR CONTRASEÑA ===== */}
      <section className="w-full rounded-2xl bg-[#1a1730]/80 p-8 shadow-md space-y-4">
        <h3 className="text-xl font-semibold">Cambiar contraseña</h3>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            className={input}
            placeholder="Nueva contraseña"
            value={form.nuevaPass}
            onChange={(e) => setForm({ ...form, nuevaPass: e.target.value })}
          />
          <span
            className="absolute right-4 top-4 cursor-pointer"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? (
              <EyeOff className="text-gray-500" />
            ) : (
              <Eye className="text-gray-500" />
            )}
          </span>
        </div>
        <div className="relative">
          <input
            type={showRepeat ? "text" : "password"}
            className={input}
            placeholder="Repetir contraseña"
            value={form.repetirPass}
            onChange={(e) => setForm({ ...form, repetirPass: e.target.value })}
          />
          <span
            className="absolute right-4 top-4 cursor-pointer"
            onClick={() => setShowRepeat(!showRepeat)}
          >
            {showRepeat ? (
              <EyeOff className="text-gray-500" />
            ) : (
              <Eye className="text-gray-500" />
            )}
          </span>
        </div>
        <button onClick={handleChangePassword} className={button}>
          Actualizar contraseña
        </button>
      </section>

      <p className="text-center text-sm mt-4 text-white/80">{msg}</p>
    </div>
  );
}
