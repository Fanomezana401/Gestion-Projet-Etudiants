package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubtaskRequestDTO {
    private Long id; // Ajout de l'ID pour la mise à jour
    private String title;
    private String status; // CORRECTION: Remplacé completed par status de type String
}
