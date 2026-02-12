package com.example.gestionprojets.repository;

import com.example.gestionprojets.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findBySprintId(Long sprintId);

    long countByAssignedUserIdAndStatus(Long userId, String status);

    // --- Méthodes pour le professeur ---
    @Query("SELECT COUNT(t) FROM Task t JOIN t.sprint s JOIN s.project p JOIN p.members pm WHERE pm.user.id = :studentId AND pm.role = 'MEMBER' AND t.status = 'Terminé'")
    long countCompletedTasksByStudentId(Long studentId);

    // --- Nouvelles méthodes pour les statistiques ---

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedUser.id = :userId")
    long countAllByAssignedUserId(Long userId);

    // Pour le professeur : compter toutes les tâches dans les projets supervisés
    @Query("SELECT COUNT(t) FROM Task t JOIN t.sprint s JOIN s.project p JOIN p.members m WHERE m.user.id = :teacherId AND m.role = 'TEACHER'")
    long countAllBySupervisorId(Long teacherId);

    @Query("SELECT COUNT(t) FROM Task t JOIN t.sprint s JOIN s.project p JOIN p.members m WHERE m.user.id = :teacherId AND m.role = 'TEACHER' AND t.status = :status")
    long countBySupervisorIdAndStatus(Long teacherId, String status);
}
