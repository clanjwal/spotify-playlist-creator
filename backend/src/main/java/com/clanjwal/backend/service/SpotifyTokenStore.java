package com.clanjwal.backend.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class SpotifyTokenStore {

    private final Map<String, String> tokens = new ConcurrentHashMap<>();

    public String saveToken(String accessToken) {
        String userId = UUID.randomUUID().toString();

        tokens.put(userId, accessToken);

        return userId;
    }

    public String getToken(String userId) {
        return tokens.get(userId);
    }
}