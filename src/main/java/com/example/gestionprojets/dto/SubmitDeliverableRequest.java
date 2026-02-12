package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitDeliverableRequest {
    private Long projectId;
    private String name;
    private String fileUrl; // Pour l'instant, une simple URL/chemin
}
