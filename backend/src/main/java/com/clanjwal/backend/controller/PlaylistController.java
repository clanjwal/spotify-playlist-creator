package com.clanjwal.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clanjwal.backend.dto.PlaylistRequest;
import com.clanjwal.backend.dto.SpotifyTrack;
import com.clanjwal.backend.service.PlaylistService;
import com.clanjwal.backend.service.SpotifyService;

import jakarta.servlet.http.HttpSession;

@RestController 
@RequestMapping ("/api/playlists")
public class PlaylistController {

    private final PlaylistService playlistService;
    // SpotifyService only used for testing, delete later
    private final SpotifyService spotifyService;

    // SpotifyService only used for testing, delete that portion later but keep PlaylistService portion
    public PlaylistController(PlaylistService playlistService, SpotifyService spotifyService) {
        this.playlistService = playlistService;
        this.spotifyService = spotifyService;
    }

    @PostMapping
    public String createPlaylist(@RequestBody PlaylistRequest request, HttpSession session){
        String accessToken = (String) session.getAttribute("spotifyAccessToken");
        if (accessToken == null) {
            return "Spotify account not connected. Please connect your Spotify account first.";
        }
        return playlistService.createPlaylist(request, accessToken);
    }

    // temp endpoint to test retrieving saved tracks using static dates, no input from user
    @GetMapping("/test-saved-tracks")
    public List<SpotifyTrack> testSavedTracks(HttpSession session) {
        String accessToken = (String) session.getAttribute("spotifyAccessToken");

        if (accessToken == null) {
            throw new RuntimeException("Spotify account not connected.");
        }

        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 3, 31);
        return spotifyService.getSavedTracks(accessToken, startDate, endDate);
    }
}
