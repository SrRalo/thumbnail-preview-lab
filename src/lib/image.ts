/**
 * Utilidades de imagen: redimensionan las subidas con <canvas> antes de
 * guardarlas como dataUrl en sessionStorage, para no agotar los ~5 MB.
 */

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Escala una imagen conservando la proporción, dentro de un máximo de
 * `maxW` × `maxH`, y la exporta como JPEG (calidad 0.85).
 */
export async function resizeImage(
  file: File,
  maxW = 1280,
  maxH = 720,
  quality = 0.85,
): Promise<string> {
  const src = await readAsDataUrl(file);
  const img = await loadImage(src);

  const scale = Math.min(1, maxW / img.width, maxH / img.height);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return src;

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Recorta una imagen a un cuadrado centrado y la escala a `size` × `size`.
 */
export async function resizeAvatar(
  file: File,
  size = 256,
  quality = 0.85,
): Promise<string> {
  const src = await readAsDataUrl(file);
  const img = await loadImage(src);

  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return src;

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', quality);
}
