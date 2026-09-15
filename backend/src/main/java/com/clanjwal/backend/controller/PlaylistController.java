package com.clanjwal.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clanjwal.backend.service.PlaylistService;

import jakarta.servlet.http.HttpSession;

@RestController 
@RequestMapping ("/api/playlists")
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @PostMapping
    public String createPlaylist(HttpSession session){
        String accessToken = (String) session.getAttribute("spotifyAccessToken");
        if (accessToken == null) {
            return "Spotify account not connected. Please connect your Spotify account first.";
        }
        return "Spotify access token found.";
    }
}
