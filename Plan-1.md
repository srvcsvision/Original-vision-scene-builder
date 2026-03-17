# Vision Studio – Documentación General

---

## 1. Pantalla de Inicio (Selector de Proyectos)

Al abrir la app se muestra la pantalla principal **"Vision Studio"** con el subtítulo *"Elige un proyecto o crea uno nuevo"*.

### Elementos de la pantalla

| Elemento | Descripción |
|----------|-------------|
| **Título** | "Vision Studio" centrado en la parte superior |
| **Botón "+ Nuevo proyecto"** | Crea un proyecto vacío y entra al editor 3D |
| **PROYECTOS GUARDADOS** | Lista de proyectos existentes guardados en Firebase |

### Lista de proyectos

Cada proyecto se muestra como una tarjeta con:

- **Ícono de carpeta** a la izquierda
- **Nombre del proyecto** (ej: "6 Paredes", "Prueba Unico") o "Proyecto sin nombre" si no se le dio nombre al guardar
- **Fecha** de última modificación a la derecha (formato DD/MM/YYYY)

Al hacer click en un proyecto de la lista, se carga su configuración desde Firebase y se abre el editor 3D.

### Notas

- No hay sistema de autenticación (login con usuario/contraseña o Google). Cualquier persona que acceda a la URL ve todos los proyectos.
- Los proyectos se listan consultando Firebase Realtime Database.
- Las reglas de Firebase están abiertas (`read: true`, `write: true`), por lo que el acceso no está restringido.

---

## 2. Escena 3D – Tecnología

### Stack tecnológico

| Librería | Versión | Rol |
|----------|---------|-----|
| **Three.js** | ^0.169.0 | Motor de renderizado 3D (WebGL) |
| **React Three Fiber (R3F)** | ^9.5.0 | Binding declarativo de Three.js para React |
| **@react-three/drei** | ^10.7.7 | Helpers: loaders, controles de cámara, texturas |
| **React** | 19 | Framework de UI |

### Cómo funciona

- R3F crea un único `<canvas>` WebGL dentro de `#root`.
- La escena, cámara y renderer se exponen en variables globales (`window.__R3F_SCENE__`, `window.__R3F_CAMERA__`, `window.__R3F_GL__`) mediante un script en `index.html` que intercepta la creación de objetos Three.js.
- Los scripts de utilidades (`src/utils/`) acceden a la escena a través de estas referencias globales o recorriendo el árbol interno de React Fiber.

### Tipos de objetos en la escena

| Tipo | Descripción |
|------|-------------|
| **GLB** | Modelos 3D cargados desde URLs (Firebase Storage o blob local) usando `useGLTF` de drei |
| **Plane** | Paredes y pisos (ej: "Pared Frontal", "Pared Derecha", "Piso") |
| **Luces** | PointLight, SpotLight, DirectionalLight, AmbientLight |
| **Cámara** | PerspectiveCamera con visualización del frustum (wireframe verde/rojo) |

### Carga de modelos GLB

1. Se usa `useGLTF` (drei) para descargar y parsear el archivo.
2. Se clona la escena del GLTF y se clonan los materiales individualmente.
3. Se renderiza con `<primitive object={sceneClone} />`.
4. Opcionalmente se procesan con `@gltf-transform` para deduplicar recursos o extraer texturas.

---

## 3. Firebase – Datos

### Servicios utilizados

| Servicio | Uso |
|----------|-----|
| **Firebase Storage** | Almacena los archivos JSON del proyecto y los modelos GLB |
| **Realtime Database** | Almacena metadatos del proyecto (nombre, fechas, URLs) y URLs de video por objeto |

### Rutas en Storage

| Ruta | Contenido |
|------|-----------|
| `projects/{projectId}.json` | Configuración completa del proyecto |
| `projects/{projectId}/models/{nombre}.glb` | Modelos GLB (uno por contenido único, deduplicados por SHA-256) |

