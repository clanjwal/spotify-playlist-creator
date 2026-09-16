package com.clanjwal.backend.service;

import org.springframework.stereotype.Service;

import com.clanjwal.backend.dto.PlaylistRequest;

@Service
public class PlaylistService {
    private final SpotifyService spotifyService;

    public PlaylistService(SpotifyService spotifyService) {
        this.spotifyService = spotifyService;
    }
    
    public String createPlaylist(PlaylistRequest request, String accessToken) {
        return spotifyService.createSpotifyPlaylist(accessToken, request.getPlaylistName());
    }
}
