# Configuración de Cámara - Escena Completa (GLB Scene Viewer)

> Documento de referencia para replicar exactamente la cámara del visor 3D en otro proyecto/builder.

---

## Contexto: Cómo funciona la cámara

La escena tiene **6 paredes** dispuestas lado a lado en el **eje X**. La cámara **nunca rota** — solo se **traslada horizontalmente en X** para centrar cada pared. Todos los demás parámetros (altura Y, profundidad Z, FOV, ángulo de mirada) son **idénticos** para todas las paredes.

La cámara usa una **PerspectiveCamera** de Three.js con `lookAt` fijo hacia la pared.

---

## Diferencia Web vs Mobile

| Aspecto | Mobile (iOS/Android) | Web (Browser) |
|---------|---------------------|---------------|
| **Orientación** | **Vertical** (portrait) | **Horizontal** (landscape) |
| **cameraYOffset** | `0.9` | `0.6` |
| **Altura final cámara** | `5.899` | `5.599` |
| **Razón del offset** | En vertical se ve menos área, se sube la cámara para compensar y encuadrar la pared completa | En horizontal el viewport es más ancho, no necesita tanto offset vertical |
| **Antialias** | `false` (rendimiento) | `true` |
| **FOV** | `53` | `53` |

En resumen: la pantalla mobile es **alta y angosta** (portrait), así que la cámara se eleva un poco más (+0.9) para que la pared entre completa en el encuadre vertical. En web la pantalla es **ancha y baja** (landscape), se necesita menos compensación (+0.6).

---

## Valores Globales (compartidos por todas las paredes)

Estos valores se calculan automáticamente como **promedio** de las posiciones Y y Z de las 6 paredes:

```
cameraY   = 4.999   (promedio Y de las 6 paredes ≈ 5.0)
wallZ     = -5.000  (promedio Z de las 6 paredes ≈ -5.0)
cameraZ   = wallZ + 3.4 = -1.600  (la cámara está 3.4 unidades delante de las paredes)
```

### Parámetros de cámara fijos

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| **FOV** | `53` | Campo de visión en grados |
| **near** | `0.1` | Plano de recorte cercano |
| **far** | `100` | Plano de recorte lejano |
| **CAMERA_LOOK_DOWN_OFFSET** | `0.35` | La cámara mira 0.35 unidades hacia abajo desde su posición |

---

## Posiciones exactas de las 6 paredes (del JSON)

Datos brutos de `projectConfig.mobile.json` — solo planos tipo "Pared" (no pisos):

| Pared | Posición X | Posición Y | Posición Z |
|-------|-----------|-----------|-----------|
| Pared 1 | `0.001` | `5.004` | `-5.001` |
| Pared 2 | `4.927` | `4.992` | `-5.001` |
| Pared 3 | `9.793` | `5.000` | `-5.004` |
| Pared 4 | `14.646` | `5.000` | `-5.000` |
| Pared 5 | `19.513` | `5.000` | `-4.995` |
| Pared 6 | `24.376` | `5.000` | `-5.000` |

La separación entre paredes es de aproximadamente **~4.9 unidades** en X.

---

## Cámara por Pared — Mobile (Portrait, offset Y = 0.9)

| Pared | camera.position `[X, Y, Z]` | camera.lookAt `[X, Y, Z]` | FOV |
|-------|---------------------------|--------------------------|-----|
| **Pared 1** | `[0.001, 5.899, -1.600]` | `[0.001, 5.549, -5.000]` | `53` |
| **Pared 2** | `[4.927, 5.899, -1.600]` | `[4.927, 5.549, -5.000]` | `53` |
| **Pared 3** | `[9.793, 5.899, -1.600]` | `[9.793, 5.549, -5.000]` | `53` |
| **Pared 4** | `[14.646, 5.899, -1.600]` | `[14.646, 5.549, -5.000]` | `53` |
| **Pared 5** | `[19.513, 5.899, -1.600]` | `[19.513, 5.549, -5.000]` | `53` |
| **Pared 6** | `[24.376, 5.899, -1.600]` | `[24.376, 5.549, -5.000]` | `53` |

## Cámara por Pared — Web (Landscape, offset Y = 0.6)

