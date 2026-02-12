package com.example.gestionprojets.repository;

import com.example.gestionprojets.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Trouve tous les projets où un utilisateur est membre, en chargeant les sprints et les tâches
    @Query("SELECT DISTINCT p FROM Project p JOIN p.members m LEFT JOIN FETCH p.sprints s LEFT JOIN FETCH s.tasks t WHERE m.user.id = :userId")
    List<Project> findProjectsByUserId(Long userId);

    // Récupère un projet avec ses membres et les utilisateurs associés
    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.members m LEFT JOIN FETCH m.user WHERE p.id = :projectId")
    Optional<Project> findByIdWithMembers(Long projectId);

    // --- Méthodes pour le professeur ---

    @Query("SELECT DISTINCT p FROM Project p JOIN FETCH p.members pm JOIN FETCH pm.user WHERE pm.user.id = :teacherId AND pm.role = 'TEACHER'")
    List<Project> findProjectsBySupervisorId(Long teacherId);

    @Query("SELECT DISTINCT p FROM Project p JOIN FETCH p.members pm JOIN FETCH pm.user WHERE pm.user.id = :teacherId AND pm.role = 'TEACHER' AND p.status = 'En retard'")
    List<Project> findLateProjectsBySupervisorId(Long teacherId);

    @Query("SELECT COUNT(DISTINCT pm.project.id) FROM ProjectMember pm WHERE pm.user.id = :studentId AND pm.role = 'MEMBER'")
    long countProjectsByStudentId(Long studentId);

    // --- Nouvelles méthodes pour les statistiques ---

    @Query("SELECT COUNT(DISTINCT p) FROM Project p JOIN p.members m WHERE m.user.id = :userId")
    long countAllByUserId(Long userId);

    @Query("SELECT COUNT(DISTINCT p) FROM Project p JOIN p.members m WHERE m.user.id = :userId AND p.status = :status")
    long countByUserIdAndStatus(Long userId, String status);

    @Query("SELECT COUNT(DISTINCT p) FROM Project p JOIN p.members m WHERE m.user.id = :teacherId AND m.role = 'TEACHER'")
    long countAllBySupervisorId(Long teacherId);

    @Query("SELECT COUNT(DISTINCT p) FROM Project p JOIN p.members m WHERE m.user.id = :teacherId AND m.role = 'TEACHER' AND p.status = :status")
    long countBySupervisorIdAndStatus(Long teacherId, String status);
}
