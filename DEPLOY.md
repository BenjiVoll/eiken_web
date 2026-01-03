# Guía de Despliegue en Debian Bullseye (Sin Docker)

Esta guía detalla los pasos para configurar y desplegar el proyecto "Eiken Web" en un servidor Debian Bullseye utilizando `git`, `npm` y `pm2`.

## 1. Prerrequisitos del Sistema

Asegúrate de tener acceso `root` o privilegios `sudo` en el servidor.

### 1.1 Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar Git y herramientas básicas
```bash
sudo apt install -y git curl build-essential libatomic1 nano
```

### 1.3 Instalar Node.js 20 (LTS)
El proyecto requiere Node.js 20.x.
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
Verificar instalación:
```bash
node -v
# Debería mostrar v20.x.x
npm -v
```

### 1.4 Instalar PostgreSQL 14
```bash
# Instalar repositorio de PostgreSQL
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Instalar PostgreSQL
sudo apt update
sudo apt install -y postgresql-14
```

### 1.5 Instalar PM2 (Gestor de Procesos)
Para mantener la aplicación corriendo en segundo plano.
```bash
sudo npm install -g pm2
```

---

## 2. Configuración de Base de Datos

### 2.1 Iniciar servicio
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.2 Configurar Base de Datos
Accede a la consola de postgres:
```bash
sudo -u postgres psql
```

Asegúrate de configurar la contraseña del usuario `postgres` por defecto:
```sql
ALTER USER postgres WITH PASSWORD 'benjamin2025';
-- La base de datos 'postgres' ya existe por defecto, así que no necesitas crearla.
\q
```

---

## 3. Configuración del Proyecto

### 3.1 Clonar el repositorio
```bash
cd /var/www
sudo mkdir eiken_web
sudo chown $USER:$USER eiken_web
git clone <URL_DEL_REPOSITORIO> eiken_web
cd eiken_web
```

---

## 4. Configuración del Backend

Navega a la carpeta del backend:
```bash
cd backend
```

### 4.1 Instalar dependencias
```bash
npm install
```

### 4.2 Configurar variables de entorno
Crea el archivo `.env` basado en el ejemplo:
```bash
cp src/config/.example.env src/config/.env
nano src/config/.env
```

**Copia y pega el siguiente contenido EXACTO en `src/config/.env`:**

```env
HOST=146.83.194.142
PORT=80
# Credenciales de Base de Datos
DB_USERNAME=postgres
PASSWORD=benjamin2025
DATABASE=postgres
DB_HOST=localhost
DB_PORT=5432

# Secretos de la App (Requeridos para el inicio)
ACCESS_TOKEN_SECRET=e91b415e5bd12526e1fad223b1b8c244
cookieKey=02faa9a6633f361e3a0deeb727b020e5

# Configuración de Correo (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=1870
SMTP_SECURE=true
SMTP_USER=benjivoll@gmail.com
SMTP_PASS=ljgp hobv bocf ivuu
SMTP_FROM="Eiken Design" <benjivoll@gmail.com>
ADMIN_EMAIL=benjivoll@gmail.com

# Integración Mercado Pago
MERCADOPAGO_ACCESS_TOKEN_TEST=APP_USR-5905255067187421-121123-1fb932db5463cf26451f9fed868617f1-3055270498
MERCADOPAGO_PUBLIC_KEY_TEST=APP_USR-c4ec0886-95f6-40db-8fe4-c182be58f494

# URLs de Producción
FRONTEND_URL=http://146.83.194.142:1867
BACKEND_URL=http://146.83.194.142:1866
NODE_ENV=production
```

### 4.3 Iniciar Backend
Prueba que inicie correctamente:
```bash
npm start
```
Si todo está bien, inicia con PM2:
```bash
pm2 start src/index.js --name "eiken-backend"
```

---

## 5. Configuración del Frontend

Navega a la carpeta del frontend:
```bash
cd ../frontend
```

### 5.1 Instalar dependencias
```bash
npm install
```

### 5.2 Configurar URL del Backend
Crea un archivo `.env` en la raíz de `frontend`:
```bash
nano .env
```
Añade lo siguiente:
```env
VITE_BASE_URL=http://146.83.194.142:443/api
```

### 5.3 Ajustar Puerto en vite.config.js
Edita `vite.config.js` para usar el puerto **1867** (según FRONTEND_URL en el backend):

```bash
nano vite.config.js
```
Localiza la sección `preview` y ajústala:
```javascript
  preview: {
    port: 1867, // Puerto Web asignado
    host: true,
    allowedHosts: ['146.83.194.142'] // Permitir este host
  },
```

### 5.4 Construir y Correr
```bash
npm run build
pm2 start npm --name "eiken-frontend" -- run preview
```

---

## 6. Finalización

Guarda la configuración de PM2:
```bash
pm2 save
pm2 startup
```

Tus URLs finales son:
*   **Web / Frontend**: `http://146.83.194.142:1867`
*   **API / Backend**: `http://146.83.194.142:1866` (Referenciado internamente, aunque escuchando en puerto 80 dentro del servidor)

---

## 7. Comandos Útiles de Mantenimiento (PM2)

Aquí tienes los comandos que más usarás para gestionar tu servidor:

### Ver Logs (Para depurar errores)
```bash
# Ver logs de todo en tiempo real
pm2 logs

# Ver logs de un proceso específico
pm2 logs eiken-backend
pm2 logs eiken-frontend

# Ver las últimas 100 líneas
pm2 logs --lines 100
```

### Gestión de Procesos
```bash
# Ver estado de los procesos
pm2 status

# Reiniciar una aplicación (ej: después de un cambio de código)
pm2 restart eiken-backend

# Detener una aplicación
pm2 stop eiken-backend
```

### Limpiar Logs
Si los logs ocupan mucho espacio:
```bash
pm2 flush
```
