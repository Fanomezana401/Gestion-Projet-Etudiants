package com.example.gestionprojets.service;

import com.example.gestionprojets.dto.StatsSummaryDTO;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.repository.DeliverableRepository;
import com.example.gestionprojets.repository.ProjectMemberRepository;
import com.example.gestionprojets.repository.ProjectRepository;
import com.example.gestionprojets.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final DeliverableRepository deliverableRepository;

    @Transactional(readOnly = true)
    public StatsSummaryDTO getStatsSummary(User user) {
        StatsSummaryDTO stats = new StatsSummaryDTO();

        if ("TEACHER".equals(user.getRole().getName())) {
            stats.setTotalProjects(projectRepository.countAllBySupervisorId(user.getId()));
            stats.setActiveProjects(projectRepository.countBySupervisorIdAndStatus(user.getId(), "Actif"));
            stats.setCompletedProjects(projectRepository.countBySupervisorIdAndStatus(user.getId(), "Terminé"));
            
            stats.setTotalTasks(taskRepository.countAllBySupervisorId(user.getId()));
            stats.setCompletedTasks(taskRepository.countBySupervisorIdAndStatus(user.getId(), "Terminé"));
            stats.setPendingTasks(stats.getTotalTasks() - stats.getCompletedTasks());
            
            stats.setTotalStudents(projectMemberRepository.countDistinctStudentsByTeacherId(user.getId()));
            stats.setDeliverablesToGrade(deliverableRepository.countDeliverablesToGradeByTeacherId(user.getId()));
        } else {
            // Pour les étudiants
            stats.setTotalProjects(projectRepository.countAllByUserId(user.getId()));
            stats.setActiveProjects(projectRepository.countByUserIdAndStatus(user.getId(), "Actif"));
            stats.setCompletedProjects(projectRepository.countByUserIdAndStatus(user.getId(), "Terminé"));
            
            stats.setTotalTasks(taskRepository.countAllByAssignedUserId(user.getId()));
            stats.setCompletedTasks(taskRepository.countByAssignedUserIdAndStatus(user.getId(), "Terminé"));
            stats.setPendingTasks(stats.getTotalTasks() - stats.getCompletedTasks());
            
            // Ces champs ne sont pas pertinents pour les étudiants, on peut les laisser à 0 ou null
            stats.setTotalStudents(0);
            stats.setDeliverablesToGrade(0);
        }

        return stats;
    }
}