### Rutas en Realtime Database

| Ruta | Contenido |
|------|-----------|
| `projects/{projectId}/name` | Nombre del proyecto |
| `projects/{projectId}/createdAt` | Fecha de creación |
| `projects/{projectId}/updatedAt` | Última actualización |
| `projects/{projectId}/storagePath` | Path del JSON en Storage |
| `projects/{projectId}/storageUrl` | URL de descarga del JSON |
| `projects/{projectId}/objects/{objectId}/videoUrl` | URL de video asociado al objeto |

---

## 4. Panel de Propiedades (Sidebar)

El sidebar derecho contiene las propiedades del objeto seleccionado y controles globales. Está compuesto por secciones inyectadas dinámicamente:

### Secciones principales

| Sección | Descripción |
|---------|-------------|
| **Escena Global** | Configuración general de la escena (color de fondo, grid) |
| **Propiedades** | Transform del objeto seleccionado (posición, rotación, escala), color, material |
| **ESCENA** | Lista jerárquica de objetos (sidebar izquierdo) |
| **CREAR HABITACIÓN** | Herramientas para crear la estructura de paredes |

### Paneles adicionales (inyectados por utilidades)

| Panel | Función |
|-------|---------|
| **GLBs únicos** | Badge mostrando cantidad de modelos GLB únicos en la escena |
| **Título / Descripción / Video** | Metadatos editable del objeto seleccionado |
| **Propiedades de luz** | Panel completo para editar la luz seleccionada |
| **Escala uniforme** | Input para escalar X/Y/Z proporcionalmente |
| **Copiar / Pegar** | Botones para copiar objetos al portapapeles y pegarlos |
| **Centrar grupo en pared** | Alinea un grupo de GLBs al centro de su pared |
| **Bloquear paredes/pisos** | Toggle para bloquear/desbloquear paredes y pisos |
| **Guardado rápido** | Botón para guardar sin diálogo |

### ¿Es plegable?

El bundle usa iconos de chevron (`chevron-down`, `chevron-left`, `chevron-right`) e iconos de carpeta (`folder-open`), lo que indica que las secciones del sidebar son colapsables. Los paneles inyectados por las utilidades no tienen lógica de colapso propia.

---

## 5. Funciones disponibles

### Sobre objetos (GLB)

| Acción | Descripción |
|--------|-------------|
| **Mover** | Arrastrar en la escena o editar posición X/Y/Z en el panel |
| **Rotar** | Editar rotación X/Y/Z en el panel |
| **Escalar** | Editar escala X/Y/Z individual o uniforme (proporcionalmente) |
| **Bloquear** | Impedir selección y transformación del objeto |
| **Ocultar/Mostrar** | Toggle de visibilidad |
| **Copiar / Pegar** | Copiar al portapapeles local y pegar en el mismo o diferente proyecto |
| **Editar metadatos** | Título, descripción y URL de video asociado |
| **Editar material** | Color, roughness, metalness |

### Sobre grupos

| Acción | Descripción |
|--------|-------------|
| **Agrupar por pared** | Los objetos se agrupan por `groupId` asociado a una pared; los GLB sin grupo se asignan a la pared más cercana |
| **Centrar grupo en pared** | Desplaza todos los GLBs del grupo para alinear su centro con el centro de la pared, manteniendo posiciones relativas |
| **Escalar grupo completo** | Modal para escalar todos los GLBs de un grupo (valor absoluto o multiplicador) |

### Sobre luces

| Acción | Descripción |
|--------|-------------|
| **Agregar luz** | Dropdown con tipos: PointLight, SpotLight, DirectionalLight, AmbientLight |
| **Seleccionar** | Click en el indicador visual de la luz en la escena |
| **Editar propiedades** | Nombre, tipo, color, intensidad, posición, target, ángulo, penumbra, distancia, decay, sombras, visibilidad |
| **Eliminar** | Remover la luz de la escena |
| **Cambiar tipo** | Convertir entre tipos de luz |

