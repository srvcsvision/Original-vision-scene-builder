# Sistema de Iluminación — Vision Scene Builder

> Documento técnico que describe **exactamente** cómo se manejan las luces, sombras, entorno y renderizado en el scene builder.

---

## 1. Configuración del Canvas (Renderer)

**Archivo:** `src/components/scene/SceneCanvas.tsx` — líneas 250-258

```jsx
<Canvas
  shadows={false}
  dpr={[1, 1.5]}
  gl={{ antialias: true, powerPreference: 'low-power', alpha: false }}
  frameloop="always"
>
```

| Propiedad | Valor | Efecto |
|-----------|-------|--------|
| `shadows` | **`false`** | Las sombras están **completamente deshabilitadas** a nivel de renderer. Ninguna luz produce sombras aunque tengan `castShadow: true`. |
| `dpr` | `[1, 1.5]` | Device pixel ratio adaptativo (mín 1, máx 1.5). |
| `antialias` | `true` | Anti-aliasing activado. |
| `powerPreference` | `'low-power'` | Prioriza ahorro de energía sobre rendimiento. |
| `alpha` | `false` | Canvas opaco (sin transparencia). |

### Lo que NO se configura (usa defaults de R3F):

- **Tone Mapping:** R3F por defecto usa `ACESFilmicToneMapping` — comprime los rangos de color con una curva cinematográfica.
- **Color Management:** R3F por defecto usa `SRGBColorSpace` para output y gestión de color automática (`flat={false}`, `legacy={false}`).
- **Output Encoding:** `sRGB` (default de R3F/Three.js moderno).

---

## 2. Entorno (Environment Map)

**Archivo:** `src/components/scene/SceneCanvas.tsx` — línea 263

```jsx
<Environment preset="night" blur={1} />
```

| Propiedad | Valor | Efecto |
|-----------|-------|--------|
| `preset` | `"night"` | HDR de escena nocturna de drei. Cielo oscuro con poca iluminación ambiental indirecta. |
| `blur` | `1` | Blur máximo del environment map — lo convierte en un degradado suave, sin reflejos definidos. |

### Efecto sobre materiales:

- Los `meshStandardMaterial` reciben **IBL (Image-Based Lighting)** del environment map "night".
- Con blur=1, los reflejos son muy difusos (sin detalles del cielo).
- Los objetos metálicos (`metalness > 0`) reflejan este environment oscuro y borroso.
- La iluminación base que aporta este environment es **muy tenue** dado que el preset "night" es oscuro por naturaleza.

---

## 3. Luz Ambiental Base (Fija)

**Archivo:** `src/components/scene/SceneCanvas.tsx` — línea 264

```jsx
<ambientLight intensity={0.2} />
```

- Color: **blanco** (default `#ffffff`).
- Intensidad: **0.2** (muy baja).
- Esta luz **siempre está presente**, independiente de `lightsEnabled`.
- No se puede desactivar ni editar por el usuario.
- Proporciona una iluminación mínima para que nunca haya negro total.

---

## 4. Luces del Usuario (Dinámicas)

### 4.1 Tipos disponibles

**Archivo:** `src/types/index.ts`

| Tipo | Enum | Descripción |
|------|------|-------------|
| Point Light | `ObjectType.POINT_LIGHT` | Luz omnidireccional desde un punto |
| Spot Light | `ObjectType.SPOT_LIGHT` | Cono de luz con target |
| Directional Light | `ObjectType.DIRECTIONAL_LIGHT` | Luz paralela (tipo sol) |
| Ambient Light | `ObjectType.AMBIENT_LIGHT` | Iluminación uniforme sin dirección |

### 4.2 Propiedades por luz

**Archivo:** `src/types/index.ts` — interfaz `SceneObject`

```typescript
intensity?: number;     // Default: 1
color: string;          // Default: '#ffffff'
target?: [x, y, z];    // Default: [0, 0, 0] — solo Spot y Directional
angle?: number;         // Default: 0.52 rad (~30°) — solo Spot
penumbra?: number;      // Default: 0.3 — solo Spot
distance?: number;      // Default: 0 (infinita) — solo Point y Spot
decay?: number;         // Default: 2 — solo Point y Spot
castShadow?: boolean;   // Default: false
```

