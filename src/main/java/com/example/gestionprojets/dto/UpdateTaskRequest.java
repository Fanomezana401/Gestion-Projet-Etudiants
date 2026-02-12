package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTaskRequest {
    private String title;
    private String description;
    private String status;
    private Long assignedUserId;
    private List<SubtaskRequestDTO> subtasks; // Ajout pour les sous-tâches
    private Set<Long> prerequisiteTaskIds; // Ajout pour les prérequis
}
