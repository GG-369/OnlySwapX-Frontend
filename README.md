# OnlySwapX Frontend Web

Frontend web de OnlySwapX desarrollado con React, TypeScript y Vite. Incluye la interfaz para usuarios y administradores, autenticacion, exploracion de skills, gestion de intercambios, sesiones, mensajes, reviews y panel administrativo.

## Requisitos

- Node.js 20 o superior recomendado
- npm
- Backend de OnlySwapX corriendo en local

## Configuracion

Crear un archivo `.env` en la raiz del frontend:

```env
VITE_API_URL=http://localhost:8080
```

> No subir el archivo `.env` al repositorio. Solo se sube `.env.example`.

## Instalar dependencias

Desde la raiz del frontend:

```bash
npm install
```

## Ejecutar en local

```bash
npm run dev
```

Normalmente Vite levanta la aplicacion en:

```txt
http://localhost:5173
```

## Compilar

```bash
npm run build
```

## Vista previa de produccion

```bash
npm run preview
```

## Funcionalidades principales

- Registro e inicio de sesion.
- Flujo de verificacion OTP/MFA.
- Manejo de tokens y refresh token.
- Busqueda y filtrado de skills.
- Creacion y administracion de offers y wants.
- Matches e intercambios.
- Sesiones y reservas.
- Mensajeria.
- Reviews y ratings.
- Panel web de administracion.
- Gestion de usuarios, roles, administradores y recursos.

## Variables importantes

| Variable | Descripcion |
| --- | --- |
| `VITE_API_URL` | URL base del backend |

## Notas para demo

- El backend debe estar corriendo antes de usar el frontend.
- Si el backend esta local, usar `http://localhost:8080`.
- Si se prueba desde otro dispositivo o red, usar la IP correcta del equipo donde corre el backend.