### 4.3 Valores por defecto al crear luces

**Archivo:** `src/constants/defaults.ts`

```typescript
DEFAULT_LIGHT_INTENSITY = 1;
DEFAULT_LIGHT_COLOR = '#ffffff';
MAX_SHADOW_LIGHTS = 2;
SHADOW_MAP_SIZE = 512;
```

### 4.4 Toggle global de luces

**Archivo:** `src/stores/slices/sceneSlice.ts`

```typescript
lightsEnabled: true,  // estado inicial
toggleLights: () => set((s) => { s.lightsEnabled = !s.lightsEnabled; }),
```

- Cuando `lightsEnabled = false`, **todas las luces del usuario se apagan** pero los helpers siguen visibles (con opacidad reducida a 0.2).
- La luz ambiental base de 0.2 y el environment map **NO se ven afectados** por este toggle.

---

## 5. Renderizado de Luces

**Archivo:** `src/components/scene/LightRenderer.tsx`

### Point Light

```jsx
<pointLight
  color={obj.color}
  intensity={obj.intensity ?? 1}
  distance={obj.distance ?? 0}
  decay={obj.decay ?? 2}
  {...shadowProps}
/>
```

### Spot Light

```jsx
<spotLight
  color={obj.color}
  intensity={obj.intensity ?? 1}
  angle={obj.angle ?? 0.52}
  penumbra={obj.penumbra ?? 0.3}
  distance={obj.distance ?? 0}
  decay={obj.decay ?? 2}
  {...shadowProps}
/>
```

- El SpotLight tiene un **target** que se actualiza cada frame vía `useFrame`.
- El target se añade manualmente a la `scene` (requisito de Three.js).

### Directional Light

```jsx
<directionalLight
  color={obj.color}
  intensity={obj.intensity ?? 1}
  {...shadowProps}
/>
```

- **No tiene target configurable en el renderer** (aunque el panel UI tiene campos de target).

### Ambient Light

```jsx
<ambientLight color={obj.color} intensity={obj.intensity ?? 1} />
```

### Shadow Props (condicional)

```jsx
const shadowProps = obj.castShadow ? {
  castShadow: true,
  'shadow-mapSize-width': 512,
  'shadow-mapSize-height': 512,
} : {};
```

> **NOTA CRÍTICA:** Aunque las luces pueden tener `castShadow: true` y se pasan shadow props, **las sombras nunca se renderizan** porque el `<Canvas>` tiene `shadows={false}`.

---

## 6. Materiales de Objetos

### Primitivos (Box, Sphere, Cylinder)

**Archivo:** `src/components/scene/RenderObject.tsx`

```jsx
<meshStandardMaterial
  color={obj.color}
  roughness={obj.roughness ?? 0.5}
  metalness={obj.metalness ?? 0.1}
/>
```

| Propiedad | Default | Nota |
|-----------|---------|------|
| `roughness` | 0.5 | Medio — ni mate ni espejo |
| `metalness` | 0.1 | Casi no-metálico |
| `color` | `'#3b82f6'` (azul) | Para objetos normales |

### Planos (Pared/Suelo)

```jsx
<meshLambertMaterial color="#ffffff" map={texture} />
```

- Usa **Lambert** (no Standard) — más barato, sin reflejos especulares.
- Tiene una textura de grid procedural generada con canvas.

### Modelos GLB

**Archivo:** `src/components/scene/ModelLoader.tsx`

```typescript
const FALLBACK_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa,
  roughness: 0.6,
  metalness: 0.1,
});
```

- Los GLB **conservan sus materiales originales** (se clonan).
- Si `stripTextures = true`, se reemplazan por el material fallback gris.
- Cada mesh del GLB tiene `castShadow = true` y `receiveShadow = true` (pero no producen sombras porque el canvas las deshabilita).

---

## 7. Color de Fondo

```jsx
<color attach="background" args={[backgroundColor]} />
```

