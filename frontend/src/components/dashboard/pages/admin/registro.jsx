import { useState, useMemo } from "react";
import { Users, Wrench, Settings, Search, Edit2, Trash2, XCircle, CheckCircle, PlusCircle } from "lucide-react";

// Datos simulados (sin 'estado' ni 'rol')
const initialUsuarios = {
  cliente: [
    { id: 1, nombre: "Juan Pérez", correo: "juan.perez@ejemplo.com", telefono: "123-456-7890", direccion: "Av. Los Olivos 123" },
    { id: 2, nombre: "Ana García", correo: "ana.garcia@ejemplo.com", telefono: "098-765-4321", direccion: "Av. Miraflores 456" },
    { id: 3, nombre: "Luis Soto", correo: "luis.soto@ejemplo.com", telefono: "555-111-2222", direccion: "Calle Central 789" },
  ],
  mecanico: [
    { id: 101, nombre: "Carlos López", correo: "carlos.lopez@ejemplo.com", telefono: "999-999-9999", especialidad: "Motor", fechaIngreso: "2022-05-15" },
    { id: 102, nombre: "Sofía Díaz", correo: "sofia.diaz@ejemplo.com", telefono: "988-888-8888", especialidad: "Frenos", fechaIngreso: "2021-08-10" },
    { id: 103, nombre: "Ricardo Vega", correo: "ricardo.vega@ejemplo.com", telefono: "777-777-7777", especialidad: "Eléctrico", fechaIngreso: "2023-01-20" },
  ],
  administrador: [
    { id: 201, nombre: "María González", correo: "maria.gonzalez@ejemplo.com" },
    { id: 202, nombre: "Pedro Jiménez", correo: "pedro.jimenez@ejemplo.com" },
  ]
};

