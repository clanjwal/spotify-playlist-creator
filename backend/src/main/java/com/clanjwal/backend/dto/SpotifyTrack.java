package com.clanjwal.backend.dto;

import java.time.Instant;

public class SpotifyTrack {
    private String id;
    private String name;
    private String uri;
    private Instant addedAt;

    public SpotifyTrack(String id, String name, String uri, Instant addedAt) {
        this.id = id;
        this.name = name;
        this.uri = uri;
        this.addedAt = addedAt;
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
}
