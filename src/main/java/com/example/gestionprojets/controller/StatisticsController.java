package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.StatisticsResponseDTO;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/my-stats")
    public ResponseEntity<StatisticsResponseDTO> getMyStatistics(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        StatisticsResponseDTO stats = statisticsService.getUserStatistics(currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/teacher-stats")
    public ResponseEntity<StatisticsResponseDTO> getTeacherStatistics(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (!"TEACHER".equals(currentUser.getRole().getName())) {
            throw new AccessDeniedException("You do not have permission to access this resource.");
        }
        StatisticsResponseDTO stats = statisticsService.getTeacherStatistics(currentUser.getId());
        return ResponseEntity.ok(stats);
    }
}
