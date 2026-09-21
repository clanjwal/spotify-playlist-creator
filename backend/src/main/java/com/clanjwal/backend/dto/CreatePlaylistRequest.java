package com.clanjwal.backend.dto;

import java.util.List;

public class CreatePlaylistRequest {
    private String playlistName;
    private List<String> trackUris;

    public String getPlaylistName() {
        return playlistName;
    }
    public void setPlaylistName(String playlistName) {
        this.playlistName = playlistName;
    }

    public List<String> getTrackUris() {
        return trackUris;
    }
    public void setTrackUris(List<String> trackUris) {
        this.trackUris = trackUris;
    }
}
