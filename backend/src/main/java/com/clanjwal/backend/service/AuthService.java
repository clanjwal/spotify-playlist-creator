package com.clanjwal.backend.service;

import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.clanjwal.backend.dto.SpotifyTokenResponse;

@Service 
public class AuthService {
    @Value("${spotify.client-id}")
    private String clientId;

    @Value("${spotify.client-secret}")
    private String clientSecret;

    @Value("${spotify.redirect-uri}")
    private String redirectUri;

    private final RestClient restClient;

    public AuthService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl("https://accounts.spotify.com").build();
    }

    public SpotifyTokenResponse exchangeCodeForAccessToken(String code) {
        String credentials = clientId + ":" + clientSecret;
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());

        SpotifyTokenResponse response = restClient.post()
            .uri("/api/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .header("Authorization", "Basic " + encodedCredentials)
            .body(
                "grant_type=authorization_code" +
                "&code=" + code +
                "&redirect_uri=" + redirectUri
            )
            .retrieve()
            .body(SpotifyTokenResponse.class);
        return response;
    }
}
