import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { BackendService } from './services/backend.service';
import { DateRangePicker } from './components/date-range-picker/date-range-picker';
import { CreatedPlaylist, Track } from './models';
import { formatIsoDate } from './utils/dates';
import { PageSizeSelect } from './components/page-size-select/page-size-select';
import { Pager } from './components/pager/pager';
import { formatDuration, SortDirection, SortKey, sortTracks } from './utils/tracks';

const DEFAULT_PAGE_SIZE = 50;

const SORT_DIRECTION_LABELS: Record<SortKey, Record<SortDirection, string>> = {
  addedAt: { asc: 'Oldest first', desc: 'Newest first' },
  name: { asc: 'A to Z', desc: 'Z to A' },
  artist: { asc: 'A to Z', desc: 'Z to A' },
  duration: { asc: 'Shortest first', desc: 'Longest first' }
};

type AuthState = 'checking' | 'disconnected' | 'connected';

@Component({
  selector: 'app-root',
  imports: [DatePipe, DateRangePicker, PageSizeSelect, Pager],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly backend = inject(BackendService);

  protected readonly loginUrl = this.backend.loginUrl;

  protected readonly authState = signal<AuthState>('checking');
  protected readonly start = signal<string | null>(null);
  protected readonly end = signal<string | null>(null);
  protected readonly tracks = signal<Track[] | null>(null);
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly playlistName = signal('');
  protected readonly loading = signal(false);
  protected readonly creating = signal(false);
  protected readonly created = signal<CreatedPlaylist | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly sortKey = signal<SortKey>('addedAt');
  protected readonly sortDirection = signal<SortDirection>('asc');
  protected readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'addedAt', label: 'Date added' },
    { key: 'name', label: 'Song name' },
    { key: 'artist', label: 'Artist' },
    { key: 'duration', label: 'Length' }
  ];
  protected readonly pageSizeOptions = [20, 50, 75, 100];
  // What the user asked for; the page size actually used can be smaller when there are fewer songs
  private readonly requestedPageSize = signal(DEFAULT_PAGE_SIZE);
  private readonly requestedPage = signal(1);

  protected readonly canLoad = computed(() => !!this.start() && !!this.end() && !this.loading());
  protected readonly sortedTracks = computed(() =>
    sortTracks(this.tracks() ?? [], this.sortKey(), this.sortDirection())
  );
  protected readonly sortDirectionLabel = computed(() => SORT_DIRECTION_LABELS[this.sortKey()][this.sortDirection()]);
  protected readonly pageSize = computed(() => {
    const total = this.sortedTracks().length;
    // Asking for more songs per page than exist just shows them all on one page
    return total > 0 ? Math.min(this.requestedPageSize(), total) : this.requestedPageSize();
  });
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.sortedTracks().length / this.pageSize())));
  protected readonly currentPage = computed(() => Math.min(this.requestedPage(), this.pageCount()));
  protected readonly firstShown = computed(() => (this.currentPage() - 1) * this.pageSize());
  protected readonly pageTracks = computed(() =>
    this.sortedTracks().slice(this.firstShown(), this.firstShown() + this.pageSize())
  );
  protected readonly pageSummary = computed(() => {
    const total = this.sortedTracks().length;
    return `Showing ${this.firstShown() + 1}–${this.firstShown() + this.pageTracks().length} of ${total}`;
  });
  protected readonly allShownSelected = computed(() => {
    const shown = this.pageTracks();
    return shown.length > 0 && shown.every(t => this.selected().has(t.uri));
  });

  // Follows the on-screen order so the playlist is built in the order the user sees
  protected readonly selectedUris = computed(() =>
    this.sortedTracks().filter(t => this.selected().has(t.uri)).map(t => t.uri)
  );
  protected readonly allSelected = computed(() => {
    const tracks = this.tracks();
    return !!tracks && tracks.length > 0 && this.selectedUris().length === tracks.length;
  });
  protected readonly canCreate = computed(
    () => this.selectedUris().length > 0 && this.playlistName().trim().length > 0 && !this.creating()
  );

  constructor() {
    // Auth state lives in the backend session, so it can only be checked in the browser (not while prerendering)
    afterNextRender(() => this.checkAuth());
  }

  protected loadTracks() {
    const start = this.start();
    const end = this.end();
    if (!start || !end) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.created.set(null);
    this.backend.getTracks(start, end).subscribe({
      next: tracks => {
        this.tracks.set(tracks);
        this.requestedPage.set(1);
        this.selected.set(new Set(tracks.map(t => t.uri)));
        this.playlistName.set(this.defaultPlaylistName(start, end));
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.fail(err, 'Could not load your liked songs.');
      }
    });
  }

  protected setSort(key: string) {
    this.sortKey.set(key as SortKey);
    this.sortDirection.set('asc');
    this.requestedPage.set(1);
  }

  protected toggleSortDirection() {
    this.sortDirection.update(d => (d === 'asc' ? 'desc' : 'asc'));
    this.requestedPage.set(1);
  }

  protected goToPage(page: number) {
    this.requestedPage.set(Math.min(this.pageCount(), Math.max(1, page)));
    document.getElementById('song-list')?.scrollIntoView({ block: 'start' });
  }

  /** Applies the page size asked for; `pageSize` caps it at the number of songs. */
  protected setPageSize(size: number) {
    this.requestedPageSize.set(size);
    this.requestedPage.set(1);
  }

  /** Selects the songs on the current page, or deselects them if they are all selected already. */
  protected toggleShown() {
    const next = new Set(this.selected());
    const select = !this.allShownSelected();
    for (const track of this.pageTracks()) {
      if (select) {
        next.add(track.uri);
      } else {
        next.delete(track.uri);
      }
    }
    this.selected.set(next);
  }

  protected formatDuration = formatDuration;

  protected toggle(uri: string) {
    const next = new Set(this.selected());
    if (!next.delete(uri)) {
      next.add(uri);
    }
    this.selected.set(next);
  }

  protected toggleAll() {
    const tracks = this.tracks() ?? [];
    this.selected.set(this.allSelected() ? new Set() : new Set(tracks.map(t => t.uri)));
  }

  protected createPlaylist() {
    if (!this.canCreate()) {
      return;
    }

    this.creating.set(true);
    this.error.set(null);
    this.backend.createPlaylist(this.playlistName().trim(), this.selectedUris()).subscribe({
      next: playlist => {
        this.created.set(playlist);
        this.creating.set(false);
      },
      error: err => {
        this.creating.set(false);
        this.fail(err, 'Could not create the playlist.');
      }
    });
  }

  protected disconnect() {
    this.backend.logout().subscribe({
      complete: () => this.reset(),
      error: () => this.reset()
    });
  }

  protected artistLine(track: Track) {
    return track.artists.join(', ');
  }

  private checkAuth() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('auth')) {
      // Drop the marker so a refresh does not show the same message again
      window.history.replaceState(null, '', window.location.pathname);
    }
    const authFailed = params.get('auth') === 'error';

    this.backend.getAuthStatus().subscribe({
      next: status => {
        this.authState.set(status.connected ? 'connected' : 'disconnected');
        if (authFailed && !status.connected) {
          this.error.set('Spotify did not authorize the connection. Please try again.');
        }
      },
      error: () => {
        this.authState.set('disconnected');
        this.error.set('Could not reach the backend. Make sure it is running on 127.0.0.1:8080.');
      }
    });
  }

  private fail(err: unknown, fallback: string) {
    const response = err instanceof HttpErrorResponse ? err : null;
    if (response?.status === 401) {
      this.reset();
      this.error.set('Your Spotify session expired. Please reconnect.');
      return;
    }
    if (response?.status === 0) {
      this.error.set('Could not reach the backend. Make sure it is running on 127.0.0.1:8080.');
      return;
    }
    this.error.set(response?.error?.message ?? fallback);
  }

  private reset() {
    this.authState.set('disconnected');
    this.tracks.set(null);
    this.selected.set(new Set());
    this.created.set(null);
    this.error.set(null);
  }

  private defaultPlaylistName(start: string, end: string) {
    return start === end
      ? `Liked songs ${formatIsoDate(start)}`
      : `Liked songs ${formatIsoDate(start)} – ${formatIsoDate(end)}`;
  }
}
