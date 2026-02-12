package com.example.gestionprojets.repository;

import com.example.gestionprojets.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Récupère tous les messages d'un projet où l'utilisateur est soit l'expéditeur, soit le destinataire
    @Query("SELECT m FROM Message m WHERE m.project.id = :projectId AND (m.sender.id = :userId OR m.receiver.id = :userId) ORDER BY m.sentAt ASC")
    List<Message> findConversationForProject(Long projectId, Long userId);

    long countByReceiverIdAndIsReadFalse(Long receiverId);

    List<Message> findByProjectIdAndReceiverIdAndIsReadFalse(Long projectId, Long userId);

    long countByProjectIdAndReceiverIdAndIsReadFalse(Long projectId, Long receiverId);

    // Nouvelle méthode pour compter les messages non lus par projet pour un utilisateur
    @Query("SELECT m.project.id, COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = FALSE GROUP BY m.project.id")
    List<Object[]> countUnreadMessagesPerProject(Long userId);
}