| Pared | camera.position `[X, Y, Z]` | camera.lookAt `[X, Y, Z]` | FOV |
|-------|---------------------------|--------------------------|-----|
| **Pared 1** | `[0.001, 5.599, -1.600]` | `[0.001, 5.249, -5.000]` | `53` |
| **Pared 2** | `[4.927, 5.599, -1.600]` | `[4.927, 5.249, -5.000]` | `53` |
| **Pared 3** | `[9.793, 5.599, -1.600]` | `[9.793, 5.249, -5.000]` | `53` |
| **Pared 4** | `[14.646, 5.599, -1.600]` | `[14.646, 5.249, -5.000]` | `53` |
| **Pared 5** | `[19.513, 5.599, -1.600]` | `[19.513, 5.249, -5.000]` | `53` |
| **Pared 6** | `[24.376, 5.599, -1.600]` | `[24.376, 5.249, -5.000]` | `53` |

---

## Fórmulas para replicar en cualquier builder

Para cualquier pared `i`:

```
// Valores fijos
cameraY        = 4.999
wallZ          = -5.000
cameraZ        = wallZ + 3.4        // = -1.600
cameraYOffset  = 0.9 (mobile) | 0.6 (web)
lookDownOffset = 0.35
fov            = 53
near           = 0.1
far            = 100

// Posiciones X de cada pared (array ordenado)
wallX = [0.001, 4.927, 9.793, 14.646, 19.513, 24.376]

// Para pared i:
camera.position = [wallX[i], cameraY + cameraYOffset, cameraZ]
camera.lookAt   = [wallX[i], cameraY + cameraYOffset - lookDownOffset, wallZ]
```

### En pseudocódigo Three.js:

```javascript
const camera = new THREE.PerspectiveCamera(53, aspect, 0.1, 100);

// Para mobile (vertical/portrait):
camera.position.set(wallX[i], 5.899, -1.600);
camera.lookAt(wallX[i], 5.549, -5.000);

// Para web (horizontal/landscape):
camera.position.set(wallX[i], 5.599, -1.600);
camera.lookAt(wallX[i], 5.249, -5.000);
```

---

## Intro cinematográfico (animación de entrada)

Al abrir la app hay un zoom-in animado de 4 segundos:

| Parámetro | Inicio (lejos) | Final (normal) |
|-----------|----------------|----------------|
| **FOV** | `48` | `53` |
| **Posición Z** | `8.400` (cameraZ + 10) | `-1.600` (cameraZ normal) |
| **Duración** | 4 segundos | — |
| **Easing** | Quíntico (ease-in-out) | — |

La cámara arranca lejos (Z=8.4) con FOV más cerrado (48) y se acerca suavemente hasta la posición normal (Z=-1.6, FOV 53).

---

## Diagrama visual (vista lateral)

```
Vista lateral (eje Z hacia la izquierda, Y hacia arriba)

        Y
        ^
  5.9   |   * Cámara (mobile)         ← mira 0.35 hacia abajo
  5.6   |   * Cámara (web)
  5.0   |   |==================|      ← Pared (Z = -5.0)
        |   |                  |
        |   |                  |
  3.4   |   |==================|      ← Base pared / Piso
        |
        +----------------------------> Z
       -5.0      -1.6         0

        |<-- 3.4 -->|
        pared    cámara
```

```
Vista superior (eje X hacia la derecha, Z hacia arriba)

    Z
    ^
    |
 -1.6  CAM1    CAM2    CAM3    CAM4    CAM5    CAM6
    |   |       |       |       |       |       |
    |   v       v       v       v       v       v
 -5.0  ====    ====    ====    ====    ====    ====
    |  P1      P2      P3      P4      P5      P6
    +----+-------+-------+-------+-------+--------> X
         0      4.9     9.8    14.6    19.5    24.4
```

---

## Notas importantes para el builder

1. **La cámara nunca rota** — solo cambia X. El lookAt siempre apunta recto hacia la pared.
2. **No hay OrbitControls** en la escena principal (sí los hay en el modal de objeto individual, pero no en la galería).
3. **El ángulo de mirada es casi recto** — solo baja 0.35 unidades, lo que equivale a una inclinación de ~6° hacia abajo.
4. **El FOV de 53** es un valor intermedio que muestra la pared completa sin distorsión excesiva en los bordes.
5. **Las paredes miden 10x10 unidades** (width=10, height=10) con escala ~0.5, resultando en ~5x5 unidades visibles.
6. **Coordenadas**: Three.js usa Y-up. X = horizontal (izquierda-derecha), Y = vertical (arriba-abajo), Z = profundidad (adelante-atrás).
