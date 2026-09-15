package com.clanjwal.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;


@RestController
@RequestMapping ("/api/auth")
public class AuthController {
    @Value("${spotify.client-id}")
    private String clientId;
    // @Value("${spotify.client-secret}")
    // private String clientSecret;
    @Value("${spotify.redirect-uri}")
    private String redirectUri;

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
    public String callback(@RequestParam String code){
        return "Authorization code received: " + code;
    }
}
