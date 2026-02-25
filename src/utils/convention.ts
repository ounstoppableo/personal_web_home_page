export function checkIsNone(value: any) {
  return (
    value === null || value === undefined || Number.isNaN(value) || value === ""
  );
}
export function scaleNumber(
  val: number,
  minVal: number,
  maxVal: number,
  scaleStart: number,
  scaleEnd: number
) {
  return (
    scaleStart + ((val - minVal) / (maxVal - minVal)) * (scaleEnd - scaleStart)
  );
}

export function uniqueBy(arr: any[], getKey: (obj: any) => string) {
  const map = new Map();
  for (const item of arr) {
    map.set(getKey(item), item);
  }
  return [...map.values()];
}
