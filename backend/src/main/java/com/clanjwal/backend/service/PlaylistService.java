package com.clanjwal.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.clanjwal.backend.dto.CreatePlaylistRequest;
import com.clanjwal.backend.dto.CreatePlaylistResponse;
import com.clanjwal.backend.dto.SpotifyPlaylistResponse;
import com.clanjwal.backend.dto.SpotifyTrack;

@Service
public class PlaylistService {
    private final SpotifyService spotifyService;

    public PlaylistService(SpotifyService spotifyService) {
        this.spotifyService = spotifyService;
    }

    public List<SpotifyTrack> getTracks(String accessToken, LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The end date must not be before the start date.");
        }
        return spotifyService.getSavedTracks(accessToken, start, end);
    }

    public CreatePlaylistResponse createPlaylist(CreatePlaylistRequest request, String accessToken) {
        String name = request.getPlaylistName();
        List<String> trackUris = request.getTrackUris();
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please give the playlist a name.");
        }
        if (trackUris == null || trackUris.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select at least one song.");
        }

        SpotifyPlaylistResponse playlist = spotifyService.createSpotifyPlaylist(accessToken, name.trim());
        String playlistId = playlist.getId();
        spotifyService.addTracksToPlaylist(accessToken, playlistId, trackUris);
        return new CreatePlaylistResponse(
            playlistId,
            playlist.getName(),
            "https://open.spotify.com/playlist/" + playlistId,
            trackUris.size()
        );
    }
}
