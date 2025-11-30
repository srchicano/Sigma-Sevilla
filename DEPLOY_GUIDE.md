# Guía de Despliegue de Sigma-Sevilla

Esta guía detalla cómo poner en producción la aplicación web Sigma-Sevilla utilizando MongoDB Atlas para la base de datos, Render para el Backend (API) y Netlify para el Frontend.

---

## 1. Base de Datos: MongoDB Atlas

1.  Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Crea un nuevo **Cluster** (El gratuito "M0 Sandbox" es suficiente).
3.  En "Database Access", crea un usuario de base de datos con contraseña. (Guarda estas credenciales).
4.  En "Network Access", añade la IP `0.0.0.0/0` para permitir conexiones desde cualquier lugar (necesario para Render).
5.  Ve a tu Cluster y pulsa **Connect** -> **Drivers**.
6.  Copia la cadena de conexión (Connection String). Se verá algo así:
    `mongodb+srv://<usuario>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority`
    Reemplaza `<password>` con tu contraseña real.

---

## 2. Backend: Render

1.  Crea un nuevo repositorio en GitHub (o GitLab) y sube los siguientes archivos **en la raíz**:
    *   `backend_server.js` (Renómbralo a `index.js` en el repo).
    *   `backend_models.js`
    *   `package.json` con el siguiente contenido:
        ```json
        {
          "name": "sigma-backend",
          "version": "1.0.0",
          "main": "index.js",
          "scripts": {
            "start": "node index.js"
          },
          "dependencies": {
            "express": "^4.18.2",
            "mongoose": "^7.0.3",
            "cors": "^2.8.5",
            "dotenv": "^16.0.3"
          }
        }
        ```
2.  Crea una cuenta en [Render](https://render.com/).
3.  Pulsa **New +** y selecciona **Web Service**.
4.  Conecta tu repositorio de GitHub.
5.  Configuración del servicio:
    *   **Environment**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
6.  En la sección **Environment Variables**, añade:
    *   Key: `MONGODB_URI`
    *   Value: (Tu cadena de conexión de MongoDB Atlas copiada en el paso 1).
7.  Pulsa **Create Web Service**.
8.  Espera a que termine el despliegue. Copia la **URL** que te asigna Render (ej: `https://sigma-backend.onrender.com`).

---

## 3. Frontend: Netlify

1.  Sube el código del Frontend (React) a un repositorio de GitHub **diferente** (o una carpeta distinta).
2.  Crea una cuenta en [Netlify](https://www.netlify.com/).
3.  Pulsa **Add new site** -> **Import from existing project**.
4.  Conecta tu GitHub y selecciona el repositorio del frontend.
5.  Configuración de Build:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
6.  Pulsa **Deploy site**.
7.  Una vez creado, ve a **Site configuration** -> **Environment variables**.
8.  Añade las siguientes variables para conectar con tu backend:
    *   Key: `VITE_USE_BACKEND`
    *   Value: `true`
    *   Key: `VITE_API_URL`
    *   Value: (La URL de tu backend en Render, sin la barra final, ej: `https://sigma-backend.onrender.com/api`)
9.  Ve a la pestaña **Deploys** y pulsa **Trigger deploy** para reconstruir la web con las nuevas variables.

---

## 4. Ejecución Local (Pruebas)

Para probar todo en tu ordenador:

**Backend:**
1. Crea una carpeta `backend`.
2. Copia `backend_server.js` (como `index.js`) y `backend_models.js`.
3. Ejecuta `npm init -y` y `npm install express mongoose cors dotenv`.
4. Crea un archivo `.env` y pon: `MONGODB_URI=tu_cadena_mongo`.
5. Ejecuta `node index.js`.

**Frontend:**
1. En la carpeta del proyecto React.
2. Crea un archivo `.env.local`.
3. Añade:
   ```
   VITE_USE_BACKEND=true
   VITE_API_URL=http://localhost:3000/api
   ```
4. Ejecuta `npm run dev`.