#### Tipos de luz y sus propiedades

| Tipo | Propiedades específicas |
|------|------------------------|
| **PointLight** | Posición, distancia, decay |
| **SpotLight** | Posición, target, ángulo, penumbra, distancia |
| **DirectionalLight** | Posición, target |
| **AmbientLight** | Solo color e intensidad (sin posición) |

### Movilidad / Cámara

La cámara usa controles tipo **OrbitControls**:

| Control | Acción |
|---------|--------|
| **Arrastrar botón izquierdo** | Rotar la cámara alrededor del punto focal |
| **Scroll** | Zoom (dolly) acercar/alejar |
| **Arrastrar botón derecho o medio** | Pan (desplazar lateralmente) |

---

## 6. Capas

No existe un sistema de capas formal en la app. Los objetos se organizan por:

- **Tipo**: `plane` (paredes/pisos) vs `glb` (modelos 3D)
- **Grupos**: definidos por `groupId`, donde las paredes definen el grupo y los GLBs se asocian
- **Lista jerárquica**: el sidebar izquierdo ("ESCENA") muestra todos los objetos en una lista con iconos de carpeta, lo que sugiere agrupación visual

El bundle incluye el ícono `layers` de Lucide, indicando que puede existir alguna visualización de capas en la interfaz, pero la implementación no expone un sistema de capas con visibilidad/bloqueo independiente por capa.

---

## 7. Toolbar

### Toolbar principal

Definida en el bundle principal. Contiene las herramientas de transformación y navegación de la escena (move, rotate, scale, select).

### Toolbar de luces

Barra flotante superior centrada que aparece cuando el sistema de luces está activo:

- **Botón "Agregar Luz"** con dropdown para elegir el tipo
- **Badge** con el número total de luces en la escena
- **Botón deseleccionar** (visible cuando hay una luz seleccionada)

### Toolbars contextuales (en modales)

| Contexto | Botones |
|----------|---------|
| **Centrar grupo** | "Todos", "Ninguno" (selección de objetos) |
| **Copiar/Pegar** | "Todos", "Ninguno", "Solo GLBs" (filtro de selección) |
| **Escala uniforme** | Modo valor absoluto / multiplicador |

---

## 8. JSON y Estructura de Datos – Flujo completo

Esta es la parte más importante: cómo se serializa la escena y se persiste en Firebase.

### Estructura del JSON del proyecto

```json
{
  "version": 1,
  "backgroundColor": "#0a0a0c",
  "showGrid": true,
  "lights": [ ... ],
  "objects": [ ... ],
  "uniqueGlbs": [ ... ]
}
```

### Objeto tipo GLB

```json
{
  "id": "uuid-generado",
  "name": "Nombre del modelo",
  "type": "glb",
  "transform": {
    "position": [0, 0, 0],
    "rotation": [0, 0, 0],
    "scale": [1, 1, 1]
  },
  "visible": true,
  "locked": false,
  "color": "#3b82f6",
  "roughness": 0.5,
  "metalness": 0.1,
  "title": "Título editable",
  "description": "Descripción editable",
  "url": "https://firebasestorage.googleapis.com/...",
  "modelUrl": "https://firebasestorage.googleapis.com/...",
  "storageModelPath": "projects/xxx/models/nombre.glb"
}
```

### Objeto tipo Plane (pared/piso)

```json
{
  "id": "plane-uuid",
  "name": "Pared Norte",
  "type": "plane",
  "transform": {
    "position": [0, 1.5, -3],
    "rotation": [0, 0, 0],
    "scale": [1, 1, 1]
  },
  "width": 10,
  "height": 10,
  "visible": true,
  "locked": false,
  "title": "Título editable",
  "description": "Descripción editable"
}
```

### Luz

