import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface SpotifyTrack {
  name: string;
  artist: string;
  uri: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html'
})
export class App {

  startDate = '';
  endDate = '';
  playlistName = '';
  userId = '';

  tracks: SpotifyTrack[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['userId']) {
        this.userId = params['userId'];
      }
    });
  }

  connectSpotify() {
    window.location.href = 'http://localhost:8080/api/auth/spotify';
  }

  findTracks() {
    this.http.get<SpotifyTrack[]>(
      'http://localhost:8080/api/playlists/tracks',
      {
        params: {
          userId: this.userId,
          start: this.startDate,
          end: this.endDate
        }
      }
    ).subscribe({
      next: (tracks) => {
        this.tracks = tracks;
      },
      error: (error) => {
        console.error(error);
        alert('Could not get tracks.');
      }
    });
  }

  createPlaylist() {

    const trackUris = this.tracks.map(track => track.uri);

    const request = {
      playlistName: this.playlistName,
      trackUris: trackUris
    };

    this.http.post(
      'http://localhost:8080/api/playlists/create',
      request,
      {
        withCredentials: true,
        responseType: 'text'
      }
    ).subscribe({
      next: (response) => {
        alert(response);
      },
      error: (error) => {
        console.error(error);
        alert('Could not create playlist.');
      }
    });
  }
}
