package com.clanjwal.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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
    public String callback(@RequestParam String code, HttpSession session){
        SpotifyTokenResponse tokenResponse = authService.exchangeCodeForAccessToken(code);
        
        session.setAttribute("spotifyAccessToken", tokenResponse.getAccess_token());
        return "Spotify account connected successfully!";
    }
}
