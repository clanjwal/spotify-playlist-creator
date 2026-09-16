package com.clanjwal.backend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.clanjwal.backend.dto.AddTracksRequest;
import com.clanjwal.backend.dto.SpotifySavedTrack;
import com.clanjwal.backend.dto.SpotifySavedTracksResponse;
import com.clanjwal.backend.dto.SpotifyTrack;


@Service 
public class SpotifyService {
    private final RestClient restClient;

    public SpotifyService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl("https://api.spotify.com/v1").build();
    }

    public List<SpotifyTrack> getSavedTracks(String accessToken, LocalDate startDate, LocalDate endDate) {
        List<SpotifyTrack> matchingTracks = new ArrayList<>();
        int offset = 0;
        int limit = 50; // Spotify API allows a maximum of 50 items per request
        Instant start = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = endDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        while(true) {
            int currOffset = offset;
            SpotifySavedTracksResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/me/tracks").queryParam("limit", limit).queryParam("offset", currOffset).build())
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve().body(SpotifySavedTracksResponse.class);
            if (response == null || response.getItems() == null) {
                break;
            }

            for(SpotifySavedTrack savedTrack : response.getItems()) {
                Instant addedAt = Instant.parse(savedTrack.getAdded_at());
                if (!addedAt.isBefore(start) && addedAt.isBefore(end)) {
                    matchingTracks.add(
                        new SpotifyTrack(
                            savedTrack.getTrack().getId(),
                            savedTrack.getTrack().getName(),
                            savedTrack.getTrack().getUri(),
                            addedAt
                        )
                    );
                }

                if(addedAt.isBefore(start)){
                    return matchingTracks;
                }
            }
            if(response.getNext() == null) {
                break;
            }
            offset += limit;
        }
        return matchingTracks;
    }

    public String addTracksToPlaylist(String accessToken, String playlistId, List<String> trackUris){
        AddTracksRequest request = new AddTracksRequest();
        request.setUris(trackUris);
        return restClient.post()
                .uri("/playlists/" + playlistId + "/items")
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .body(request)
                .retrieve()
                .body(String.class);
    }

    public String createSpotifyPlaylist(String accessToken, String playlistName) {
        String body = """
            {
                "name": "%s",
                "description": "Created using Playlist Creator by Cassandra Lanjwal",
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
