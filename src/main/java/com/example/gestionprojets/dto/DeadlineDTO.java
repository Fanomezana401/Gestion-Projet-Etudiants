package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeadlineDTO {
    private Long id;
    private String name; // Nom du sprint
    private LocalDate date; // Date de fin du sprint
    private String projectName;
}
