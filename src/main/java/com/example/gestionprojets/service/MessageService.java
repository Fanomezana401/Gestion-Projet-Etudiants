package com.example.gestionprojets.service;

import com.example.gestionprojets.dto.DTOMapper;
import com.example.gestionprojets.dto.MessageResponseDTO;
import com.example.gestionprojets.dto.SendMessageRequest;
import com.example.gestionprojets.entity.Message;
import com.example.gestionprojets.entity.Project;
import com.example.gestionprojets.entity.ProjectMember;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.repository.MessageRepository;
import com.example.gestionprojets.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ProjectRepository projectRepository;
    private final DTOMapper dtoMapper;
    private final SseService sseService;
    private final UserActivityService userActivityService;

    @Transactional
    public void sendMessage(SendMessageRequest request, User sender) {
        Project project = projectRepository.findByIdWithMembers(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        LocalDateTime timestamp = LocalDateTime.now();

        // 1. Sauvegarder les messages
        List<Message> messagesToSave = new ArrayList<>();
        for (ProjectMember member : project.getMembers()) {
            boolean isSender = member.getUser().getId().equals(sender.getId());
            boolean isReceiverInConversation = userActivityService.isUserInConversation(member.getUser().getId(), project.getId());

            Message message = new Message();
            message.setSender(sender);
            message.setReceiver(member.getUser());
            message.setProject(project);
            message.setContent(request.getContent());
            message.setSentAt(timestamp);
            message.setRead(isSender || isReceiverInConversation);
            messagesToSave.add(message);
        }
        messageRepository.saveAll(messagesToSave);

        // 2. Envoyer les notifications SSE
        // Récupérer les messages sauvegardés pour avoir les IDs et les états isRead corrects
        List<MessageResponseDTO> messagesToNotify = messagesToSave.stream()
                .map(dtoMapper::toMessageDTO)
                .collect(Collectors.toList());

        for (ProjectMember member : project.getMembers()) {
            Long memberId = member.getUser().getId();
            
            // Trouver le DTO spécifique à ce membre (pour avoir le bon isRead)
            MessageResponseDTO messageForMember = messagesToNotify.stream()
                .filter(msgDto -> msgDto.getReceiverId().equals(memberId))
                .findFirst()
                .orElse(null);

            if (messageForMember != null) {
                // Envoyer le nouveau message à tout le monde pour l'affichage en temps réel
                sseService.sendEventToUser(memberId, "newMessage", messageForMember);
            }

            // Mettre à jour le compteur de messages non lus POUR CE PROJET SPÉCIFIQUE
            long projectUnreadCount = messageRepository.countByProjectIdAndReceiverIdAndIsReadFalse(project.getId(), memberId);
            sseService.sendEventToUser(memberId, "projectUnreadCountUpdate", Map.of("projectId", project.getId(), "count", projectUnreadCount));
        }
    }

    @Transactional(readOnly = true)
    public List<MessageResponseDTO> getProjectMessages(Long projectId, Long userId) {
        return messageRepository.findConversationForProject(projectId, userId).stream()
                .map(dtoMapper::toMessageDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<Long, Long> getUnreadMessagesCountsPerProject(Long userId) {
        return messageRepository.countUnreadMessagesPerProject(userId).stream()
                .collect(Collectors.toMap(
                        obj -> (Long) obj[0],
                        obj -> (Long) obj[1]
                ));
    }

    @Transactional(readOnly = true)
    public long countUnreadMessages(Long userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markMessagesAsRead(Long projectId, Long userId) {
        List<Message> messages = messageRepository.findByProjectIdAndReceiverIdAndIsReadFalse(projectId, userId);
        if (!messages.isEmpty()) {
            messages.forEach(message -> message.setRead(true));
            messageRepository.saveAll(messages);
            // Envoyer un événement pour mettre à jour le compteur de ce projet à 0
            sseService.sendEventToUser(userId, "projectUnreadCountUpdate", Map.of("projectId", projectId, "count", 0L));
            // Envoyer un événement pour mettre à jour l'état isRead des messages sur le frontend
            sseService.sendEventToUser(userId, "messagesReadUpdate", Map.of("projectId", projectId));
        }
    }
}
