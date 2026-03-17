# Vision Studio – Interacción, Objetos y Grupos

---

## 1. Selección de objetos

### Click en la escena 3D

- **Click simple** sobre un objeto: lo selecciona (reemplaza la selección anterior).
- **Ctrl + Click** (o **Cmd + Click** en Mac): agrega o quita el objeto de la selección actual (multi-selección).
- **Objetos bloqueados** (`locked: true`): no se pueden seleccionar haciendo click.
- Al hacer click en un área vacía de la escena, no se deselecciona automáticamente. Para deseleccionar se usa el botón **"Listo"** en la toolbar o la tecla **Enter**.

### Click en el sidebar (lista de escena)

- El sidebar izquierdo ("ESCENA") muestra todos los objetos en una lista jerárquica con iconos de carpeta.
- Al hacer click en un objeto de la lista, se selecciona en la escena.

### Indicadores visuales de selección

- El objeto seleccionado muestra el **gizmo de transformación** (TransformControls de Three.js/drei).
- Los objetos seleccionados tienen un efecto de "pulso" animado al momento de seleccionarse: la escala oscila brevemente durante 0.6 segundos.
- En multi-selección, solo el **primer objeto seleccionado** (primary) muestra el gizmo.

### Variables globales

Al seleccionar un objeto, la app actualiza:
- `window.__SELECTED_OBJECT_ID__` → ID del objeto seleccionado (o del primero en multi-selección)

---

## 2. Modos de transformación (Gizmo)

### ¿Qué es el gizmo?

Es el control visual 3D que aparece sobre el objeto seleccionado. Consiste en flechas de colores (roja = X, verde = Y, azul = Z) que permiten manipular el objeto arrastrándolas.

### Modos disponibles

| Modo | Ícono en toolbar | Descripción | Gizmo visual |
|------|-------------------|-------------|--------------|
| **Mover** (translate) | Ícono de flechas en cruz | Desplaza el objeto en los ejes X, Y, Z | Flechas rectas con punta de flecha |
| **Rotar** (rotate) | Ícono de flecha circular | Rota el objeto alrededor de los ejes X, Y, Z | Círculos/anillos alrededor del objeto |

Los botones de modo están en la toolbar superior. El botón activo se resalta con fondo blanco.

### Cómo usar el gizmo

1. Seleccioná un objeto (click en la escena o en el sidebar).
2. Elegí el modo (Mover o Rotar) desde la toolbar.
3. Arrastrá una de las flechas/anillos de color para transformar en ese eje específico.
4. Al soltar el arrastre, la transformación se aplica y se guarda en el estado.

### Restricciones del gizmo

- Solo aparece en el **objeto principal** de la selección (el primero seleccionado).
- **No aparece** si el objeto está bloqueado.
- **No aparece** en modo Recorrido (navegación).
- Mientras se arrastra el gizmo, los controles de cámara (OrbitControls) se desactivan para evitar conflictos.

### Escalar

No hay modo "Scale" en la toolbar con gizmo visual. La escala se modifica desde:

- El **panel de propiedades** (sidebar derecho): inputs numéricos X, Y, Z.
- El **panel de escala uniforme** (inyectado por `uniformScale.js`): un solo input que escala X, Y, Z proporcionalmente.

---

## 3. Panel de propiedades (sidebar derecho)

### Sin selección

Cuando no hay objetos seleccionados se muestra:
- **Escena Global**: Color de fondo (selector de color).
- Mensaje: *"Selecciona un objeto (o varios con Ctrl/Cmd+clic) para editar o agrupar."*

### Un objeto seleccionado

| Sección | Campos |
|---------|--------|
| **Detalles del Objeto** | Nombre (editable), botón "Duplicar objeto" |
| **Modelo GLB** *(solo para GLBs)* | Botón "Reemplazar modelo GLB" (carga archivo .glb/.gltf) |
| **Interactividad** *(solo para GLBs)* | Toggle "Activar Modal" → si activo: campos Título y Descripción del modal |
| **Posición** | Inputs X, Y, Z (numéricos, paso 1) |
| **Rotación** | Inputs X, Y, Z (numéricos, paso 0.1) |
| **Escala** | Inputs X, Y, Z (numéricos, paso 0.1) |
| **Material** *(no GLBs)* | Color base, Textura (cargar/quitar imagen), Rugosidad (slider 0-1), Metálico (slider 0-1) |
| **Material de luces** | Color, Intensidad (slider 0-10) |

