package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsSummaryDTO {
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    
    // Pour les professeurs
    private long totalStudents;
    private long deliverablesToGrade;
}
