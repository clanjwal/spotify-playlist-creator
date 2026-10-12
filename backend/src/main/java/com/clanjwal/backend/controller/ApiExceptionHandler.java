package com.clanjwal.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpSession;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason() == null ? "" : e.getReason()));
    }

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Map<String, String>> handleSpotifyError(HttpClientErrorException e, HttpSession session) {
        if (e.getStatusCode().isSameCodeAs(HttpStatus.UNAUTHORIZED)) {
            // The access token expired or was revoked, so drop it and make the user reconnect
            session.invalidate();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Your Spotify session expired. Please reconnect."));
        }
        return ResponseEntity.status(e.getStatusCode())
            .body(Map.of("message", "Spotify rejected the request (" + e.getStatusCode().value() + ")."));
    }
}
