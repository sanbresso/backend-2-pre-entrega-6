# Plataforma de Eventos e Inscripciones

## Pre-entrega 6 — Entidad Events y lógica de negocio

Proyecto de **PBE II — Diseño y Arquitectura Backend (Coderhouse)** desarrollado con Node.js, Express, MongoDB Atlas y Mongoose.

Esta entrega continúa el proyecto iniciado en la Pre-entrega 1 e incorpora el CRUD de eventos solicitado, validaciones de negocio, control de permisos por roles y propiedad, filtros avanzados, paginación, ordenamiento y cancelación lógica.

## 1. Evolución del proyecto

- **Pre-entrega 1:** arquitectura modular con Express, modelos y rutas iniciales.
- **Pre-entrega 2:** registro de usuarios, bcrypt, validaciones y persistencia en MongoDB.
- **Pre-entrega 3:** autenticación JWT, cookies HttpOnly, sesión actual y logout.
- **Pre-entrega 4:** estrategias Passport.js `register`, `login` y `current`.
- **Pre-entrega 5:** autorización por roles (RBAC), control de propiedad de eventos y rutas administrativas.
- **Pre-entrega 6:** modelo Event completo, reglas de negocio, endpoints de gestión, filtros, paginación, ordenamiento y control de estados.

## 2. Tecnologías utilizadas

- Node.js y JavaScript ES Modules.
- Express 5.
- MongoDB Atlas y Mongoose.
- Passport.js, passport-local y passport-jwt.
- JSON Web Tokens (JWT).
- bcrypt.
- cookie-parser.
- dotenv.
- Postman para pruebas manuales.
- Git y GitHub.

## 3. Instalación y ejecución

### Clonar el repositorio

```bash
git clone https://github.com/sanbresso/backend-2-pre-entrega-6.git
cd backend-2-pre-entrega-6
```

### Instalar dependencias

```bash
npm install
```

### Configurar variables de entorno

Crear un archivo `.env` a partir de `.env.example` y configurar los valores correspondientes:

```dotenv
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb+srv://USUARIO:CONTRASENA@TU_CLUSTER.mongodb.net/plataforma_eventos
JWT_SECRET=REEMPLAZAR_POR_CLAVE_SECRETA_SEGURA
JWT_EXPIRES_IN=1h
```

Las variables deben adaptarse al entorno y a la conexión MongoDB correspondiente.

### Iniciar el servidor

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

El script de desarrollo utiliza `node --watch src/server.js`.

URL base utilizada en las pruebas:

`http://localhost:8080`

**Seguridad:** nunca publicar `.env`, contraseñas, tokens JWT, credenciales de MongoDB ni `node_modules`.

## 4. Arquitectura

El proyecto utiliza una arquitectura modular que separa responsabilidades:

```text
src/
├── app.js
├── server.js
├── config/
│   ├── db.js
│   └── passport.config.js
├── models/
│   ├── User.js
│   └── Event.js
├── routes/
│   ├── health.router.js
│   ├── sessions.router.js
│   ├── events.router.js
│   └── admin.router.js
├── controllers/
│   ├── health.controller.js
│   ├── sessions.controller.js
│   ├── events.controller.js
│   └── admin.controller.js
├── services/
│   ├── sessions.service.js
│   └── events.service.js
├── repositories/
│   ├── users.repository.js
│   └── events.repository.js
├── dao/
│   └── users.dao.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   ├── eventOwnership.middleware.js
│   ├── optionalAuth.middleware.js
│   └── error.middleware.js
└── utils/
    ├── hash.js
    └── jwt.js
```

### Responsabilidades

- **Models:** esquemas de datos y validaciones de Mongoose.
- **Repositories/DAO:** operaciones de persistencia y consulta a MongoDB.
- **Services:** reglas de negocio, validaciones, visibilidad y transiciones de estado.
- **Controllers:** manejo de solicitudes y respuestas HTTP.
- **Routes:** definición de endpoints y aplicación de middlewares.
- **Middlewares:** autenticación, autorización, propiedad y manejo de errores.

