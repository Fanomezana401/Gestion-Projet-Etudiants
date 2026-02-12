package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubtaskResponseDTO {
    private Long id;
    private String title;
    private String status; // CORRECTION: Remplacé completed par status de type String
}
