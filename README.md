# eiken_web

Sistema de gestión para Eiken Design, desarrollado con el stack PERN (PostgreSQL, Express.js, React, Node.js) y Docker. Incluye backend, frontend y scripts de configuración para despliegue en servidores Linux y Windows.

## Tabla de contenidos
 [Descripción General](#descripción-general)
 [Backend](#backend)
 [Frontend](#frontend)
 [Arquitectura del Proyecto](#arquitectura-del-proyecto)
 [Estructura del Backend](#estructura-del-backend)
 [Estructura del Frontend](#estructura-del-frontend)
 [Instalación y Configuración](#instalación-y-configuración)
   - [Prerrequisitos](#prerrequisitos)
   - [Configuración de PostgreSQL](#configuración-de-postgresql)
   - [Despliegue con Docker](#despliegue-con-docker)
 [Tecnologías](#tecnologías)
 [Otros Recursos y Librerías](#otros-recursos-y-librerías)

---

## Descripción General

Este proyecto es una solución integral para la gestión de proyectos, servicios, cotizaciones, usuarios y clientes en Eiken Design. Permite la administración de datos, autenticación, autorización, carga de imágenes y visualización de información relevante para la empresa.

## Backend

El backend implementa:
- Autenticación y autorización (passport.js, JWT)
- CRUD de usuarios, proyectos, servicios, cotizaciones, clientes, proveedores
- Validaciones y middlewares personalizados
- Conexión a base de datos PostgreSQL
- Configuración por variables de entorno
- API RESTful

## Frontend

El frontend provee:
- Interfaz de usuario moderna con React y Vite
- Páginas para login, dashboard, gestión de proyectos, servicios, cotizaciones, inventario, proveedores y usuarios
- SweetAlert2 para notificaciones y validaciones
- Contexto de autenticación y roles
- Carga y previsualización de imágenes
- Responsive design

## Arquitectura del Proyecto

El proyecto está dividido en dos carpetas principales:
- `backend/`: API y lógica de negocio
- `frontend/`: Interfaz de usuario

### Estructura del Backend
```text
backend/
├── src/
│   ├── auth/
│   ├── config/
│   ├── controllers/
│   ├── entity/
│   ├── handlers/
│   ├── helpers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── validations/
│   └── index.js
├── Dockerfile
├── package.json
└── ...
```

### Estructura del Frontend
```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── helpers/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── main.jsx
├── Dockerfile
├── package.json
└── ...
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 20.x
- Git
- PostgreSQL 14.x o superior
- Docker (opcional, recomendado para despliegue)

### Configuración de PostgreSQL
- Crea la base de datos y usuario según tu archivo `.env`.
- Puedes usar DBeaver, pgAdmin o phpPgAdmin para administrar la base de datos.

### Despliegue con Docker
```bash
docker-compose up --build
```
Esto levantará los servicios de base de datos, backend y frontend.

## Tecnologías
- **PostgreSQL**: Base de datos relacional
- **Express.js**: Framework para Node.js
- **React**: Biblioteca para interfaces de usuario
- **Node.js**: Entorno de ejecución backend
- **Docker**: Contenedores y orquestación
- **Vite**: Bundler y servidor de desarrollo frontend
- **SweetAlert2**: Notificaciones y alertas

## Otros Recursos y Librerías
- **passport.js**: Autenticación
- **bcrypt.js**: Hashing de contraseñas
- **dotenv**: Variables de entorno
- **pm2**: Gestión de procesos Node.js

---

Este proyecto está listo para ser extendido y personalizado según las necesidades de Eiken Design. Para dudas o soporte, contacta al equipo de desarrollo.

---