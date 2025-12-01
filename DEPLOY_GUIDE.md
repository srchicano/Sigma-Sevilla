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

1.  Asegúrate de que tu repositorio en GitHub contiene el archivo `package.json` corregido (el que se incluye en este proyecto) y los archivos `backend_server.js` y `backend_models.js`.
2.  Crea una cuenta en [Render](https://render.com/).
3.  Pulsa **New +** y selecciona **Web Service**.
4.  Conecta tu repositorio de GitHub `Sigma-Sevilla`.
5.  Configuración del servicio:
    *   **Environment**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node backend_server.js`
6.  En la sección **Environment Variables**, añade:
    *   Key: `MONGODB_URI`
    *   Value: (Tu cadena de conexión de MongoDB Atlas copiada en el paso 1).
7.  Pulsa **Create Web Service**.
8.  Espera a que termine el despliegue. Si dice "Live", copia la **URL** que te asigna Render (ej: `https://sigma-backend.onrender.com`).

---

## 3. Frontend: Netlify

1.  Crea una cuenta en [Netlify](https://www.netlify.com/).
2.  Pulsa **Add new site** -> **Import from existing project**.
3.  Conecta tu GitHub y selecciona el mismo repositorio `Sigma-Sevilla`.
4.  Configuración de Build:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
5.  Pulsa **Deploy site**.
6.  Una vez creado, ve a **Site configuration** -> **Environment variables**.
7.  Añade las siguientes variables para conectar con tu backend:
    *   Key: `VITE_USE_BACKEND`
    *   Value: `true`
    *   Key: `VITE_API_URL`
    *   Value: (La URL de tu backend en Render que copiaste en el paso 2.8, seguida de `/api`. Ej: `https://sigma-backend.onrender.com/api`)
8.  Ve a la pestaña **Deploys** y pulsa **Trigger deploy** para reconstruir la web con las nuevas variables.

---

## 4. Ejecución Local (Pruebas)

Para probar todo en tu ordenador:

1.  Crea un archivo `.env` en la raíz con:
    ```
    MONGODB_URI=tu_cadena_mongo_real
    ```
2.  Crea un archivo `.env.local` en la raíz con:
    ```
    VITE_USE_BACKEND=true
    VITE_API_URL=http://localhost:3000/api
    ```
3.  Abre dos terminales:
    *   Terminal 1 (Backend): `node backend_server.js`
    *   Terminal 2 (Frontend): `npm run dev`