### Varios objetos seleccionados (multi-selección)

| Sección | Opciones |
|---------|----------|
| **Varios objetos** | Contador ("N objetos seleccionados"), botón **"Crear grupo"**, botón **"Duplicar todos"** |
| **Rotar / Espejar** | Rotar 90° en eje X, Y, Z; Espejar en eje X, Y, Z |
| **Escena Global** | Color de fondo |

---

## 4. Toolbar superior

La toolbar es una barra flotante centrada en la parte superior de la pantalla. Contiene los siguientes controles, de izquierda a derecha:

### Controles generales (siempre visibles)

| Botón | Función |
|-------|---------|
| **Pantalla completa** | Alterna fullscreen del navegador |
| **Listo / Deseleccionar** | Solo visible con selección activa. Deselecciona todo (Enter) |
| **Propiedades** | Abre/cierra el panel de propiedades (sidebar derecho) |

### Proyecto

| Botón | Función |
|-------|---------|
| **Abrir proyecto** | Vuelve al selector de proyectos |
| **Guardar en la nube** | Guarda el proyecto en Firebase. Muestra estados: guardando (spinner), éxito (check verde), error (X roja) |
| **Importar proyecto** | Carga un archivo .json local |
| **Exportar proyecto** | Descarga el proyecto como .json |

### Modos

| Botón | Función |
|-------|---------|
| **Edición** | Modo de edición (seleccionar, mover, rotar objetos) |
| **Recorrido** | Modo de navegación/vista previa (scroll horizontal entre paredes, sin edición) |

### Historial (solo en modo Edición)

| Botón | Función |
|-------|---------|
| **Deshacer** | Deshace la última acción (Ctrl+Z) |
| **Rehacer** | Rehace la acción deshecha (Ctrl+Y) |

### Herramientas (solo en modo Edición)

| Botón | Función |
|-------|---------|
| **Cubo** | Agrega un cubo a la escena |
| **Esfera** | Agrega una esfera a la escena |
| **GLB** | Importa un modelo 3D (.glb) |
| **Cámara** | Agrega un objeto cámara a la escena |
| **Mover** | Activa el gizmo de traslación |
| **Rotar** | Activa el gizmo de rotación |
| **Grid** | Muestra/oculta la grilla infinita |

### En modo Recorrido

En lugar de las herramientas de edición, se muestra:
- Etiqueta **"Viendo Escena"** en verde
- Botón de **FOV** para alternar el campo de visión

---

## 5. Atajos de teclado

### Confirmados en el código

| Tecla | Acción | Contexto |
|-------|--------|----------|
| **Ctrl + Z** / **Cmd + Z** | Deshacer | Global |
| **Ctrl + Y** / **Cmd + Y** | Rehacer | Global |
| **Enter** | Deseleccionar / Listo | Cuando hay selección |
| **Escape** | Cerrar modal | En modales de copiar/pegar, centrar grupo, escala uniforme |
| **Escape** | Salir de Camera Perspective | En vista de cámara |

### Controles del mouse

| Acción del mouse | Resultado |
|------------------|-----------|
| **Click izquierdo** en objeto | Seleccionar |
| **Ctrl/Cmd + Click izquierdo** en objeto | Agregar/quitar de multi-selección |
| **Click izquierdo + arrastrar** en vacío | Rotar cámara (OrbitControls) |
| **Scroll** | Zoom (acercar/alejar) |
| **Click derecho + arrastrar** | Pan (desplazar cámara lateralmente) |
| **Click medio + arrastrar** | Pan (desplazar cámara lateralmente) |
| **Arrastrar flecha del gizmo** | Transformar objeto en ese eje |

---

## 6. Modos de la aplicación

### Modo Edición

- Es el modo por defecto.
- Permite seleccionar, mover, rotar y escalar objetos.
- El gizmo de transformación es visible.
- La toolbar muestra herramientas para agregar objetos.
- La cámara se controla con OrbitControls (rotar, pan, zoom).

### Modo Recorrido

