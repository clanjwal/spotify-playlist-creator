package com.clanjwal.backend.dto;


public class SpotifySavedTrack {
    private String added_at;
    private SpotifyTrackInfo track;

    public String getAdded_at() {
        return added_at;
    }

    public void setAdded_at(String added_at) {
        this.added_at = added_at;
    }

    public SpotifyTrackInfo getTrack() {
        return track;
    }

    public void setTrack(SpotifyTrackInfo track) {
        this.track = track;
    }
}
