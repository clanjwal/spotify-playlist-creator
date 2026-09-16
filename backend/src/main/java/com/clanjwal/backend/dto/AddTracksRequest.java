package com.clanjwal.backend.dto;

import java.util.List;

public class AddTracksRequest {
    private List<String> uris;

    public List<String> getUris() {
        return uris;
    }

    public void setUris(List<String> uris) {
        this.uris = uris;
    }
}
