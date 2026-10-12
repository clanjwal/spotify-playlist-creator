package com.clanjwal.backend.dto;

import java.time.Instant;
import java.util.List;

public class SpotifyTrack {
    private String id;
    private String name;
    private String uri;
    private Instant addedAt;
    private int durationMs;
    private List<String> artists;
    private String albumName;
    private String albumImageUrl;

    public SpotifyTrack(String id, String name, String uri, Instant addedAt, int durationMs,
                        List<String> artists, String albumName, String albumImageUrl) {
        this.id = id;
        this.name = name;
        this.uri = uri;
        this.addedAt = addedAt;
        this.durationMs = durationMs;
        this.artists = artists;
        this.albumName = albumName;
        this.albumImageUrl = albumImageUrl;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUri() {
        return uri;
    }

    public Instant getAddedAt() {
        return addedAt;
    }

    public int getDurationMs() {
        return durationMs;
    }

    public List<String> getArtists() {
        return artists;
    }

    public String getAlbumName() {
        return albumName;
    }

    public String getAlbumImageUrl() {
        return albumImageUrl;
    }
}
