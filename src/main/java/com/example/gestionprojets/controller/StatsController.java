package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.StatsSummaryDTO;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/summary")
    public ResponseEntity<StatsSummaryDTO> getStatsSummary(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        StatsSummaryDTO stats = statsService.getStatsSummary(currentUser);
        return ResponseEntity.ok(stats);
    }
}
