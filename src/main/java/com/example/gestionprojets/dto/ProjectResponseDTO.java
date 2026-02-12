package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponseDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private int progress;
    private List<SprintResponseDTO> sprints;
    private long unreadMessages;
    private List<StudentDTO> students; // Ajout des étudiants
    private String supervisorName; // Ajout du nom du superviseur
    private List<DeliverableDTO> deliverables; // Ajout des livrables
}
