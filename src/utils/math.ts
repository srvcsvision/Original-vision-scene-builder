export function distance3D(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function center3D(
  positions: [number, number, number][]
): [number, number, number] {
  if (positions.length === 0) return [0, 0, 0];
  let sx = 0, sy = 0, sz = 0;
  positions.forEach(([x, y, z]) => { sx += x; sy += y; sz += z; });
  const n = positions.length;
  return [sx / n, sy / n, sz / n];
}
