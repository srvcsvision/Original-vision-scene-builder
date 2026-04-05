# Guía de Luces — Formato JSON del Scene Builder

> Documento para implementar la lectura de luces Point Light y Spot Light (modo libre) en tu app final.

---

## 1. Estructura General del JSON

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

Las luces están en el array `lights`.

---

## 2. Point Light

Emite luz en todas las direcciones desde un punto. No tiene dirección ni cono.

### JSON de ejemplo

```json
{
  "id": "a1b2c3d4-...",
  "name": "point light 1",
  "type": "point_light",
  "transform": {
    "position": [2.5, 3.0, -1.0],
    "rotation": [0, 0, 0],
    "scale": [1, 1, 1]
  },
  "color": "#ffffff",
  "visible": true,
  "locked": false,
  "intensity": 1.5,
  "distance": 0,
  "decay": 2
}
```

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `transform.position` | `[x, y, z]` | Posición en world space |
| `transform.rotation` | `[x, y, z]` | **No tiene efecto visual** — la luz emite en todas las direcciones. Ignorar. |
| `color` | `string` | Color hex CSS (`"#ffffff"`) |
| `intensity` | `number` | Intensidad. Si no existe, usar `1` |
| `distance` | `number` | Alcance máximo. `0` = infinito (atenuación física) |
| `decay` | `number` | Velocidad de atenuación. `2` = físicamente correcto |

### Cómo recrearla en Three.js

```typescript
const light = new THREE.PointLight(data.color, data.intensity ?? 1, data.distance ?? 0, data.decay ?? 2);
light.position.set(data.transform.position[0], data.transform.position[1], data.transform.position[2]);
scene.add(light);
```

### Cómo recrearla en React Three Fiber

```tsx
<pointLight
  position={data.transform.position}
  color={data.color}
  intensity={data.intensity ?? 1}
  distance={data.distance ?? 0}
  decay={data.decay ?? 2}
/>
```

---

## 3. Spot Light (Modo Libre)

Emite luz en forma de cono. La dirección del cono viene de `transform.rotation`.

### JSON de ejemplo

```json
{
  "id": "e5f6g7h8-...",
  "name": "spot light 1",
  "type": "spot_light",
  "transform": {
    "position": [0, 5, 3.5],
    "rotation": [-0.8, 0, 0],
    "scale": [1, 1, 1]
  },
  "color": "#ffffff",
  "visible": true,
  "locked": false,
  "intensity": 2.0,
  "angle": 0.52,
  "penumbra": 0.3,
  "distance": 0,
  "decay": 2,
  "useFixedTarget": false
}
```

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `transform.position` | `[x, y, z]` | Posición de la fuente de luz en world space |
| `transform.rotation` | `[x, y, z]` | Rotación Euler en **radianes** (orden XYZ). **Define hacia dónde apunta el cono** |
| `color` | `string` | Color hex CSS |
| `intensity` | `number` | Intensidad. Si no existe, usar `1` |
| `angle` | `number` | Apertura del cono en **radianes**. Si no existe, usar `0.52` (~30°) |
| `penumbra` | `number` | Suavidad del borde (0 = borde duro, 1 = totalmente difuso). Si no existe, usar `0.3` |
| `distance` | `number` | Alcance. `0` = infinito |
| `decay` | `number` | Atenuación. Si no existe, usar `2` |

### Cómo se calcula la dirección

La luz apunta hacia **abajo en su espacio local** `(0, -1, 0)`. La rotación del JSON rota esa dirección:

```
Dirección final = Quaternion(transform.rotation) × Vector(0, -1, 0)
```

Ejemplo con `rotation: [-0.8, 0, 0]` (rotación de -0.8 rad en X):
- Sin rotación → el cono apunta recto hacia abajo `(0, -1, 0)`
- Con esa rotación → el cono se inclina hacia adelante (eje Z negativo)

```
         [SpotLight] ─── posición (0, 5, 3.5)
              │╲
              │  ╲  ← dirección = Quat([-0.8, 0, 0]) × (0, -1, 0)
              │    ╲
              ▼      ▼
         ●●●●●●●●●●●●  ← cono de luz
```

---

## 4. PROBLEMA COMÚN: El cono apunta a otro lado en mi app

### Por qué pasa

**Three.js SpotLight NO usa la rotación de su grupo padre para determinar la dirección.** Siempre calcula la dirección como:

```
dirección = target.position - light.worldPosition
```

Si no seteás el target manualmente, queda en `(0, 0, 0)` por defecto. Eso significa que:

- Meter un `<spotLight>` dentro de un `<group rotation={...}>` **NO rota el cono**
- Setear `light.rotation.set(...)` directamente **NO rota el cono**
- El cono SIEMPRE apunta hacia donde esté `light.target.position`

### Esto NO funciona (el cono va a apuntar a 0,0,0 siempre)

```tsx
// ❌ INCORRECTO — la rotation del group NO afecta la dirección del spotLight
<group position={data.transform.position} rotation={data.transform.rotation}>
  <spotLight
    color={data.color}
    intensity={data.intensity ?? 1}
    angle={data.angle ?? 0.52}
    penumbra={data.penumbra ?? 0.3}
  />
</group>
```

```typescript
// ❌ INCORRECTO — setear rotation en el spotLight NO cambia la dirección
light.rotation.set(data.transform.rotation[0], data.transform.rotation[1], data.transform.rotation[2]);
```

### La solución

Hay que **calcular manualmente la posición del target** a partir de la rotación del JSON y asignárselo al spotLight. Además el target **debe agregarse a la escena** con `scene.add(light.target)`.

La fórmula es:

```
target = posición + (Quaternion(rotation) × Vector(0, -1, 0))
```

