package com.clanjwal.backend.dto;
import java.time.LocalDate;

public class PlaylistRequest {
    private LocalDate start;
    private LocalDate end;
    private String playlistName;

    public LocalDate getStart() {
        return start;
    }

    public void setStart(LocalDate start) {
        this.start = start;
    }

    public LocalDate getEnd() {
        return end;
    }

    public void setEnd(LocalDate end){
        this.end = end;
    }

    public String getPlaylistName() {
        return playlistName;
    }

    public void setPlaylistName(String playlistName) {
        this.playlistName = playlistName;
    }
}