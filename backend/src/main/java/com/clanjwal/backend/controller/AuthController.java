package com.clanjwal.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.servlet.view.RedirectView;

import com.clanjwal.backend.dto.SpotifyTokenResponse;
import com.clanjwal.backend.service.AuthService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping ("/api/auth")
public class AuthController {
    @Value("${spotify.client-id}")
    private String clientId;
    // @Value("${spotify.client-secret}")
    // private String clientSecret;
    @Value("${spotify.redirect-uri}")
    private String redirectUri;
    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/spotify")
    public RedirectView connectSpotifyAccount(){
        String spotifyURL =
            "https://accounts.spotify.com/authorize" +
            "?client_id=" + clientId +
            "&response_type=code" +
            "&redirect_uri=" + redirectUri +
            "&scope=user-library-read%20playlist-modify-private";
        return new RedirectView(spotifyURL);
    }

    @GetMapping ("/callback")
    public RedirectView callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            HttpSession session){
        if (code == null || error != null) {
            return new RedirectView(frontendUrl + "?auth=error");
        }

        try {
            SpotifyTokenResponse tokenResponse = authService.exchangeCodeForAccessToken(code);
            session.setAttribute("spotifyAccessToken", tokenResponse.getAccess_token());
        } catch (RestClientException e) {
            return new RedirectView(frontendUrl + "?auth=error");
        }
        return new RedirectView(frontendUrl);
    }

    @GetMapping("/status")
    public Map<String, Boolean> status(HttpSession session) {
        return Map.of("connected", session.getAttribute("spotifyAccessToken") != null);
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }
}