- Modo de visualización/navegación.
- La escena se recorre con scroll horizontal (se desplaza entre paredes).
- No se pueden seleccionar ni editar objetos (el gizmo no aparece).
- La cámara se mueve con animación suave (lerp/slerp) hacia la posición de cada pared.
- El número de "paradas" se define por `window.__WALL_COUNT__` (por defecto 5 o 6).
- Si se seleccionó un objeto antes de entrar al modo, la cámara hace focus en él (se acerca y apunta hacia el objeto).

### Camera Perspective

- Se activa al seleccionar un objeto tipo Cámara.
- La vista principal adopta la posición y rotación de esa cámara.
- Aparece una barra en la parte superior con el nombre de la cámara y botones para navegar entre cámaras (anterior/siguiente).
- Se sale con el botón **X** o **Escape**.

### Vistas predefinidas de cámara

Existen 6 posiciones de cámara preestablecidas:

| Vista | Posición | Mira hacia |
|-------|----------|------------|
| **Vista 1** (Norte) | (0, 5, 10) | Centro (0,0,0) |
| **Vista 2** (Este) | (10, 5, 0) | Centro |
| **Vista 3** (Sur) | (0, 5, -10) | Centro |
| **Vista 4** (Oeste) | (-10, 5, 0) | Centro |
| **Vista 5** (Arriba) | (0, 15, 0) | Centro |
| **Vista 6** (Abajo) | (0, -5, 0) | (0, 5, 0) |

La transición entre vistas es animada con interpolación suave (lerp para posición, slerp para rotación).

---

## 7. Grupos

### Qué es un grupo

Un grupo es una colección de objetos asociados. En Vision Studio, los grupos se definen por el campo `groupId` en cada objeto; no existe una entidad "grupo" separada en los datos.

### Cómo crear un grupo

1. **Seleccionar varios objetos**: hacer Ctrl/Cmd + Click en cada objeto que se quiera agrupar.
2. En el panel de propiedades aparece la sección **"Varios objetos"** con un contador.
3. Hacer click en el botón **"Crear grupo"**.
4. Los objetos seleccionados quedan vinculados bajo un mismo `groupId`.

### Modelo de datos de los grupos

Los grupos no son entidades independientes en el JSON del proyecto. Se representan implícitamente:

- Las **paredes** (`type: plane`) que tienen `groupId` actúan como "ancla" del grupo.
- Los **GLBs** con el mismo `groupId` pertenecen a ese grupo.
- Los GLBs **sin `groupId`** se asignan automáticamente al grupo de la pared más cercana (por distancia 3D).

Estructura inferida en tiempo de ejecución:

```json
{
  "id": "groupId-de-la-pared",
  "label": "Grupo X",
  "wall": { "...objeto pared..." },
  "glbs": [ "...objetos GLB del grupo..." ]
}
```

### Seleccionar objetos dentro de un grupo

- No hay selección de grupo como entidad completa.
- Se seleccionan objetos individuales normalmente.
- Para operar sobre todo el grupo, se usan las funciones de grupo del sidebar (centrar en pared, escalar grupo).

### Operaciones de grupo

| Operación | Cómo acceder | Descripción |
|-----------|--------------|-------------|
| **Crear grupo** | Seleccionar 2+ objetos → botón en sidebar | Asigna el mismo `groupId` a todos |
| **Rotar grupo 90°** | Multi-selección → botones X, Y, Z | Rota todos los objetos seleccionados 90° en el eje elegido |
| **Espejar grupo** | Multi-selección → botones X, Y, Z | Espeja la posición de los objetos en el eje elegido |
| **Duplicar todos** | Multi-selección → botón "Duplicar todos" | Duplica todos los objetos seleccionados |
| **Centrar grupo en pared** | Botón en sidebar (inyectado por `groupCenterOnWall.js`) | Abre modal para elegir grupo → centra los GLBs en el centro de la pared asociada, manteniendo posiciones relativas |
| **Escalar grupo completo** | Botón en sidebar (inyectado por `uniformScale.js`) | Abre modal para elegir grupo → aplica escala (valor absoluto o multiplicador) a todos los GLBs del grupo |

### Limitaciones de los grupos

- No hay operación "desagrupar" (quitar `groupId`).
- No hay UI para reasignar un objeto a otro grupo.
- No hay "mover grupo" como bloque (se mueven objetos individualmente).
- No hay grupos anidados (un objeto solo puede pertenecer a un grupo).

