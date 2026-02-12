package com.example.gestionprojets.controller;

import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.service.JwtService;
import com.example.gestionprojets.service.SseService;
import com.example.gestionprojets.service.UserService; // Re-importer UserService
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // Utiliser UserDetailsService

    @GetMapping(path = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestParam String token, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        final String userEmail = jwtService.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (jwtService.isTokenValid(token, userDetails)) {
            User currentUser = (User) userDetails;
            return sseService.createEmitter(currentUser.getId());
        } else {
            throw new IllegalStateException("Invalid token for SSE subscription.");
        }
    }
}
