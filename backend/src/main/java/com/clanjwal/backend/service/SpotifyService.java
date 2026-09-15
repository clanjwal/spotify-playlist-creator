package com.clanjwal.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service 
public class SpotifyService {
    private final RestClient restClient;

    public SpotifyService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl("https://api.spotify.com/v1").build();
    }

    public String getSavedTracks(String accessToken) {
        String url = "/me/tracks";
        return restClient.get()
                .uri(url)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(String.class);
    }

    public String createSpotifyPlaylist(String accessToken, String playlistName) {
        String body = """
            {
                "name": "%s",
                "description": "Playlist created via Spotify API",
                "public": false
            }
            """.formatted(playlistName);
        return restClient.post()
            .uri("/me/playlists")
            .header("Authorization", "Bearer " + accessToken)
            .header("Content-Type", "application/json")
            .body(body)
            .retrieve()
            .body(String.class);
    }
}