Paso a paso:
1. Crear un Euler con la rotación del JSON
2. Convertir a Quaternion
3. Rotar el vector `(0, -1, 0)` con ese quaternion → obtenés la dirección
4. Sumar la posición de la luz → obtenés la posición del target
5. Asignar al `light.target.position`
6. Agregar `light.target` a la escena

---

## 5. Cómo recrear la SpotLight correctamente

### Three.js puro

```typescript
function createSpotLight(data: any, scene: THREE.Scene): THREE.SpotLight {
  const light = new THREE.SpotLight(
    data.color,
    data.intensity ?? 1,
    data.distance ?? 0,
    data.angle ?? 0.52,
    data.penumbra ?? 0.3,
    data.decay ?? 2
  );

  // 1. Setear posición
  light.position.set(
    data.transform.position[0],
    data.transform.position[1],
    data.transform.position[2]
  );

  // 2. Calcular dirección desde la rotación
  const euler = new THREE.Euler(
    data.transform.rotation[0],
    data.transform.rotation[1],
    data.transform.rotation[2],
    'XYZ'  // mismo orden que usa R3F y el builder
  );
  const quat = new THREE.Quaternion().setFromEuler(euler);
  const direction = new THREE.Vector3(0, -1, 0).applyQuaternion(quat);

  // 3. Target = posición + dirección
  const targetPos = new THREE.Vector3(
    data.transform.position[0],
    data.transform.position[1],
    data.transform.position[2]
  ).add(direction);

  light.target.position.copy(targetPos);

  // 4. OBLIGATORIO: agregar el target a la escena
  scene.add(light.target);

  // 5. Forzar actualización
  light.target.updateMatrixWorld();

  scene.add(light);
  return light;
}
```

### React Three Fiber

```tsx
const SpotLightFromJSON: React.FC<{ data: any }> = ({ data }) => {
  const spotRef = useRef<THREE.SpotLight>(null);
  const { scene } = useThree();

  // Agregar target a la escena (OBLIGATORIO)
  useEffect(() => {
    if (!spotRef.current) return;
    const t = spotRef.current.target;
    scene.add(t);
    return () => { scene.remove(t); };
  }, [scene]);

  // Calcular y asignar target desde la rotación
  useFrame(() => {
    if (!spotRef.current) return;

    const euler = new THREE.Euler(
      data.transform.rotation[0],
      data.transform.rotation[1],
      data.transform.rotation[2],
      'XYZ'
    );
    const quat = new THREE.Quaternion().setFromEuler(euler);
    const dir = new THREE.Vector3(0, -1, 0).applyQuaternion(quat);
    const pos = new THREE.Vector3(...data.transform.position);

    spotRef.current.target.position.copy(pos.add(dir));
    spotRef.current.target.updateMatrixWorld();
  });

  return (
    <spotLight
      ref={spotRef}
      position={data.transform.position}
      color={data.color}
      intensity={data.intensity ?? 1}
      angle={data.angle ?? 0.52}
      penumbra={data.penumbra ?? 0.3}
      distance={data.distance ?? 0}
      decay={data.decay ?? 2}
    />
  );
};
```

---

## 6. Checklist rápido

Si el cono apunta mal en tu app, revisá estos puntos:

- [ ] **¿Agregaste el target a la escena?** → `scene.add(light.target)` es obligatorio
- [ ] **¿Calculaste el target desde la rotación?** → No basta con poner rotation en el group/light
- [ ] **¿Usaste `(0, -1, 0)` como dirección base?** → El builder usa esa dirección local
- [ ] **¿Usaste orden Euler `'XYZ'`?** → Tiene que ser el mismo que el builder
- [ ] **¿Llamaste `target.updateMatrixWorld()`?** → Necesario después de setear la posición
- [ ] **¿El spotLight tiene `position={[0,0,0]}` local?** → Three.js lo crea en `(0, 1, 0)` por defecto; si lo metés dentro de un group posicionado, no le pongas position adicional al spotLight

---

## 7. Función Completa de Carga (Point + Spot)

```typescript
function loadLightsFromJSON(lightsData: any[], scene: THREE.Scene): THREE.Light[] {
  const lights: THREE.Light[] = [];

  for (const data of lightsData) {
    if (!data.visible) continue;

    switch (data.type) {
      case 'point_light': {
        const pl = new THREE.PointLight(
          data.color,
          data.intensity ?? 1,
          data.distance ?? 0,
          data.decay ?? 2
        );
        pl.position.set(...data.transform.position as [number, number, number]);
        scene.add(pl);
        lights.push(pl);
        break;
      }

      case 'spot_light': {
        const sl = new THREE.SpotLight(
          data.color,
          data.intensity ?? 1,
          data.distance ?? 0,
          data.angle ?? 0.52,
          data.penumbra ?? 0.3,
          data.decay ?? 2
        );
        sl.position.set(...data.transform.position as [number, number, number]);

        // Calcular target desde rotación (modo libre)
        const euler = new THREE.Euler(
          data.transform.rotation[0],
          data.transform.rotation[1],
          data.transform.rotation[2],
          'XYZ'
        );
        const quat = new THREE.Quaternion().setFromEuler(euler);
        const dir = new THREE.Vector3(0, -1, 0).applyQuaternion(quat);
        const pos = new THREE.Vector3(...data.transform.position as [number, number, number]);
        sl.target.position.copy(pos.add(dir));

        scene.add(sl.target);
        sl.target.updateMatrixWorld();
        scene.add(sl);
        lights.push(sl);
        break;
      }
    }
  }

  return lights;
}
```

### Uso

```typescript
const response = await fetch(projectUrl);
const config = await response.json();
const lights = loadLightsFromJSON(config.lights, scene);
```
