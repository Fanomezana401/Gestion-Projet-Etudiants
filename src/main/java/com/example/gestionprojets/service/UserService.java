package com.example.gestionprojets.service;

import com.example.gestionprojets.dto.DTOMapper;
import com.example.gestionprojets.dto.StudentDTO;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DTOMapper dtoMapper;
    private final ProjectService projectService; // Injecter ProjectService pour les stats

    // ✅ Récupérer tous les utilisateurs
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Récupérer un utilisateur par ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // ✅ Sauvegarder ou mettre à jour un utilisateur
    public User saveUser(User user) {
        // Note: Lors de la sauvegarde, assurez-vous que le mot de passe est encodé
        // et que l'email est unique si c'est une nouvelle création.
        return userRepository.save(user);
    }

    // ✅ Supprimer un utilisateur
    public void deleteUser(User user) {
        userRepository.delete(user);
    }

    // ✅ Vérifier si un email existe déjà (remplace existsByUsername)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // ✅ Récupérer un utilisateur par email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // --- Méthodes pour le professeur ---
    @Transactional(readOnly = true)
    public List<StudentDTO> getSupervisedStudents(Long teacherId) {
        // Récupérer tous les étudiants qui sont membres de projets supervisés par ce professeur
        List<User> students = userRepository.findStudentsBySupervisorId(teacherId);

        return students.stream().map(student -> {
            // Calculer les stats pour chaque étudiant
            long projectsCount = projectService.countProjectsByStudentId(student.getId());
            long completedTasksCount = projectService.countCompletedTasksByStudentId(student.getId());

            return dtoMapper.toStudentDTO(student, projectsCount, completedTasksCount);
        }).collect(Collectors.toList());
    }
}
