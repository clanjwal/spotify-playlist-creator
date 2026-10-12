package com.clanjwal.backend.dto;

public class CreatePlaylistResponse {
    private String id;
    private String name;
    private String url;
    private int trackCount;

    public CreatePlaylistResponse(String id, String name, String url, int trackCount) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.trackCount = trackCount;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUrl() {
        return url;
    }

    public int getTrackCount() {
        return trackCount;
    }
}