## 5. Modelo Event

El modelo Event contiene los siguientes campos:

| Campo | Tipo | Validación |
|---|---|---|
| title | String | Obligatorio |
| description | String | Obligatorio |
| category | String | Obligatorio |
| date | Date | Obligatorio |
| location | String | Obligatorio |
| capacity | Number | Entero mayor que 0 |
| price | Number | Mayor o igual a 0 |
| status | String | Enum de estados permitidos |
| organizer | ObjectId | Referencia obligatoria a User |

El campo `organizer` utiliza una referencia de Mongoose:

```javascript
organizer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  immutable: true
}
```

No se almacena el objeto completo del usuario dentro del evento.

Todos los eventos se crean inicialmente con estado `draft`.

Estados permitidos:

- `draft`: borrador.
- `published`: publicado.
- `cancelled`: cancelado.
- `finished`: finalizado.

El esquema también incorpora `timestamps` para registrar las fechas de creación y actualización.

## 6. Usuarios, autenticación y roles

El modelo User contiene nombre, apellido, email, contraseña protegida y rol.

Los roles disponibles son:

- `user`
- `organizer`
- `admin`

El registro público asigna automáticamente el rol `user`, sin permitir que el cliente se otorgue permisos superiores.

Las contraseñas se almacenan mediante hash bcrypt.

La autenticación utiliza JWT guardado en la cookie HttpOnly `currentUser`.

### Endpoints de sesiones

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/sessions` | Público |
| POST | `/api/sessions/register` | Público |
| POST | `/api/sessions/login` | Público |
| GET | `/api/sessions/current` | Autenticado |
| POST | `/api/sessions/logout` | Público |

### Registro

`POST /api/sessions/register`

```json
{
  "first_name": "Usuario",
  "last_name": "Ejemplo",
  "email": "usuario@example.com",
  "password": "ClaveDePrueba123!"
}
```

La contraseña debe tener al menos ocho caracteres.

### Inicio de sesión

`POST /api/sessions/login`

```json
{
  "email": "usuario@example.com",
  "password": "ClaveDePrueba123!"
}
```

Respuesta exitosa:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

El backend establece la cookie `currentUser`, que posteriormente se utiliza para autenticar solicitudes protegidas.

## 7. Endpoints de eventos

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/events` | organizer o admin |
| GET | `/api/events` | Público |
| GET | `/api/events/:id` | Público, con visibilidad controlada |
| PUT | `/api/events/:id` | Organizador propietario o admin |
| PATCH | `/api/events/:id/status` | Organizador propietario o admin |

No se implementa eliminación física de eventos. Las cancelaciones se realizan mediante cambio de estado.

### Crear evento

`POST /api/events`

Requiere autenticación y rol `organizer` o `admin`.

Ejemplo:

```json
{
  "title": "Workshop de Backend",
  "description": "Taller práctico de Node.js y Express",
  "category": "workshop",
  "date": "2030-12-15T18:00:00.000Z",
  "location": "Montevideo",
  "capacity": 30,
  "price": 500
}
```

Respuesta: `201 Created`.

El organizador se obtiene automáticamente de `req.user.id`.

No se permite enviar manualmente `organizer` ni `status` en el body de creación.

### Listar eventos

`GET /api/events`

El listado utiliza filtros dinámicos, paginación y ordenamiento.

#### Parámetros disponibles

| Parámetro | Descripción |
|---|---|
| status | Filtrar por estado |
| category | Filtrar por categoría |
| location | Buscar por ubicación, de forma parcial |
| dateFrom | Fecha mínima |
| dateTo | Fecha máxima |
| page | Número de página, predeterminado 1 |
| limit | Resultados por página, predeterminado 10 |
| sort | Campo y dirección de ordenamiento |

El límite máximo por página es 100.

Campos permitidos para ordenar:

- `date`
- `price`
- `title`
- `createdAt`

