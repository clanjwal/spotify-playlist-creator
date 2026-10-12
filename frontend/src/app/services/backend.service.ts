import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreatedPlaylist, Track } from '../models';

@Injectable({
    providedIn: 'root'
})
export class BackendService {
    private apiUrl = 'http://127.0.0.1:8080/api';
    // The Spotify token lives in the backend session, so every request must carry the session cookie
    private options = { withCredentials: true };

    readonly loginUrl = `${this.apiUrl}/auth/spotify`;

    constructor(private http: HttpClient) {}

    getAuthStatus() {
        return this.http.get<{ connected: boolean }>(`${this.apiUrl}/auth/status`, this.options);
    }

    logout() {
        return this.http.post<void>(`${this.apiUrl}/auth/logout`, null, this.options);
    }

    getTracks(start: string, end: string) {
        return this.http.get<Track[]>(`${this.apiUrl}/playlists/tracks`, {
            ...this.options,
            params: { start, end }
        });
    }

    createPlaylist(playlistName: string, trackUris: string[]) {
        return this.http.post<CreatedPlaylist>(
            `${this.apiUrl}/playlists/create`,
            { playlistName, trackUris },
            this.options
        );
    }
}
