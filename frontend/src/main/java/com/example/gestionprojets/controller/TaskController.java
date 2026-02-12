package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.CreateTaskRequest;
import com.example.gestionprojets.dto.TaskResponseDTO;
import com.example.gestionprojets.dto.UpdateTaskRequest;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api") // Changement pour correspondre à la structure d'URL
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // Correction de l'URL pour correspondre au frontend
    @GetMapping("/projects/{projectId}/sprints/{sprintId}/tasks")
    public ResponseEntity<List<TaskResponseDTO>> getTasksBySprint(
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        List<TaskResponseDTO> tasks = taskService.getTasksBySprint(projectId, sprintId, currentUser);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/tasks") // Garder un endpoint simple pour la création
    public ResponseEntity<TaskResponseDTO> createTask(@RequestBody CreateTaskRequest request) {
        TaskResponseDTO createdTask = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long taskId,
            @RequestBody UpdateTaskRequest request,
            Authentication authentication) { // Ajout de l'objet Authentication
        User currentUser = (User) authentication.getPrincipal();
        TaskResponseDTO updatedTask = taskService.updateTask(taskId, request, currentUser); // Passer l'utilisateur au service
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tasks/count/completed")
    public ResponseEntity<Map<String, Long>> countCompletedTasks(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        long count = taskService.countCompletedTasksByUserId(currentUser.getId());
        return ResponseEntity.ok(Collections.singletonMap("count", count));
    }
}
