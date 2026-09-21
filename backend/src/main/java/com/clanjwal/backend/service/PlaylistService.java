package com.clanjwal.backend.service;

import org.springframework.stereotype.Service;

import com.clanjwal.backend.dto.CreatePlaylistRequest;
import com.clanjwal.backend.dto.SpotifyPlaylistResponse;

@Service
public class PlaylistService {
    private final SpotifyService spotifyService;

    public PlaylistService(SpotifyService spotifyService) {
        this.spotifyService = spotifyService;
    }
    
    public String createPlaylist(CreatePlaylistRequest request, String accessToken) {
        SpotifyPlaylistResponse playlist = spotifyService.createSpotifyPlaylist(accessToken, request.getPlaylistName());
        String playlistId = playlist.getId();
        spotifyService.addTracksToPlaylist(accessToken, playlistId, request.getTrackUris());
        return "Playlist created successfully with ID: " + playlistId;
    }
}