- Default: `'#0a0a0c'` (casi negro).
- Se actualiza dinámicamente desde el store.

---

## 8. Cadena Completa de Iluminación

```
┌──────────────────────────────────────────┐
│             FUENTES DE LUZ               │
├──────────────────────────────────────────┤
│                                          │
│  1. Environment "night" (IBL)            │
│     → blur=1 (difuso)                    │
│     → Aporta iluminación indirecta       │
│       muy tenue y reflejos borrosos      │
│                                          │
│  2. ambientLight fija (intensity=0.2)    │
│     → Siempre activa                     │
│     → Iluminación base mínima            │
│                                          │
│  3. Luces del usuario (si lightsEnabled) │
│     → Point / Spot / Directional /       │
│       Ambient agregadas por el usuario   │
│     → Cada una con sus propiedades       │
│                                          │
├──────────────────────────────────────────┤
│             MATERIALES                   │
├──────────────────────────────────────────┤
│                                          │
│  • meshStandardMaterial (PBR)            │
│    → Reacciona a todas las fuentes       │
│    → roughness, metalness, color, map    │
│                                          │
│  • meshLambertMaterial (planos)          │
│    → Solo difuso, sin especular          │
│    → No reacciona al environment map     │
│                                          │
├──────────────────────────────────────────┤
│             POST-PROCESO                 │
├──────────────────────────────────────────┤
│                                          │
│  • Tone Mapping: ACESFilmic (default)    │
│  • Color Space: sRGB (default)           │
│  • Sombras: DESHABILITADAS              │
│  • Post-processing: NINGUNO              │
│                                          │
└──────────────────────────────────────────┘
```

---

## 9. Problemas Potenciales / Diferencias con App Final

### 9.1 Sombras deshabilitadas
El `<Canvas shadows={false}>` impide que **cualquier** luz genere sombras. Si la app final tiene sombras, esta es una diferencia visual enorme.

### 9.2 Tone Mapping por defecto
R3F aplica `ACESFilmicToneMapping` por defecto. Si la app final usa `NoToneMapping`, `LinearToneMapping`, o `ReinhardToneMapping`, los colores y el contraste serán diferentes.

### 9.3 Environment preset "night"
El preset "night" aporta poco IBL. Si la app final usa otro preset (como "city", "sunset", "studio") o un HDR/EXR personalizado, la iluminación indirecta será muy diferente.

### 9.4 `flat` y `legacy` no están definidos
Si la app final usa `<Canvas flat>` (desactiva tone mapping) o `<Canvas legacy>` (desactiva color management), los colores se verán diferentes.

### 9.5 No hay `toneMapping` ni `toneMappingExposure` explícitos
Si la app final configura `gl.toneMapping` o `gl.toneMappingExposure`, el brillo general cambia.

### 9.6 `powerPreference: 'low-power'`
En algunos GPUs esto puede resultar en menor calidad de renderizado.

### 9.7 Directional Light sin target funcional
En el renderer, la `directionalLight` no tiene target implementado (a diferencia del SpotLight). Si la app final sí apunta las direccionales, la dirección de la luz será diferente.

### 9.8 Ambient base siempre activa
La `ambientLight intensity={0.2}` siempre está encendida y se suma a cualquier ambient light del usuario, potencialmente "lavando" la escena.

---

## 10. Archivos Relevantes (Referencia Rápida)

| Archivo | Responsabilidad |
|---------|----------------|
| `src/components/scene/SceneCanvas.tsx` | Canvas, environment, luz base, fondo |
| `src/components/scene/LightRenderer.tsx` | Renderizado de cada tipo de luz |
| `src/components/scene/RenderObject.tsx` | Materiales y geometrías de objetos |
| `src/components/scene/ModelLoader.tsx` | Carga de GLB y sus materiales |
| `src/components/panels/LightPanel.tsx` | UI para editar propiedades de luz |
| `src/constants/defaults.ts` | Constantes por defecto |
| `src/stores/slices/sceneSlice.ts` | Estado global de luces |
| `src/types/index.ts` | Tipos/interfaces de SceneObject |
