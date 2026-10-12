import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { Track } from './models';

const track = (n: number): Track => ({
  id: `id${n}`,
  name: `Song ${n}`,
  uri: `spotify:track:${n}`,
  addedAt: `2026-03-0${n}T10:00:00Z`,
  durationMs: 180000 + n * 1000,
  artists: ['Artist'],
  albumName: 'Album',
  albumImageUrl: null
});

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  async function render(connected: boolean) {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    http.expectOne('http://127.0.0.1:8080/api/auth/status').flush({ connected });
    await fixture.whenStable();
    return fixture;
  }

  it('prompts the user to connect when not signed in', async () => {
    const fixture = await render(false);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Connect with Spotify');
    expect(el.querySelector('app-date-range-picker')).toBeNull();
  });

  it('shows the date picker once connected', async () => {
    const fixture = await render(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-date-range-picker')).not.toBeNull();
    expect(el.textContent).not.toContain('Connect with Spotify');
  });

  it('selects every loaded song and creates a playlist from the selection', async () => {
    const fixture = await render(true);
    const el = fixture.nativeElement as HTMLElement;
    const app = fixture.componentInstance as any;

    app.start.set('2026-03-01');
    app.end.set('2026-03-31');
    app.loadTracks();
    const req = http.expectOne(r => r.url === 'http://127.0.0.1:8080/api/playlists/tracks');
    expect(req.request.params.get('start')).toBe('2026-03-01');
    expect(req.request.params.get('end')).toBe('2026-03-31');
    req.flush([track(1), track(2), track(3)]);
    await fixture.whenStable();

    expect(app.selectedUris()).toEqual(['spotify:track:1', 'spotify:track:2', 'spotify:track:3']);

    app.toggle('spotify:track:2');
    await fixture.whenStable();
    expect(el.textContent).toContain('2 of 3 selected');

    app.createPlaylist();
    const create = http.expectOne('http://127.0.0.1:8080/api/playlists/create');
    expect(create.request.body.trackUris).toEqual(['spotify:track:1', 'spotify:track:3']);
    create.flush({ id: 'p1', name: create.request.body.playlistName, url: 'https://open.spotify.com/playlist/p1', trackCount: 2 });
    await fixture.whenStable();
    expect(el.textContent).toContain('Open in Spotify');
  });

  describe('sorting and paging', () => {
    // jsdom does not implement scrolling
    beforeEach(() => {
      Element.prototype.scrollIntoView = () => {};
    });

    const many = (count: number): Track[] =>
      Array.from({ length: count }, (_, i) => ({
        ...track(1),
        id: `m${i}`,
        name: `Song ${String(i).padStart(3, '0')}`,
        uri: `spotify:track:m${i}`,
        // Later songs were added earlier, so the default order reverses the fetch order
        addedAt: new Date(Date.UTC(2026, 2, 1) + (count - i) * 3600_000).toISOString(),
        durationMs: 1000 * (i % 7)
      }));

    async function loaded(count: number) {
      const fixture = await render(true);
      const app = fixture.componentInstance as any;
      app.start.set('2026-03-01');
      app.end.set('2026-03-31');
      app.loadTracks();
      http.expectOne(r => r.url.endsWith('/playlists/tracks')).flush(many(count));
      await fixture.whenStable();
      return { fixture, app };
    }

    it('sorts earliest to latest by default and can re-sort', async () => {
      const { app } = await loaded(5);
      expect(app.pageTracks().map((t: Track) => t.name)).toEqual(
        ['Song 004', 'Song 003', 'Song 002', 'Song 001', 'Song 000']
      );

      app.setSort('name');
      expect(app.pageTracks()[0].name).toBe('Song 000');
      app.toggleSortDirection();
      expect(app.pageTracks()[0].name).toBe('Song 004');

      app.setSort('duration');
      expect(app.pageTracks()[0].durationMs).toBe(0);
    });

    it('shows 50 songs per page by default and pages through the rest', async () => {
      const { app } = await loaded(120);
      expect(app.pageSize()).toBe(50);
      expect(app.pageCount()).toBe(3);
      expect(app.pageTracks().length).toBe(50);

      app.goToPage(3);
      expect(app.pageTracks().length).toBe(20);
    });

    it('accepts any page size and caps it at the number of songs', async () => {
      const { app } = await loaded(30);

      app.setPageSize(10);
      expect(app.pageCount()).toBe(3);

      app.setPageSize(500);
      expect(app.pageSize()).toBe(30);
      expect(app.pageCount()).toBe(1);
    });

    it('shows a pager above and below the list', async () => {
      const { fixture } = await loaded(120);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('app-pager').length).toBe(2);
      expect(el.querySelectorAll('app-pager')[0].textContent).toContain('Showing 1–50 of 120');
    });

    it('selects and deselects only the songs on the current page', async () => {
      const { app } = await loaded(120);
      expect(app.selectedUris().length).toBe(120);

      app.toggleShown();
      expect(app.selectedUris().length).toBe(70);

      app.goToPage(2);
      app.toggleShown();
      expect(app.selectedUris().length).toBe(20);

      app.toggleShown();
      expect(app.selectedUris().length).toBe(70);
    });
  });
});
