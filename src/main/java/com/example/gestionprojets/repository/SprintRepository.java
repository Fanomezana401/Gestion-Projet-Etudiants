package com.example.gestionprojets.repository;

import com.example.gestionprojets.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    // Méthode pour trouver les sprints d'un projet donné, triés par numéro de sprint
    List<Sprint> findByProjectIdOrderBySprintNumberAsc(Long projectId);

    // --- Méthodes pour le professeur ---
    @Query("SELECT s FROM Sprint s JOIN FETCH s.project p JOIN FETCH p.members pm WHERE pm.user.id = :supervisorId AND pm.role = 'TEACHER' AND s.endDate >= CURRENT_DATE ORDER BY s.endDate ASC")
    List<Sprint> findNextDeadlinesBySupervisorId(Long supervisorId);
}
