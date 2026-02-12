package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.SubtaskResponseDTO;
import com.example.gestionprojets.service.SubtaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api") // Utiliser une base commune pour la cohérence
@RequiredArgsConstructor
public class SubtaskController {

    private final SubtaskService subtaskService;

    // CORRECTION : Créer une sous-tâche comme une sous-ressource d'une tâche
    @PostMapping("/tasks/{taskId}/subtasks")
    public ResponseEntity<SubtaskResponseDTO> createSubtask(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        return ResponseEntity.ok(subtaskService.createSubtask(taskId, title));
    }

    // Mettre à jour le statut d'une sous-tâche spécifique par son propre ID
    @PutMapping("/subtasks/{subtaskId}/status")
    public ResponseEntity<SubtaskResponseDTO> updateSubtaskStatus(
            @PathVariable Long subtaskId,
            @RequestBody Map<String, String> payload) { // CORRECTION: Changer le type de payload à String
        String status = payload.get("status"); // CORRECTION: Récupérer "status"
        return ResponseEntity.ok(subtaskService.updateSubtaskStatus(subtaskId, status));
    }

    // Supprimer une sous-tâche spécifique par son propre ID
    @DeleteMapping("/subtasks/{subtaskId}")
    public ResponseEntity<Void> deleteSubtask(@PathVariable Long subtaskId) {
        subtaskService.deleteSubtask(subtaskId);
        return ResponseEntity.noContent().build();
    }
}
