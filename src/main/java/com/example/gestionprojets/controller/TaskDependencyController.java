package com.example.gestionprojets.controller;

import com.example.gestionprojets.service.TaskDependencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks/{taskId}/dependencies")
@RequiredArgsConstructor
public class TaskDependencyController {

    private final TaskDependencyService taskDependencyService;

    @PostMapping("/{prerequisiteTaskId}")
    public ResponseEntity<Void> addPrerequisite(
            @PathVariable Long taskId,
            @PathVariable Long prerequisiteTaskId) {
        taskDependencyService.addPrerequisite(taskId, prerequisiteTaskId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{prerequisiteTaskId}")
    public ResponseEntity<Void> removePrerequisite(
            @PathVariable Long taskId,
            @PathVariable Long prerequisiteTaskId) {
        taskDependencyService.removePrerequisite(taskId, prerequisiteTaskId);
        return ResponseEntity.ok().build();
    }
}