Se utiliza el prefijo `-` para el orden descendente.

Ejemplo:

```http
GET /api/events?status=published&category=workshop&page=1&limit=5&sort=-date
```

Respuesta ilustrativa:

```json
{
  "data": [],
  "page": 1,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

El contenido de `data` y los totales dependen de los eventos existentes.

### Visibilidad de eventos

Las consultas están condicionadas por los permisos:

| Usuario | Visibilidad |
|---|---|
| Visitante | Eventos publicados |
| user | Eventos publicados |
| organizer | Eventos publicados y sus propios eventos |
| admin | Todos los eventos |

El listado utiliza autenticación opcional.

Un visitante puede consultar eventos publicados sin iniciar sesión, pero no puede acceder a borradores, cancelados o finalizados mediante el filtro por estado.

### Consultar evento por ID

`GET /api/events/:id`

La respuesta exitosa utiliza:

```json
{
  "status": "success",
  "payload": {
    "_id": "ID_DEL_EVENTO",
    "title": "Workshop de Backend",
    "status": "published"
  }
}
```

El ejemplo muestra los campos principales.

Los organizadores pueden consultar sus propios borradores y los administradores pueden consultar eventos de cualquier estado.

Cuando un visitante intenta consultar un evento privado, el servicio responde `404 Not Found`, evitando revelar su existencia.

### Actualizar evento

`PUT /api/events/:id`

Requiere autenticación.

Solo pueden actualizarlo:

- El organizador propietario.
- Un administrador.

Ejemplo:

```json
{
  "title": "Workshop de Backend Avanzado",
  "capacity": 50,
  "price": 750
}
```

La implementación admite actualizaciones parciales de campos permitidos mediante PUT.

Campos modificables:

- title
- description
- category
- location
- date
- capacity
- price

No pueden modificarse `organizer` ni `status` mediante este endpoint.

Los eventos cancelados o finalizados no admiten modificaciones.

### Cambiar estado

`PATCH /api/events/:id/status`

Requiere autenticación y autorización sobre el evento.

Ejemplo:

```json
{
  "status": "published"
}
```

La transición debe respetar las reglas de negocio.

## 8. Reglas de negocio

### Validaciones de creación

- El título, descripción, categoría y ubicación son obligatorios.
- No se permiten campos de texto obligatorios vacíos.
- La fecha debe ser válida y futura.
- La capacidad debe ser un entero mayor que cero.
- El precio debe ser un número mayor o igual que cero.
- El organizador se asigna automáticamente.
- El estado inicial siempre es `draft`.

### Validaciones de actualización

- No se permite modificar eventos cancelados.
- No se permite modificar eventos finalizados.
- No se permite cambiar manualmente el organizador.
- El estado se modifica exclusivamente mediante su endpoint específico.
- Se validan nuevamente los campos modificados.

### Transiciones de estado

| Estado actual | Transiciones permitidas |
|---|---|
| draft | published, cancelled |
| published | finished, cancelled |
| cancelled | Ninguna |
| finished | Ninguna |

No se puede publicar un evento cuya fecha ya haya pasado.

No se puede finalizar un evento que todavía no haya comenzado.

Los estados `cancelled` y `finished` se consideran terminales.

### Cancelación lógica

Para cancelar un evento se utiliza:

```http
PATCH /api/events/:id/status
```

```json
{
  "status": "cancelled"
}
```

El documento permanece almacenado en MongoDB.

No se utilizan operaciones de eliminación física para cancelar eventos.

## 9. Autorización y propiedad

Se utilizan tres mecanismos:

1. `authMiddleware`: valida la autenticación mediante JWT.
2. `authorizeRoles`: restringe las operaciones por rol.
3. `eventOwnership`: comprueba que el usuario sea propietario del evento o administrador.

El middleware `optionalAuth` permite identificar sesiones válidas en endpoints públicos sin exigir autenticación obligatoria.

El rol y el identificador del usuario se obtienen del token validado, no del body.

**Consideración de seguridad:** los cambios de rol en MongoDB requieren emitir un nuevo JWT mediante login. Como mejora para producción, sería conveniente consultar el estado y rol vigente del usuario en la base de datos.

## 10. Manejo de errores

La API utiliza códigos HTTP adecuados según el caso.

| Código | Significado |
|---|---|
| 400 | Datos inválidos |
| 401 | Usuario no autenticado |
| 403 | Usuario sin permisos |
| 404 | Recurso inexistente o no visible |
| 409 | Conflicto o transición de estado inválida |
| 500 | Error interno del servidor |

Ejemplo de validación:

```json
{
  "status": "error",
  "message": "La capacidad debe ser un número entero mayor a 0"
}
```

El middleware global contempla errores controlados, errores de validación de Mongoose, errores de conversión de tipos y conflictos por índices únicos.

## 11. Pruebas manuales con Postman

Se realizaron pruebas funcionales durante el desarrollo.

| Prueba | Resultado esperado |
|---|---|
| Crear evento con rol user | 403 |
| Crear evento con organizer | 201 |
| Crear evento con fecha pasada | 400 |
| Crear evento con capacidad 0 | 400 |
| Organizador modifica evento propio | 200 |
| Organizador modifica evento ajeno | 403 |
| Administrador modifica evento ajeno | 200 |
| Cancelar evento | 200 |
| Intentar publicar evento cancelado | 409 |
| Intentar modificar evento cancelado | 409 |
| Listar eventos publicados | 200 |
| Consultar borrador propio | 200 |
| Consultar borrador sin autorización | 404 |
| Consultar evento inexistente | 404 |
| Filtrar por categoría y estado | 200 |
| Filtrar por ubicación y rango de fechas | 200 |
| Paginar resultados | 200 |
| Ordenar por fecha ascendente y descendente | 200 |

También se verificaron operaciones de registro, login y consulta de sesión en entregas anteriores.

Las pruebas se realizaron manualmente con Postman. Actualmente no se incluye una suite de pruebas automatizadas; el script `npm test` permanece como marcador.

Para reproducir las pruebas de roles:

1. Registrar cuentas de prueba.
2. Asignar roles de prueba mediante un procedimiento administrativo controlado en MongoDB.
3. Volver a iniciar sesión para obtener un JWT actualizado.
4. Realizar las solicitudes desde Postman.
5. Verificar los códigos HTTP y las respuestas JSON.

No compartir contraseñas, tokens o cookies reales en las evidencias.

## 12. Seguridad y mejoras futuras

Medidas implementadas:

- Hash de contraseñas mediante bcrypt.
- JWT en cookie HttpOnly.
- Autenticación mediante Passport.js.
- Autorización por roles.
- Verificación de propiedad de eventos.
- Restricción de campos modificables.
- Validaciones de datos y reglas de negocio.
- Protección de eventos privados.
- Cancelación lógica.
- Exclusión de secretos mediante `.gitignore`.

Posibles mejoras futuras:

- Pruebas automatizadas.
- Protección CSRF y limitación de intentos de autenticación.
- Verificación de roles vigentes en MongoDB.
- Actualizaciones condicionales para proteger cambios concurrentes.
- Índices adicionales para optimización de consultas.
- Inscripciones, tickets y control de cupos.
- Eventos de dominio y notificaciones.
- Documentación interactiva con OpenAPI/Swagger.

## 13. Entrega

La Pre-entrega 6 se publica en un repositorio público de GitHub.

Archivos requeridos:

- `package.json`
- `package-lock.json`
- `.gitignore`
- `.env.example`
- `README.md`
- Código fuente dentro de `src/`

No se incluyen `.env`, `node_modules`, credenciales ni datos privados.

**Repositorio:** https://github.com/sanbresso/backend-2-pre-entrega-6

---

Proyecto desarrollado como parte de **PBE II — Diseño y Arquitectura Backend, Coderhouse**.