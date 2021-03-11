export type Nullable<T> = T | null;

export function notEmpty<TValue>(value: Nullable<TValue>): value is TValue {
  return value !== null;
}

function randomNumberBetween(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getEmptyIndecies<T>(arr: Nullable<T>[]) {
  let empty: number[] = [];
  let i = arr.indexOf(null);
  while (i !== -1) {
    empty.push(i);
    i = arr.indexOf(null, i + 1);
  }
  return empty;
}

export function getRandomEmptyIndex<T>(arr: Nullable<T>[]) {
  const emptyIndecies = getEmptyIndecies(arr);
  const i = randomNumberBetween(0, emptyIndecies.length - 1);
  return emptyIndecies[i];
}

export function swap<T>(arr: Nullable<T>[], x: number, y: number) {
  const tmp = arr[x];
  arr[x] = arr[y];
  arr[y] = tmp;
}

export function getGridNeighbours(
  index: number,
  arr: any[],
  gridWidth: number
) {
  return [
    arr[index - 1], // left
    arr[index + 1], // right
    arr[index + gridWidth - 1], // bottom left
    arr[index + gridWidth], // bottom
    arr[index + gridWidth + 1], // bottom right
    arr[index - gridWidth - 1], // top left
    arr[index - gridWidth], // top
    arr[index - gridWidth + 1], // top right
  ].filter((c) => c !== undefined); // not out of bounds
}
