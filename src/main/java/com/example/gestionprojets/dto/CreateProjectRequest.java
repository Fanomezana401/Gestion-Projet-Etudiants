package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateProjectRequest {
    private String name;
    private String description;
    private int numberOfSprints;
    private int sprintDurationInDays;
    private List<String> memberEmails; // Emails des membres de l'équipe
    private String supervisorEmail; // Email du professeur superviseur
}
