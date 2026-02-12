package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.CreateProjectRequest;
import com.example.gestionprojets.dto.ProjectResponseDTO;
import com.example.gestionprojets.dto.UpdateProjectRequest;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/my-projects")
    public ResponseEntity<List<ProjectResponseDTO>> getMyProjects(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<ProjectResponseDTO> projects = projectService.getProjectsByOwnerId(currentUser.getId());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Long projectId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        ProjectResponseDTO project = projectService.getProjectById(projectId, currentUser.getId());
        return ResponseEntity.ok(project);
    }

    @PostMapping
    public ResponseEntity<ProjectResponseDTO> createProject(@RequestBody CreateProjectRequest request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        ProjectResponseDTO createdProject = projectService.createProject(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponseDTO> updateProject(@PathVariable Long projectId, @RequestBody UpdateProjectRequest request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        ProjectResponseDTO updatedProject = projectService.updateProject(projectId, request, currentUser.getId());
        return ResponseEntity.ok(updatedProject);
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }

    // --- Endpoints pour le professeur ---

    @GetMapping("/supervised")
    public ResponseEntity<List<ProjectResponseDTO>> getSupervisedProjects(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (!"TEACHER".equals(currentUser.getRole().getName())) {
            throw new AccessDeniedException("You do not have permission to access this resource.");
        }
        List<ProjectResponseDTO> projects = projectService.getProjectsBySupervisorId(currentUser.getId());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/supervised/late")
    public ResponseEntity<List<ProjectResponseDTO>> getLateSupervisedProjects(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (!"TEACHER".equals(currentUser.getRole().getName())) {
            throw new AccessDeniedException("You do not have permission to access this resource.");
        }
        List<ProjectResponseDTO> projects = projectService.getLateProjectsBySupervisorId(currentUser.getId());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/deadlines/next")
    public ResponseEntity<List<Object>> getNextDeadlines(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (!"TEACHER".equals(currentUser.getRole().getName())) {
            throw new AccessDeniedException("You do not have permission to access this resource.");
        }
        // TODO: Implémenter la logique dans ProjectService pour récupérer les prochaines deadlines
        return ResponseEntity.ok(List.of()); // Placeholder
    }

    @GetMapping("/deliverables/latest")
    public ResponseEntity<List<Object>> getLatestDeliverables(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if (!"TEACHER".equals(currentUser.getRole().getName())) {
            throw new AccessDeniedException("You do not have permission to access this resource.");
        }
        // TODO: Implémenter la logique dans ProjectService pour récupérer les derniers livrables
        return ResponseEntity.ok(List.of()); // Placeholder
    }
}
