package com.clanjwal.backend.dto;
import java.util.List;

public class SpotifySavedTracksResponse {
    private List<SpotifySavedTrack> items;
    private String next;
    private int total;

    public List<SpotifySavedTrack> getItems() {
        return items;
    }
    public void setItems(List<SpotifySavedTrack> items) {
        this.items = items;
    }

    public String getNext() {
        return next;
    }
    public void setNext(String next) {
        this.next = next;
    }

    public int getTotal() {
        return total;
    }
    public void setTotal(int total) {
        this.total = total;
    }
}
