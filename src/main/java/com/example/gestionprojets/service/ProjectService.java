package com.example.gestionprojets.service;

import com.example.gestionprojets.dto.CreateProjectRequest;
import com.example.gestionprojets.dto.DTOMapper;
import com.example.gestionprojets.dto.DeadlineDTO;
import com.example.gestionprojets.dto.DeliverableDTO;
import com.example.gestionprojets.dto.ProjectResponseDTO;
import com.example.gestionprojets.dto.UpdateProjectRequest;
import com.example.gestionprojets.entity.*;
import com.example.gestionprojets.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final InvitationRepository invitationRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final DTOMapper dtoMapper;
    private final SseService sseService;
    private final SprintRepository sprintRepository;
    private final DeliverableRepository deliverableRepository;
    private final TaskRepository taskRepository; // Injecter TaskRepository

    @Transactional(readOnly = true)
    public List<ProjectResponseDTO> getProjectsByOwnerId(Long ownerId) {
        return projectRepository.findProjectsByUserId(ownerId).stream()
                .map(project -> dtoMapper.toProjectDTO(project, ownerId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponseDTO getProjectById(Long projectId, Long currentUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return dtoMapper.toProjectDTO(project, currentUserId);
    }

    @Transactional
    public ProjectResponseDTO createProject(CreateProjectRequest request, User owner) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus("Nouveau");

        Project savedProject = projectRepository.save(project);

        ProjectMember ownerMembership = new ProjectMember(savedProject, owner, "OWNER");
        projectMemberRepository.save(ownerMembership);

        if (request.getMemberEmails() != null) {
            for (String email : request.getMemberEmails()) {
                Invitation invitation = new Invitation();
                invitation.setEmail(email);
                invitation.setProject(savedProject);
                invitation.setSender(owner);
                invitation.setRole("MEMBER");
                invitation.setStatus("PENDING");
                invitation.setSentAt(LocalDateTime.now());
                invitationRepository.save(invitation);
                
                userRepository.findByEmail(email).ifPresent(invitedUser -> 
                    sseService.sendEventToUser(invitedUser.getId(), "newInvitation", "Vous avez reçu une nouvelle invitation de projet.")
                );
            }
        }

        if (request.getSupervisorEmail() != null && !request.getSupervisorEmail().isEmpty()) {
            User supervisor = userRepository.findByEmail(request.getSupervisorEmail())
                    .orElseThrow(() -> new RuntimeException("Supervisor user not found with email: " + request.getSupervisorEmail()));
            
            ProjectMember supervisorMembership = new ProjectMember(savedProject, supervisor, "TEACHER"); // Créer ProjectMember pour le professeur
            projectMemberRepository.save(supervisorMembership);

            // Envoyer une invitation si l'utilisateur n'est pas déjà membre (optionnel, dépend de la logique métier)
            // Pour l'instant, nous supposons que l'ajout direct est suffisant pour le superviseur
            sseService.sendEventToUser(supervisor.getId(), "newProjectAssignment", "Vous avez été assigné à un nouveau projet en tant que superviseur.");
        }
        
        Set<Sprint> sprints = new HashSet<>();
        LocalDate sprintStartDate = LocalDate.now();
        for (int i = 1; i <= request.getNumberOfSprints(); i++) {
            LocalDate sprintEndDate = sprintStartDate.plusDays(request.getSprintDurationInDays() - 1);
            Sprint sprint = new Sprint("Sprint " + i, i, sprintStartDate, sprintEndDate, i == 1 ? "Actif" : "À venir", savedProject);
            sprints.add(sprint);
            sprintStartDate = sprintEndDate.plusDays(1);
        }
        savedProject.setSprints(sprints);
        
        projectRepository.save(savedProject);
        return dtoMapper.toProjectDTO(savedProject, owner.getId());
    }

    @Transactional
    public ProjectResponseDTO updateProject(Long projectId, UpdateProjectRequest request, Long currentUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());

        Project updatedProject = projectRepository.save(project);
        return dtoMapper.toProjectDTO(updatedProject, currentUserId);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        projectRepository.deleteById(projectId);
    }

    // --- Méthodes pour le professeur ---

    @Transactional(readOnly = true)
    public List<ProjectResponseDTO> getProjectsBySupervisorId(Long supervisorId) {
        return projectRepository.findProjectsBySupervisorId(supervisorId).stream()
                .map(project -> dtoMapper.toProjectDTO(project, supervisorId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDTO> getLateProjectsBySupervisorId(Long supervisorId) {
        return projectRepository.findLateProjectsBySupervisorId(supervisorId).stream()
                .map(project -> dtoMapper.toProjectDTO(project, supervisorId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeadlineDTO> getNextDeadlines(Long supervisorId) {
        return sprintRepository.findNextDeadlinesBySupervisorId(supervisorId).stream()
                .map(dtoMapper::toDeadlineDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliverableDTO> getLatestDeliverables(Long supervisorId) {
        return deliverableRepository.findLatestDeliverablesBySupervisorId(supervisorId).stream()
                .map(dtoMapper::toDeliverableDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countProjectsByStudentId(Long studentId) {
        return projectRepository.countProjectsByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public long countCompletedTasksByStudentId(Long studentId) {
        return taskRepository.countCompletedTasksByStudentId(studentId);
    }
}
