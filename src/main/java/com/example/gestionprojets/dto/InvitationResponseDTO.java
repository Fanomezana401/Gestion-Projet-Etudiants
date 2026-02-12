package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvitationResponseDTO {
    private Long id;
    private String projectName;
    private String senderName;
    private String role;
    private String status;
    private LocalDateTime sentAt;
}
