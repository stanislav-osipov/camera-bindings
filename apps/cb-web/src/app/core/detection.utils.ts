import { Observable } from 'rxjs';
import { bufferCount, map } from 'rxjs/operators';

const DEFAULT_BUFFER_COUNT = 10;

function findMostFrequent<T extends string | number>(list: T[]) {
  return Object.entries(
    list.reduce((count, item) => ({
      ...count,
      [item]: count[item] ? count[item] + 1 : 1,
    }), {} as any)
  ).reduce(
    (mostFrequentEntry, entry) => (entry[1] >= mostFrequentEntry[1] ? entry : mostFrequentEntry),
    [null, 0],
  )[0];
}

export function detect<T extends string | number>(sensitivity = DEFAULT_BUFFER_COUNT) {
  return (input: Observable<T>) => input.pipe(
    bufferCount(sensitivity),
    map(buffer => findMostFrequent(buffer)),
  );
}
