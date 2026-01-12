export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const isInStartZone = (rect: DOMRect, x: number, y: number) => {
  const startZoneWidth = rect.width * 0.6;
  const startZoneHeight = rect.height * 0.6;
  return x <= startZoneWidth && y >= rect.height - startZoneHeight;
};

export const isInFoldZone = (rect: DOMRect, x: number, y: number) => {
  const foldZoneWidth = rect.width * 0.5;
  const foldZoneHeight = rect.height * 0.4;
  return x >= rect.width - foldZoneWidth && y >= rect.height - foldZoneHeight;
};