```json
{
  "id": "light-uuid",
  "type": "PointLight",
  "name": "Luz principal",
  "color": "#ffffff",
  "intensity": 1,
  "position": [0, 3, 0],
  "target": [0, 0, 0],
  "angle": 0.52,
  "penumbra": 0.3,
  "distance": 0,
  "decay": 2,
  "castShadow": false,
  "visible": true
}
```

### Lista de GLBs únicos

```json
{
  "uniqueGlbs": [
    {
      "path": "projects/xxx/models/silla.glb",
      "url": "https://firebasestorage.googleapis.com/...",
      "name": "silla.glb"
    }
  ]
}
```

### Flujo de guardado completo

```
Usuario presiona "Guardar"
        │
        ▼
interceptSaveWithPrompt intercepta la acción del bundle
        │
        ▼
saveProjectWithTextures (projectSaver.js)
        │
        ├── 1. saveMultipleGLBs
        │       ├── Calcula SHA-256 de cada blob GLB
        │       ├── Deduplica: si dos objetos usan el mismo modelo, sube solo una vez
        │       ├── Sube a Storage: projects/{projectId}/models/{nombre}.glb
        │       └── Retorna { objectId: { url, path } }
        │
        ├── 2. Actualiza config.objects
        │       ├── GLBs: agrega url, modelUrl, storageModelPath
        │       ├── Planes: asegura width/height por defecto
        │       └── Todos: agrega title/description desde __OBJECT_METADATA__
        │
        ├── 3. cleanupUnusedGLBs
        │       └── Borra de Storage los GLBs que ya no están referenciados
        │
        ├── 4. Arma uniqueGlbs (lista de GLBs únicos por ruta)
        │
        ├── 5. JSON.stringify(config)
        │       ├── Hook de lightManager inyecta config.lights
        │       └── Hook de sidebarObjectMetadata sincroniza metadatos
        │
        ├── 6. uploadString → projects/{projectId}.json (Storage)
        │
        └── 7. set → projects/{projectId} (Realtime Database)
                ├── name, createdAt, updatedAt
                ├── storagePath, storageUrl
                └── objects: { objectId: { videoUrl } }
```

### Flujo de guardado rápido (Quick Save)

```
Quick Save (solo JSON, no re-sube GLBs)
        │
        ├── Obtiene config desde React Fiber state o __SCENE_CONFIG__
        ├── JSON.stringify (con hooks de lights y metadata)
        ├── uploadString → projects/{projectId}.json (Storage)
        └── Actualiza Realtime Database (updatedAt, metadata)
```

### Flujo de carga

```
Abrir proyecto
        │
        ├── 1. get(ref(db, 'projects/{id}')) → metadata desde Realtime DB
        ├── 2. getDownloadURL(storagePath) → URL del JSON en Storage
        ├── 3. fetch(configUrl) → descarga el JSON del proyecto
        ├── 4. JSON.parse (con hooks para restaurar luces y metadata)
        ├── 5. syncVideoUrlsFromFirebase → llena __OBJECT_METADATA__ con videos
        └── 6. R3F renderiza los objetos: useGLTF(modelUrl) para cada GLB
```

### Texturas

Las texturas van **embebidas dentro de los archivos GLB**. No se extraen ni se suben por separado en el flujo principal. Cada GLB que se sube a Storage contiene sus texturas dentro del binario.

Existe un flujo alternativo para React Native (`glbProcessor.js` + `processGLBForMobile.js`) que extrae texturas a archivos separados en `projects/{projectId}/textures/{objectId}/texture_{index}.{ext}`, pero este flujo **no se usa en el guardado principal de la app web**.

### Deduplicación de GLBs

- Se calcula el hash SHA-256 del contenido binario de cada GLB.
- Si dos o más objetos usan el mismo modelo (mismo hash), se sube un solo archivo.
- El nombre del archivo se basa en `obj.name` (ej: `silla.glb`). Si hay colisión de nombres con distinto contenido, se agrega un sufijo con parte del hash.
- La lista `uniqueGlbs` en el JSON refleja esta deduplicación.
