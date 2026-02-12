package com.example.gestionprojets.repository;

import com.example.gestionprojets.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // Méthode requise par notre UserDetailsService pour charger l'utilisateur par son email
    Optional<User> findByEmail(String email);

    // Méthode utilisée lors de l'inscription pour vérifier si un email est déjà pris
    boolean existsByEmail(String email);

    // --- Méthodes pour le professeur ---
    @Query("SELECT DISTINCT u FROM User u JOIN FETCH u.projectMemberships pm JOIN FETCH pm.project p JOIN p.members pms WHERE pms.user.id = :teacherId AND pms.role = 'TEACHER' AND u.role.name = 'STUDENT'")
    List<User> findStudentsBySupervisorId(Long teacherId);
}
