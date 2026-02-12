package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Long sprintId;
    private Long assignedUserId;
    private String assignedUserFirstname;
    private String assignedUserLastname;
    private Set<Long> prerequisiteTaskIds;
    private List<SubtaskResponseDTO> subtasks; // Ajout de la liste des sous-tâches
}
