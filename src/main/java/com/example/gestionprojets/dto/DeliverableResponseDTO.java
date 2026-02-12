package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliverableResponseDTO {
    private Long id;
    private String name;
    private String fileUrl;
    private LocalDateTime submittedAt;
    private Long projectId;
    private String projectName;
    private Long submittedByUserId;
    private String submittedByUserFullname;
    private Integer grade; // CORRECTION: Changement du type en Integer
    private String remarks;
}
