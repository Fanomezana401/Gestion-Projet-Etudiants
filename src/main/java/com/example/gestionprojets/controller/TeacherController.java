package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.DeadlineDTO;
import com.example.gestionprojets.dto.DeliverableDTO;
import com.example.gestionprojets.dto.GradeRequest;
import com.example.gestionprojets.dto.ProjectResponseDTO;
import com.example.gestionprojets.dto.StatisticsResponseDTO;
import com.example.gestionprojets.dto.StudentDTO; // Import du nouveau DTO
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.service.DeliverableService;
import com.example.gestionprojets.service.ProjectService;
import com.example.gestionprojets.service.StatisticsService;
import com.example.gestionprojets.service.UserService; // Injecter UserService
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final ProjectService projectService;
    private final DeliverableService deliverableService;
    private final StatisticsService statisticsService;
    private final UserService userService; // Injecter UserService

    @GetMapping("/projects")
    public ResponseEntity<List<ProjectResponseDTO>> getSupervisedProjects(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<ProjectResponseDTO> projects = projectService.getProjectsBySupervisorId(currentUser.getId());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/projects/late")
    public ResponseEntity<List<ProjectResponseDTO>> getLateSupervisedProjects(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<ProjectResponseDTO> projects = projectService.getLateProjectsBySupervisorId(currentUser.getId());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/deadlines/next")
    public ResponseEntity<List<DeadlineDTO>> getNextDeadlines(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<DeadlineDTO> deadlines = projectService.getNextDeadlines(currentUser.getId());
        return ResponseEntity.ok(deadlines);
    }

    @GetMapping("/deliverables/latest")
    public ResponseEntity<List<DeliverableDTO>> getLatestDeliverables(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<DeliverableDTO> deliverables = projectService.getLatestDeliverables(currentUser.getId());
        return ResponseEntity.ok(deliverables);
    }

    @GetMapping("/deliverables/to-grade")
    public ResponseEntity<List<DeliverableDTO>> getDeliverablesToGrade(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<DeliverableDTO> deliverables = deliverableService.getDeliverablesToGrade(currentUser.getId());
        return ResponseEntity.ok(deliverables);
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDTO>> getSupervisedStudents(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<StudentDTO> students = userService.getSupervisedStudents(currentUser.getId());
        return ResponseEntity.ok(students);
    }

    @GetMapping("/statistics")
    public ResponseEntity<StatisticsResponseDTO> getTeacherStatistics(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        StatisticsResponseDTO stats = statisticsService.getTeacherStatistics(currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/projects/{projectId}/details")
    public ResponseEntity<ProjectResponseDTO> getProjectDetailsForGrading(@PathVariable Long projectId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        ProjectResponseDTO project = projectService.getProjectById(projectId, currentUser.getId());
        return ResponseEntity.ok(project);
    }

    @PostMapping("/deliverables/{deliverableId}/grade")
    public ResponseEntity<Void> gradeDeliverable(@PathVariable Long deliverableId, @RequestBody GradeRequest gradeRequest) {
        deliverableService.gradeDeliverable(deliverableId, gradeRequest);
        return ResponseEntity.ok().build();
    }
}
