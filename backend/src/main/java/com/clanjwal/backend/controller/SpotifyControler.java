package com.clanjwal.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController 
public class SpotifyControler {
    @GetMapping("/api/hello")
    public String sayHello() {
        return "Hello, this is going to be an awesome playlist.";
    }
}