---

## 8. Acciones sobre objetos individuales

### Tabla resumen de acciones

| Acción | Cómo | Detalle |
|--------|------|---------|
| **Seleccionar** | Click en escena o sidebar | Solo si no está bloqueado |
| **Multi-seleccionar** | Ctrl/Cmd + Click | Agrega/quita de la selección |
| **Mover** | Arrastrar gizmo de traslación o editar X/Y/Z en propiedades | Modo "Mover" activo |
| **Rotar** | Arrastrar gizmo de rotación o editar X/Y/Z en propiedades | Modo "Rotar" activo |
| **Escalar** | Editar X/Y/Z en propiedades o escala uniforme | No hay gizmo de escala |
| **Escala uniforme** | Input en sidebar → Enter para aplicar | Escala proporcional en los 3 ejes |
| **Duplicar** | Botón "Duplicar objeto" en propiedades | Crea una copia en la misma posición |
| **Eliminar** | Botón en propiedades (ícono de tacho) | Elimina el objeto de la escena |
| **Renombrar** | Campo "Nombre" en propiedades | Editable directamente |
| **Cambiar color** | Selector de color en Material | Para planos y primitivas |
| **Cambiar textura** | Botón "Cargar textura" / "Quitar textura" | Solo para planos y primitivas |
| **Rugosidad / Metálico** | Sliders en Material | Valores 0.0 a 1.0 |
| **Reemplazar modelo** | Botón "Reemplazar modelo GLB" (solo GLBs) | Mantiene posición, rotación y escala |
| **Activar modal** | Toggle "Activar Modal" (solo GLBs) | Hace clickeable el objeto en modo Recorrido |
| **Bloquear** | Botón de bloqueo (sidebar) | Impide selección y transformación |
| **Ocultar/Mostrar** | Toggle de visibilidad | El objeto deja de renderizarse |
| **Copiar / Pegar** | Panel inyectado por `copyPasteObjects.js` | Copia a localStorage, pega en el proyecto actual |

---

## 9. Tipos de objetos que se pueden agregar

| Tipo | Botón | Descripción |
|------|-------|-------------|
| **Cubo** (Box) | Ícono de cubo en toolbar | Geometría de caja 3D |
| **Esfera** (Sphere) | Ícono de esfera en toolbar | Geometría esférica |
| **Plano** (Plane) | Se crean al armar la habitación | Paredes y pisos (10x10 unidades por defecto) |
| **GLB** | Ícono de importar en toolbar | Modelo 3D externo en formato .glb/.gltf |
| **Cámara** | Ícono de cámara en toolbar | Punto de vista con visualización de frustum |
| **Luces** | Toolbar flotante de luces (lightManager) | PointLight, SpotLight, DirectionalLight, AmbientLight |

---

## 10. Frustum culling (optimización)

La app implementa un sistema de culling por frustum que solo renderiza los objetos que están dentro del campo de visión de la cámara. Esto se hace en cada frame:

1. Calcula la matriz de proyección de la cámara.
2. Por cada objeto visible, calcula una esfera envolvente (bounding sphere).
3. Si la esfera no intersecta el frustum de la cámara, el objeto se oculta.
4. Objetos seleccionados siempre se renderizan (incluso fuera de la vista).

Esto mejora el rendimiento al reducir el número de objetos que el GPU tiene que procesar.

---

## 11. Grid (Grilla)

- Grilla infinita renderizada con el componente `Grid` de drei.
- Se muestra/oculta con el botón **Grid** en la toolbar.
- Es puramente visual (no hay snap-to-grid).
- Los colores de la grilla se adaptan automáticamente al color de fondo: claro sobre fondo oscuro, oscuro sobre fondo claro.
- Distancia de fade: 40 unidades. Intensidad de fade: 5.

---

## 12. Interactividad en modo Recorrido

Los objetos GLB pueden ser configurados como "clickeables" (toggle "Activar Modal" en propiedades). Cuando están activados:

- En modo Recorrido, el cursor cambia a "pointer" al pasar sobre el objeto.
- Al hacer click se dispara un evento (`onObjectClick`) que puede mostrar un modal con el título y descripción configurados.
- El objeto hace una animación de pulso al ser clickeado.
