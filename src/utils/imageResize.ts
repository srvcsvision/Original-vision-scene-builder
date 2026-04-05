const MAX_BYTES = 30 * 1024; // 30 KB
const AVATAR_SIZE = 256;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function drawToCanvas(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const min = Math.min(img.width, img.height);
  const sx = (img.width - min) / 2;
  const sy = (img.height - min) / 2;
  ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality,
    );
  });
}

/**
 * Resize + crop cuadrado + compresión JPEG progresiva.
 * Garantiza <= 30 KB. Retorna un Blob JPEG listo para subir.
 */
export async function resizePresenterImage(file: File): Promise<Blob> {
  const img = await loadImage(file);
  URL.revokeObjectURL(img.src);

  let size = AVATAR_SIZE;
  let quality = 0.8;

  while (size >= 64) {
    const canvas = drawToCanvas(img, size);

    while (quality >= 0.1) {
      const blob = await canvasToBlob(canvas, quality);
      if (blob.size <= MAX_BYTES) return blob;
      quality -= 0.1;
    }

    size = Math.round(size * 0.7);
    quality = 0.8;
  }

  const tiny = drawToCanvas(img, 64);
  return canvasToBlob(tiny, 0.1);
}
