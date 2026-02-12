package com.example.gestionprojets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDTO {
    private Long id;
    private Long senderId;
    private String senderFirstname;
    private String senderLastname;
    private String senderEmail; // Ajout de l'email de l'expéditeur
    private Long receiverId;
    private String receiverFirstname;
    private String receiverLastname;
    private Long projectId;
    private String projectName;
    private String content;
    private LocalDateTime sentAt;
    private boolean isRead;
}
