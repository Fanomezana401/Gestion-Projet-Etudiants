package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliverableDTO {
    private Long id;
    private String name;
    private String fileUrl;
    private LocalDateTime submittedAt;
    private String projectName;
    private Long submittedByUserId;
    private Integer grade; // CORRECTION: Ajout de la note
    private String remarks; // CORRECTION: Ajout des remarques
}
