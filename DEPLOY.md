# Guía Definitiva de Despliegue: Eiken Web (Producción)

Esta guía explica cómo publicar la aplicación para usuarios reales en un servidor estable y seguro, cubriendo desde la conexión inicial hasta el mantenimiento.

---

## 1. Conceptos y Acceso

### ¿Qué es producción?
Subir a producción significa publicar tu aplicación en un **servidor estable y seguro** para que personas reales la usen. La app debe estar siempre disponible y protegida.

### Herramientas Requeridas
- **OpenVPN**: Crea un túnel seguro a la red de la universidad.
- **Termius**: Cliente SSH para manejar la terminal del servidor.
- **PM2**: Administrador que mantiene la app encendida 24/7.
- **Git**: Para clonar y actualizar el código.

### Datos de Conexión (SSH)
```c
IP: 146.83.198.35
SSH: Puerto 22 (o el asignado de 4 dígitos)
User: <tu_usuario>
Password: <tu_password_root>
```

---

## 2. Preparando el Espacio de Trabajo

> [!IMPORTANT]
> Debes iniciar sesión como administrador con `su` o usar `sudo` para los comandos de instalación.

### Actualización y Dependencias
```bash
apt update && apt upgrade -y
# Dependencias críticas para Node.js y compilación
apt install curl git nano libatomic1 build-essential -y
```

### Instalación de NVM y Node.js LTS
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Cargar NVM sin reiniciar la terminal
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install --lts
nvm use --lts
```

### Gestión de Procesos (PM2)
```bash
npm install pm2@latest -g
```

---

## 3. Configuración del Backend

### Paso 1. Instalación
```bash
cd backend/
npm install
```

### Paso 2. Variables de Entorno (.env)
Entra a `backend/src/config/`:
```bash
cd src/config/
nano .env
```

Copia y ajusta el siguiente contenido (reemplaza con tus credenciales):
```env
HOST=146.83.198.35
PORT=80
# DB_HOST=127.0.0.1 (Recomendado para local)
DB_HOST=146.83.194.142 
DB_PORT=1868
DB_USERNAME=postgres
PASSWORD=tu_contraseña_aqui
DATABASE=postgres
ACCESS_TOKEN_SECRET=un_string_random_largo
cookieKey=otro_string_random
```

### Paso 3. Levantar Proceso
```bash
cd ../../
pm2 start src/index.js --name "eiken-backend"
```

---

## 4. Configuración del Frontend

### Paso 1. Instalación
```bash
cd ../frontend/
npm install
```

### Paso 2. Crear el archivo .env
```bash
nano .env
```

### Paso 3. Configurar la URL base
Dentro del archivo `.env`, agrega la dirección del backend.
**Recordar reemplazar el puerto por el correspondiente a su grupo (80 -> 4 dígitos):**
```bash
VITE_BASE_URL=http://146.83.198.35:<Puerto 80 -> 4 dígitos>/api
```
*Ejemplo: `VITE_BASE_URL=http://146.83.198.35:8085/api`*

### Paso 4. Construir el Frontend
```bash
npm run build
```
Esto genera la carpeta `dist/` con la versión optimizada.

### Paso 5. Iniciar con PM2
```bash
pm2 start npm --name "eiken-frontend" -- run preview
```

---

## 5. Pruebas y Mantenimiento

### Probar en el Navegador
Ingresa la IP con el puerto asignado para la web (443 -> 4 dígitos):
`http://146.83.198.35:<Puerto 443 -> 4 dígitos>`

### Pruebas con Postman (API)
`http://146.83.198.35:<Puerto 80 -> 4 dígitos>/api`

### Persistencia y Resurrección
```bash
pm2 save      # Guarda los procesos para el reinicio
pm2 resurrect # Restaura procesos si el servidor físico se cae
pm2 startup   # Configura el inicio automático al bootear
```

### Resetear el Contenedor (Limpieza)
Si necesitas empezar de cero o entregar el espacio:
```bash
# 1. Borrar código
cd ~
rm -rf <nombre_del_directorio>

# 2. Detener procesos
pm2 delete all
pm2 flush

# 3. Limpiar Base de Datos (desde DBeaver/pgAdmin)
```

---

## 6. Comandos Rápidos de PM2
- `pm2 status`: Listar estados.
- `pm2 logs`: Ver errores en tiempo real.
- `pm2 restart all`: Reiniciar todo.
- `pm2 stop <id o name>`: Parar una aplicación específica.
