package com.clanjwal.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.clanjwal.backend.dto.CreatePlaylistRequest;
import com.clanjwal.backend.dto.CreatePlaylistResponse;
import com.clanjwal.backend.dto.SpotifyTrack;
import com.clanjwal.backend.service.PlaylistService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping ("/api/playlists")
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @PostMapping("/create")
    public CreatePlaylistResponse createPlaylist(@RequestBody CreatePlaylistRequest request, HttpSession session){
        return playlistService.createPlaylist(request, getAccessToken(session));
    }

    @GetMapping("/tracks")
    public List<SpotifyTrack> getTracks(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            HttpSession session) {
        return playlistService.getTracks(getAccessToken(session), start, end);
    }

    private String getAccessToken(HttpSession session) {
        String accessToken = (String) session.getAttribute("spotifyAccessToken");
        if (accessToken == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Spotify account not connected.");
        }
        return accessToken;
    }
}
