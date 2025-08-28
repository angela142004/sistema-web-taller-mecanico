# ⚙️ Sistema Web para Taller Mecánico  
React · Tailwind CSS · Node.js · Express · Prisma · PostgreSQL · GitHub Actions  
License: MIT · Code Style: ESLint + Prettier  

Sistema web para la gestión de un taller mecánico — desarrollado como proyecto integrador de Ingeniería de Sistemas.  

---

## 🌟 Overview
Este sistema permite a un taller mecánico **gestionar clientes, vehículos, servicios y repuestos**, mejorando el control interno y ofreciendo una experiencia más transparente a los clientes. Incluye un backend robusto con Express y Prisma, un frontend responsivo con React + Tailwind, y automatización CI con GitHub Actions.  

---

## 🎯 Objetivos del Proyecto
- **Operativo:** Optimizar la gestión de servicios, inventario y facturación del taller.  
- **Técnico:** Implementar un stack moderno (MERN-like con PostgreSQL) con buenas prácticas de desarrollo.  
- **Profesional:** Desarrollar un sistema escalable y documentado, integrando CI/CD con GitHub Actions.  

---

## 🛠️ Funcionalidades Principales
- 📋 **Registro de servicios**: clientes, vehículos, repuestos usados, costos, fechas.  
- 🛠️ **Asignación de tareas** a mecánicos según disponibilidad y especialidad.  
- 📦 **Inventario de repuestos** con alertas de stock bajo.  
- 💵 **Módulo de cotizaciones y facturación**.  
- 📊 **Reportes automáticos** (ingresos mensuales, servicios más solicitados, clientes frecuentes).  
- 🌐 **Portal de clientes** para consultar estado de su vehículo en línea.  
- 🔔 **Notificaciones**: vehículo listo, mantenimientos pendientes, stock bajo.  

---

## 🚀 Quick Start
### Prerequisitos
- Node.js 18+  
- PostgreSQL 15+  
- Git  

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/usuario/sistema-web-taller-mecanico.git
cd sistema-web-taller-mecanico

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

---
```
## 📁 Estructura del Proyecto
```bash
sistema-web-taller-mecanico/
├── backend/ # API Node.js + Express + Prisma + PostgreSQL
│ ├── prisma/ # schema.prisma, migraciones
│ ├── src/
│ │ ├── routes/
│ │ ├── controllers/
│ │ └── app.js
│ └── package.json
│
├── frontend/ # Interfaz en React + Tailwind
│ ├── src/
│ │ ├── assets/
│ │ ├── components/
│ │ └── App.jsx
│ └── package.json
│
├── .github/workflows/ # CI con GitHub Actions
│ └── ci.yml
└── README.md # Documentación principal


---
```

## 🛠️ Tech Stack
| Categoría   | Tecnología       | Versión | Propósito              |
|-------------|-----------------|---------|------------------------|
| Frontend    | React + Vite    | 18+     | Interfaz de usuario    |
| Estilos     | Tailwind CSS    | v4      | Diseño responsivo      |
| Backend     | Node.js + Express | 18+   | API REST               |
| ORM         | Prisma          | Latest  | Conexión con BD        |
| Base de Datos | PostgreSQL    | 15+     | Almacenamiento         |
| DevOps      | GitHub Actions  | Latest  | CI/CD                  |
| Code Style  | ESLint + Prettier | Latest | Estilo y calidad de código |

---

## 🤝 Equipo de Desarrollo
| Nombre                           | Rol                 | Contribución                           |
|----------------------------------|---------------------|----------------------------------------|
| Quispe Romani Angela Isabel      | Fullstack Developer | Frontend + Backend + CI/CD + BD        |
| Fernandez Asto Jhossep Dilson    | Backend Developer   | Backend + BD                           |
| Castañeda Caycho Gian Marco      | Frontend Developer  | Frontend + CI/CD                       |
| Mateo Chumpitaz Mariana Elizabeth | Tester de Software | Diseñar, ejecutar y documentar pruebas |

---

## 📄 Licencia
Este proyecto está bajo la **Licencia MIT** — ver archivo `LICENSE` para más detalles.  

---

## ⭐ Reconocimientos
Proyecto académico RSU — Ingeniería de Sistemas, Universidad Nacional de Cañete  
📚 — 2025-II 

