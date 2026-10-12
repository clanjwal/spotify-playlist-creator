# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Spotify playlist creator: connects to a user's Spotify account, finds their liked (saved) songs added within a date range, and creates a private playlist from them. Monorepo with two independent apps:

- `backend/` — Spring Boot 4.1 (Java 21, Maven), package `com.clanjwal.backend`
- `frontend/` — Angular 21 (SSR, Tailwind 4, Vitest)

## Commands

Backend (run from `backend/`; use `mvnw.cmd` on Windows PowerShell, `./mvnw` in bash):
- Run: `./mvnw spring-boot:run` (serves on :8080)
- Test all: `./mvnw test`
- Single test: `./mvnw test -Dtest=BackendApplicationTests#methodName`

Frontend (run from `frontend/`):
- Dev server: `npm start` (ng serve, bound to 127.0.0.1:4200 — open the app at `http://127.0.0.1:4200`, not `localhost`, so the session cookie host matches the Spotify redirect URI)
- Build: `npm run build`
- Test: `npm test` (ng test, Vitest)

## Backend configuration

`application.properties` reads `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REDIRECT_URI` from environment variables; the app will not start without them.

## Backend architecture

Layering is controller → service → Spotify Web API (via Spring `RestClient`, base URL `https://api.spotify.com/v1`, built in `SpotifyService`):

- **Auth flow** (`AuthController` / `AuthService`): `GET /api/auth/spotify` redirects to Spotify's authorize page (scopes `user-library-read`, `playlist-modify-private`); `GET /api/auth/callback` exchanges the code for a token, stores it in the HTTP session under the attribute `spotifyAccessToken`, then redirects to `app.frontend-url` (env `FRONTEND_URL`, default `http://127.0.0.1:4200`; `?auth=error` on failure). `GET /api/auth/status` and `POST /api/auth/logout` let the frontend check/clear the session. Only the access token is kept — no refresh token handling.
- **Session-based token**: `PlaylistController` pulls `spotifyAccessToken` from the `HttpSession` (401 if missing) and passes it explicitly into service methods; services are stateless.
- **Playlist flow** (`PlaylistController` under `/api/playlists`):
  - `GET /tracks?start=YYYY-MM-DD&end=YYYY-MM-DD` → `SpotifyService.getSavedTracks`, which pages `/me/tracks` 50 at a time and filters on `added_at` within the inclusive UTC date range. It relies on Spotify returning liked songs newest-first and stops paging once it sees a track added before the start date. Returns `SpotifyTrack` (id, name, uri, addedAt, durationMs, artists, albumName, albumImageUrl).
  - `POST /create` (takes a `CreatePlaylistRequest` with name + track URIs) → `PlaylistService.createPlaylist`, which creates a private playlist (`POST /me/playlists`) then adds tracks (`POST /playlists/{id}/items`) in batches of 100 (Spotify's limit).
- `ApiExceptionHandler` turns `ResponseStatusException` and Spotify 4xx errors into `{message}` JSON; a Spotify 401 invalidates the session. `WebConfig` enables credentialed CORS for the frontend origin.
- `dto/` holds both request bodies and Spotify response mappings (note Spotify-shaped fields like `added_at` use snake_case getters).

## Frontend architecture

Single-page flow in `App` (signals, zoneless): connect with Spotify → pick a date range (`components/date-range-picker`, a custom two-month calendar bound with `[(start)]`/`[(end)]` ISO date strings) → load songs → sort, page (default 50/page, any size via `page-size-select`, capped at the song count; `pager` appears above and below the list) and select/deselect (all or just the current page) → create playlist (in the on-screen sort order). Sorting/paging helpers live in `utils/tracks.ts`. `BackendService` hardcodes `http://127.0.0.1:8080/api` and sends `withCredentials` because the Spotify token lives in the backend session cookie. The auth check runs in `afterNextRender` since the app is SSR/prerendered and has no session at build time.