import { Track } from '../models';

export type SortKey = 'addedAt' | 'name' | 'artist' | 'duration';
export type SortDirection = 'asc' | 'desc';

const text = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });
const added = (a: Track, b: Track) => Date.parse(a.addedAt) - Date.parse(b.addedAt);

const comparators: Record<SortKey, (a: Track, b: Track) => number> = {
  addedAt: added,
  name: (a, b) => text(a.name, b.name),
  artist: (a, b) => text(a.artists.join(', '), b.artists.join(', ')),
  duration: (a, b) => a.durationMs - b.durationMs
};

/** Returns a sorted copy. Ties fall back to date added, then name, so the order is always stable. */
export function sortTracks(tracks: readonly Track[], key: SortKey, direction: SortDirection): Track[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...tracks].sort((a, b) => sign * comparators[key](a, b) || added(a, b) || text(a.name, b.name));
}

/** Formats a length in milliseconds as m:ss, or h:mm:ss for an hour or more. */
export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
}

/** Page numbers to show in the pager, with `null` standing in for a skipped stretch. */
export function pageItems(current: number, count: number): (number | null)[] {
  const wanted = new Set([1, count, current - 1, current, current + 1]);
  const pages = [...wanted].filter(p => p >= 1 && p <= count).sort((a, b) => a - b);

  const items: (number | null)[] = [];
  pages.forEach((page, i) => {
    const previous = pages[i - 1];
    if (previous !== undefined && page - previous > 1) {
      // Show a lone missing page instead of an ellipsis that would hide just one button
      items.push(page - previous === 2 ? previous + 1 : null);
    }
    items.push(page);
  });
  return items;
}
