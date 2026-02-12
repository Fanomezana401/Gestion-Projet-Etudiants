package com.example.gestionprojets.repository;

import com.example.gestionprojets.entity.Deliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliverableRepository extends JpaRepository<Deliverable, Long> {

    // --- Méthodes pour le professeur ---
    @Query("SELECT d FROM Deliverable d JOIN FETCH d.project p JOIN FETCH p.members pm WHERE pm.user.id = :supervisorId AND pm.role = 'TEACHER' ORDER BY d.submittedAt DESC")
    List<Deliverable> findLatestDeliverablesBySupervisorId(Long supervisorId);

    // CORRECTION: Renvoie TOUS les livrables soumis (notés ou non) pour un superviseur
    @Query("SELECT d FROM Deliverable d JOIN FETCH d.project p JOIN FETCH p.members pm WHERE pm.user.id = :supervisorId AND pm.role = 'TEACHER' ORDER BY d.submittedAt DESC")
    List<Deliverable> findAllSubmittedBySupervisorId(Long supervisorId);

    // --- Nouvelle méthode pour les statistiques ---
    @Query("SELECT COUNT(d) FROM Deliverable d JOIN d.project p JOIN p.members m WHERE m.user.id = :teacherId AND m.role = 'TEACHER' AND d.grade IS NULL")
    long countDeliverablesToGradeByTeacherId(Long teacherId);
}