// Componente para la notificación de acción
const ActionNotification = ({ message, type, onClose }) => {
  if (!message) return null;

  const icon = type === 'success' ? <CheckCircle size={20} className="text-green-400" /> : <XCircle size={20} className="text-red-400" />;
  const baseClass = type === 'success' ? 'bg-green-800/20 border-green-700' : 'bg-red-800/20 border-red-700';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 transition-opacity duration-300 ${baseClass}`}>
      {icon}
      <p className="text-white font-medium">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-white">
        <XCircle size={18} />
      </button>
    </div>
  );
};

// --- Componente de Modal para Agregar/Editar Cuenta ---
const UserModal = ({ isOpen, onClose, user, userType, onSave }) => {
  const isEditing = !!user;
  const title = isEditing ? `Editar Cuenta (${user.nombre})` : `Agregar Nueva Cuenta de ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
  
  const [formData, setFormData] = useState(user || {});
  
  useMemo(() => {
      setFormData(user || {});
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, isEditing);
    onClose();
  };
  
  if (!isOpen) return null;
  
  // Definición de campos de formulario (sin 'estado' ni 'rol')
  const formFields = [
      { name: 'nombre', label: 'Nombre Completo', type: 'text', required: true },
      { name: 'correo', label: 'Correo Electrónico', type: 'email', required: true },
      // Campos específicos para Cliente
      ...(userType === 'cliente' ? [
          { name: 'telefono', label: 'Teléfono', type: 'tel' },
          { name: 'direccion', label: 'Dirección', type: 'text' },
      ] : []),
      // Campos específicos para Mecánico
      ...(userType === 'mecanico' ? [
          { name: 'telefono', label: 'Teléfono', type: 'tel' },
          { name: 'especialidad', label: 'Especialidad', type: 'text' },
          { name: 'fechaIngreso', label: 'Fecha de Ingreso', type: 'date' },
      ] : []),
      // Campos específicos para Administrador (sólo quedan los comunes)
      ...(userType === 'administrador' ? [
          // No hay campos específicos restantes
      ] : []),
  ];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-[#1b223b] p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <XCircle size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields.map(field => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-300 mb-1">
                {field.label}{field.required ? ' *' : ''}
              </label>
              <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  // Usar una cadena vacía si el valor es undefined, para evitar advertencias de React
                  value={formData[field.name] || ''} 
                  onChange={handleChange}
                  required={field.required}
                  className="w-full p-2 bg-[#13182b] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- FIN Componente de Modal ---


export default function App() {
  const [selectedTab, setSelectedTab] = useState("cliente");
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const tabIcons = {
    cliente: Users,
    mecanico: Wrench,
    administrador: Settings,
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };
  
  const handleOpenAddModal = () => {
      setUserToEdit(null);
      setIsModalOpen(true);
  }

  const handleOpenEditModal = (user) => {
      setUserToEdit(user);
      setIsModalOpen(true);
  }

  const handleSaveUser = (data, isEditing) => {
    if (isEditing) {
        setUsuarios(prev => ({
            ...prev,
            [selectedTab]: prev[selectedTab].map(u => u.id === data.id ? data : u)
        }));
        showNotification(`Cuenta de ${data.nombre} editada exitosamente.`, 'success');
    } else {
        const newUser = {
            ...data,
            id: Date.now(),
        };
        setUsuarios(prev => ({
            ...prev,
            [selectedTab]: [...prev[selectedTab], newUser]
        }));
        showNotification(`Nueva cuenta de ${selectedTab} agregada exitosamente.`, 'success');
    }
  }

  const handleDelete = (user) => {
    showNotification(`Simulando Eliminación de ${user.nombre} (ID: ${user.id})...`, 'error');
  };

  // Estructura de columnas para la tabla (sin 'estado' ni 'rol')
  const columns = useMemo(() => {
    const common = [
      { key: 'id', header: 'ID', isMobile: true },
      { key: 'nombre', header: 'Nombre', isMobile: true },
      { key: 'correo', header: 'Correo', isMobile: true },
    ];
    
    if (selectedTab === 'cliente') {
      return [
        ...common,
        { key: 'telefono', header: 'Teléfono', isMobile: false },
        { key: 'direccion', header: 'Dirección', isMobile: false },
      ];
    }
    if (selectedTab === 'mecanico') {
      return [
        ...common,
        { key: 'telefono', header: 'Teléfono', isMobile: false },
        { key: 'especialidad', header: 'Especialidad', isMobile: true },
        { key: 'fechaIngreso', header: 'Ingreso', isMobile: false },
      ];
    }
    if (selectedTab === 'administrador') {
      return common; // Solo ID, Nombre, Correo
    }
    return common;
  }, [selectedTab]);

  const filteredUsuarios = useMemo(() => {
    const currentUsers = usuarios[selectedTab] || [];
    if (!searchTerm) return currentUsers;
    const lowerCaseSearch = searchTerm.toLowerCase();

    return currentUsers.filter(user =>
      Object.values(user).some(value =>
        String(value).toLowerCase().includes(lowerCaseSearch)
      )
    );
  }, [selectedTab, usuarios, searchTerm]);

  // --- Componentes Reutilizables de UI ---

  const TabButton = ({ tab, label, Icon }) => {
    const isActive = selectedTab === tab;
    return (
      <button
        className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm md:text-base font-semibold shadow-md
          ${isActive ? "bg-blue-600 text-white shadow-blue-500/50" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
        onClick={() => setSelectedTab(tab)}
      >
        <Icon size={20} />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  const ActionButtons = ({ user }) => (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleOpenEditModal(user)}
        title="Editar Cuenta"
        className="p-1.5 rounded-full text-blue-400 bg-blue-900/50 hover:bg-blue-800 transition-colors"
      >
        <Edit2 size={18} />
      </button>
      <button
        onClick={() => handleDelete(user)}
        title="Eliminar"
        className="p-1.5 rounded-full text-red-400 bg-red-900/50 hover:bg-red-800 transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );

  // --- Vista Mobile (Tarjetas) ---

  const MobileCardList = () => (
    <div className="space-y-4 sm:hidden">
      {filteredUsuarios.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No se encontraron usuarios para este filtro.</p>
      ) : (
        filteredUsuarios.map(user => (
          <div key={user.id} className="bg-[#1b223b] p-4 rounded-xl shadow-lg border border-[#2c3451]">
            <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-2">
              <h4 className="text-lg font-bold text-white truncate">{user.nombre}</h4>
              <p className="text-sm font-light text-gray-400">ID: {user.id}</p>
            </div>
            
            <div className="space-y-1 text-sm">
              {/* Renderiza los campos marcados como isMobile: true */}
              {columns.filter(col => col.isMobile).map(col => (
                <div key={col.key} className="flex justify-between">
                  <span className="text-gray-400 font-medium">{col.header}:</span>
                  <span className="text-gray-200">
                    {user[col.key]}
                  </span>
                </div>
              ))}
              
              {/* Campos comunes adicionales para mobile */}
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Correo:</span>
                <span className="text-blue-400 hover:underline">{user.correo}</span>
              </div>
              {user.telefono && (
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Teléfono:</span>
                  <span className="text-gray-200">{user.telefono}</span>
                </div>
              )}
              {user.especialidad && (
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Especialidad:</span>
                  <span className="text-gray-200">{user.especialidad}</span>
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-gray-700 flex justify-end">
              <ActionButtons user={user} />
            </div>
          </div>
        ))
      )}
    </div>
  );

  // --- Vista Desktop/Tablet (Tabla Completa) ---

  const DesktopTable = () => (
    <div className="hidden sm:block overflow-x-auto">
      <table className="min-w-full table-auto text-white divide-y divide-[#444f68]">
        <thead>
          <tr className="bg-[#2c3451] uppercase text-xs tracking-wider">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 font-bold text-left whitespace-nowrap rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg">
                {col.header}
              </th>
            ))}
            <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#444f68]">
          {filteredUsuarios.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center text-gray-400 py-6">
                No se encontraron usuarios para el término de búsqueda.
              </td>
            </tr>
          ) : (
            filteredUsuarios.map((user, index) => (
              <tr key={user.id} className={`${index % 2 === 0 ? 'bg-[#1b223b]' : 'bg-[#13182b]'} hover:bg-[#2c3451] transition-colors`}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap">
                    {user[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <ActionButtons user={user} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // --- Componente Principal ---

  const IconComponent = tabIcons[selectedTab];

  return (
    <div className=" min-h-screen p-4 sm:p-6 font-[Inter]">
      {/* Notificación de Acción */}
      <ActionNotification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />

      {/* Modal de Agregar/Editar Cuenta */}
      <UserModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          user={userToEdit} 
          userType={selectedTab} 
          onSave={handleSaveUser} 
      />

      <h1 className="text-4xl font-extrabold text-white mb-8 text-center sm:text-left">
        <IconComponent size={32} className="inline mr-3 text-blue-400" />
        Gestión de Usuarios
      </h1>

      {/* Botones de pestañas */}
      <div className="flex justify-center sm:justify-start gap-2 sm:gap-4 mb-8 flex-wrap">
        <TabButton tab="cliente" label="Clientes" Icon={Users} />
        <TabButton tab="mecanico" label="Mecánicos" Icon={Wrench} />
        <TabButton tab="administrador" label="Administradores" Icon={Settings} />
      </div>

      {/* Contenedor del Listado */}
      <div className="bg-[#1b223b] p-4 sm:p-6 rounded-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl text-white font-semibold flex items-center gap-2">
            <IconComponent size={24} className="text-blue-400" />
            Listado de {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}s
          </h2>
          
          {/* Barra de búsqueda */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Buscar en ${selectedTab}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#13182b] p-3 pl-10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        {/* Vistas Responsive */}
        <MobileCardList />
        <DesktopTable />

        {/* Botón para añadir cuenta */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            <PlusCircle size={20} />
            Añadir Cuenta
          </button>
        </div>
      </div>
    </div>
  );
}