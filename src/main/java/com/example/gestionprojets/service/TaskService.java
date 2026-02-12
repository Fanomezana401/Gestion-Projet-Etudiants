package com.example.gestionprojets.service;

import com.example.gestionprojets.dto.*;
import com.example.gestionprojets.entity.*;
import com.example.gestionprojets.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.function.Function;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final SubtaskRepository subtaskRepository;
    private final DTOMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getTasksBySprint(Long projectId, Long sprintId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        boolean isMember = project.getMembers().stream()
                .anyMatch(member -> member.getUser().getId().equals(currentUser.getId()));

        if (!isMember) {
            throw new AccessDeniedException("You are not a member of this project.");
        }

        return taskRepository.findBySprintId(sprintId).stream()
                .map(dtoMapper::toTaskDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskResponseDTO createTask(CreateTaskRequest request) {
        Sprint sprint = sprintRepository.findById(request.getSprintId())
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        User assignedUser = null;
        if (request.getAssignedUserId() != null) {
            assignedUser = userRepository.findById(request.getAssignedUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "todo");
        task.setSprint(sprint);
        task.setAssignedUser(assignedUser);

        if (request.getPrerequisiteTaskIds() != null && !request.getPrerequisiteTaskIds().isEmpty()) {
            Set<Task> prerequisites = new HashSet<>(taskRepository.findAllById(request.getPrerequisiteTaskIds()));
            task.setPrerequisites(prerequisites);
        }

        Task savedTask = taskRepository.save(task);

        if (request.getSubtasks() != null && !request.getSubtasks().isEmpty()) {
            Set<Subtask> subtasks = request.getSubtasks().stream()
                    .map(subtaskDTO -> {
                        Subtask subtask = new Subtask();
                        subtask.setTitle(subtaskDTO.getTitle());
                        subtask.setStatus(subtaskDTO.getStatus()); // CORRECTION: Utiliser getStatus()
                        subtask.setTask(savedTask);
                        return subtask;
                    })
                    .collect(Collectors.toSet());
            savedTask.setSubtasks(subtasks);
            subtaskRepository.saveAll(subtasks);
        }

        return dtoMapper.toTaskDTO(savedTask);
    }

    @Transactional
    public TaskResponseDTO updateTask(Long taskId, UpdateTaskRequest request, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Project project = task.getSprint().getProject();
        boolean isMember = project.getMembers().stream()
                .anyMatch(member -> member.getUser().getId().equals(currentUser.getId()));

        if (!isMember) {
            throw new AccessDeniedException("You are not a member of this project.");
        }

        if ("done".equalsIgnoreCase(request.getStatus()) && !"done".equalsIgnoreCase(task.getStatus())) {
            for (Task prerequisite : task.getPrerequisites()) {
                if (!"done".equalsIgnoreCase(prerequisite.getStatus())) {
                    throw new IllegalStateException("Cannot complete task. Prerequisite '" + prerequisite.getTitle() + "' is not completed.");
                }
            }
        }

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        
        if (request.getAssignedUserId() != null) {
            User assignedUser = userRepository.findById(request.getAssignedUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            task.setAssignedUser(assignedUser);
        } else {
            task.setAssignedUser(null);
        }

        if (request.getPrerequisiteTaskIds() != null) {
            Set<Task> prerequisites = new HashSet<>(taskRepository.findAllById(request.getPrerequisiteTaskIds()));
            task.setPrerequisites(prerequisites);
        }

        // CORRECTION FINALE: Logique de mise à jour manuelle et explicite des sous-tâches
        if (request.getSubtasks() != null) {
            // 1. Identifier les sous-tâches à supprimer
            Set<Long> requestSubtaskIds = request.getSubtasks().stream()
                .filter(dto -> dto.getId() != null)
                .map(SubtaskRequestDTO::getId)
                .collect(Collectors.toSet());
            
            List<Subtask> subtasksToDelete = new ArrayList<>();
            for (Subtask existingSubtask : task.getSubtasks()) {
                if (!requestSubtaskIds.contains(existingSubtask.getId())) {
                    subtasksToDelete.add(existingSubtask);
                }
            }
            task.getSubtasks().removeAll(subtasksToDelete);
            subtaskRepository.deleteAll(subtasksToDelete);

            // 2. Mettre à jour les sous-tâches existantes et ajouter les nouvelles
            for (SubtaskRequestDTO subtaskDTO : request.getSubtasks()) {
                Subtask subtask;
                if (subtaskDTO.getId() != null) {
                    // Mise à jour
                    subtask = subtaskRepository.findById(subtaskDTO.getId())
                        .orElseThrow(() -> new RuntimeException("Subtask not found"));
                    subtask.setTitle(subtaskDTO.getTitle());
                    subtask.setStatus(subtaskDTO.getStatus()); // CORRECTION: Utiliser getStatus()
                } else {
                    // Création
                    subtask = new Subtask();
                    subtask.setTitle(subtaskDTO.getTitle());
                    subtask.setStatus(subtaskDTO.getStatus()); // CORRECTION: Utiliser getStatus()
                    subtask.setTask(task);
                    task.getSubtasks().add(subtask);
                }
                subtaskRepository.save(subtask);
            }
        }

        Task updatedTask = taskRepository.save(task);
        return dtoMapper.toTaskDTO(updatedTask);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    @Transactional(readOnly = true)
    public long countCompletedTasksByUserId(Long userId) {
        return taskRepository.countByAssignedUserIdAndStatus(userId, "Terminé");
    }

    @Transactional
    public void addPrerequisite(Long taskId, Long prerequisiteId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        Task prerequisite = taskRepository.findById(prerequisiteId)
                .orElseThrow(() -> new RuntimeException("Prerequisite task not found with id: " + prerequisiteId));
        
        task.getPrerequisites().add(prerequisite);
        taskRepository.save(task);
    }

    @Transactional
    public void removePrerequisite(Long taskId, Long prerequisiteId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        
        task.getPrerequisites().removeIf(prerequisite -> prerequisite.getId().equals(prerequisiteId));
        taskRepository.save(task);
    }
}
