package com.clanjwal.backend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.clanjwal.backend.dto.AddTracksRequest;
import com.clanjwal.backend.dto.SpotifyArtist;
import com.clanjwal.backend.dto.SpotifyImage;
import com.clanjwal.backend.dto.SpotifyPlaylistResponse;
import com.clanjwal.backend.dto.SpotifySavedTrack;
import com.clanjwal.backend.dto.SpotifySavedTracksResponse;
import com.clanjwal.backend.dto.SpotifyTrack;
import com.clanjwal.backend.dto.SpotifyTrackInfo;


@Service
public class SpotifyService {
    private static final int ADD_TRACKS_BATCH_SIZE = 100; // Spotify API allows a maximum of 100 items per add request
    private static final int MIN_COVER_WIDTH = 128;

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
                SpotifyTrackInfo track = savedTrack.getTrack();
                if (track != null && !addedAt.isBefore(start) && addedAt.isBefore(end)) {
                    matchingTracks.add(toSpotifyTrack(track, addedAt));
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

    private SpotifyTrack toSpotifyTrack(SpotifyTrackInfo track, Instant addedAt) {
        List<String> artists = track.getArtists() == null ? List.of()
                : track.getArtists().stream().map(SpotifyArtist::getName).toList();
        String albumName = null;
        String albumImageUrl = null;
        if (track.getAlbum() != null) {
            albumName = track.getAlbum().getName();
            albumImageUrl = pickCoverUrl(track.getAlbum().getImages());
        }
        return new SpotifyTrack(track.getId(), track.getName(), track.getUri(), addedAt,
                track.getDuration_ms(), artists, albumName, albumImageUrl);
    }

    // Spotify lists album images largest first; take the smallest one that is still sharp enough for a thumbnail
    private String pickCoverUrl(List<SpotifyImage> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        String best = images.get(0).getUrl();
        for (SpotifyImage image : images) {
            if (image.getWidth() != null && image.getWidth() >= MIN_COVER_WIDTH) {
                best = image.getUrl();
            }
        }
        return best;
    }

    public void addTracksToPlaylist(String accessToken, String playlistId, List<String> trackUris){
        for (int i = 0; i < trackUris.size(); i += ADD_TRACKS_BATCH_SIZE) {
            AddTracksRequest request = new AddTracksRequest();
            request.setUris(trackUris.subList(i, Math.min(i + ADD_TRACKS_BATCH_SIZE, trackUris.size())));
            restClient.post()
                    .uri("/playlists/" + playlistId + "/items")
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        }
    }

    public SpotifyPlaylistResponse createSpotifyPlaylist(String accessToken, String playlistName) {
        Map<String, Object> body = Map.of(
            "name", playlistName,
            "description", "Created using Playlist Creator by Cassandra Lanjwal",
            "public", false
        );
        return restClient.post()
            .uri("/me/playlists")
            .header("Authorization", "Bearer " + accessToken)
            .header("Content-Type", "application/json")
            .body(body)
            .retrieve()
            .body(SpotifyPlaylistResponse.class);
    }
}
