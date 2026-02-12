package com.example.gestionprojets.dto;

import com.example.gestionprojets.entity.*;
import com.example.gestionprojets.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DTOMapper {

    private final MessageRepository messageRepository;

    public SubtaskResponseDTO toSubtaskDTO(Subtask subtask) {
        return new SubtaskResponseDTO(
                subtask.getId(),
                subtask.getTitle(),
                subtask.getStatus()
        );
    }

    public TaskResponseDTO toTaskDTO(Task task) {
        Long assignedUserId = task.getAssignedUser() != null ? task.getAssignedUser().getId() : null;
        String assignedUserFirstname = task.getAssignedUser() != null ? task.getAssignedUser().getFirstname() : null;
        String assignedUserLastname = task.getAssignedUser() != null ? task.getAssignedUser().getLastname() : null;

        Set<Long> prerequisiteTaskIds = task.getPrerequisites().stream()
                .map(Task::getId)
                .collect(Collectors.toSet());

        List<SubtaskResponseDTO> subtasks = task.getSubtasks().stream()
                .map(this::toSubtaskDTO)
                .collect(Collectors.toList());

        return new TaskResponseDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getSprint() != null ? task.getSprint().getId() : null,
                assignedUserId,
                assignedUserFirstname,
                assignedUserLastname,
                prerequisiteTaskIds,
                subtasks
        );
    }

    public SprintResponseDTO toSprintDTO(Sprint sprint) {
        return new SprintResponseDTO(
                sprint.getId(),
                sprint.getName(),
                sprint.getSprintNumber(),
                sprint.getStartDate(),
                sprint.getEndDate(),
                sprint.getStatus(),
                sprint.getTasks() != null
                        ? sprint.getTasks().stream().map(this::toTaskDTO).collect(Collectors.toList())
                        : Collections.emptyList()
        );
    }

    public ProjectResponseDTO toProjectDTO(Project project, Long currentUserId) {
        Set<Sprint> sprints = project.getSprints();
        int progress = 0;
        String status = "Nouveau";

        if (sprints != null && !sprints.isEmpty()) {
            List<Task> allTasks = sprints.stream()
                                        .flatMap(s -> Optional.ofNullable(s.getTasks()).orElse(Collections.emptySet()).stream())
                                        .collect(Collectors.toList());

            if (!allTasks.isEmpty()) {
                long completedTasks = allTasks.stream().filter(t -> "Terminé".equals(t.getStatus())).count();
                progress = (int) (((double) completedTasks / allTasks.size()) * 100);

                if (progress == 100) {
                    status = "Terminé";
                } else if (progress > 0) {
                    status = "En cours";
                }
            }
        }

        long unreadMessages = messageRepository.countByProjectIdAndReceiverIdAndIsReadFalse(project.getId(), currentUserId);

        List<StudentDTO> students = project.getMembers().stream()
                .filter(pm -> "MEMBER".equals(pm.getRole()))
                .map(pm -> toStudentDTO(pm.getUser(), 0, 0))
                .collect(Collectors.toList());

        String supervisorName = project.getMembers().stream()
                .filter(pm -> "TEACHER".equals(pm.getRole()))
                .map(pm -> pm.getUser().getFirstname() + " " + pm.getUser().getLastname())
                .findFirst()
                .orElse("Non assigné");

        List<DeliverableDTO> deliverables = project.getDeliverables().stream()
                .map(this::toDeliverableDTO)
                .collect(Collectors.toList());


        return new ProjectResponseDTO(
                project.getId(),
                project.getName(),
                project.getDescription(),
                status,
                progress,
                sprints != null ? sprints.stream().map(this::toSprintDTO).collect(Collectors.toList()) : Collections.emptyList(),
                unreadMessages,
                students,
                supervisorName,
                deliverables
        );
    }

    public UserResponseDTO toUserDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getAssignedTasks() != null
                        ? user.getAssignedTasks().stream().map(this::toTaskDTO).collect(Collectors.toList())
                        : Collections.emptyList()
        );
    }

    public MessageResponseDTO toMessageDTO(Message message) {
        return new MessageResponseDTO(
                message.getId(),
                message.getSender() != null ? message.getSender().getId() : null,
                message.getSender() != null ? message.getSender().getFirstname() : null,
                message.getSender() != null ? message.getSender().getLastname() : null,
                message.getSender() != null ? message.getSender().getEmail() : null,
                message.getReceiver() != null ? message.getReceiver().getId() : null,
                message.getReceiver() != null ? message.getReceiver().getFirstname() : null,
                message.getReceiver() != null ? message.getReceiver().getLastname() : null,
                message.getProject() != null ? message.getProject().getId() : null,
                message.getProject() != null ? message.getProject().getName() : null,
                message.getContent(),
                message.getSentAt(),
                message.isRead()
        );
    }

    public InvitationResponseDTO toInvitationDTO(Invitation invitation) {
        return new InvitationResponseDTO(
                invitation.getId(),
                invitation.getProject().getName(),
                invitation.getSender().getFirstname() + " " + invitation.getSender().getLastname(),
                invitation.getRole(),
                invitation.getStatus(),
                invitation.getSentAt()
        );
    }

    public DeadlineDTO toDeadlineDTO(Sprint sprint) {
        return new DeadlineDTO(
                sprint.getId(),
                sprint.getName(),
                sprint.getEndDate(),
                sprint.getProject() != null ? sprint.getProject().getName() : null
        );
    }

    public DeliverableDTO toDeliverableDTO(Deliverable deliverable) {
        return new DeliverableDTO(
                deliverable.getId(),
                deliverable.getName(),
                deliverable.getFileUrl(),
                deliverable.getSubmittedAt(),
                deliverable.getProject() != null ? deliverable.getProject().getName() : null,
                deliverable.getSubmittedBy() != null ? deliverable.getSubmittedBy().getId() : null,
                deliverable.getGrade(),
                deliverable.getRemarks()
        );
    }

    public DeliverableResponseDTO toDeliverableResponseDTO(Deliverable deliverable) {
        return new DeliverableResponseDTO(
                deliverable.getId(),
                deliverable.getName(),
                deliverable.getFileUrl(),
                deliverable.getSubmittedAt(),
                deliverable.getProject() != null ? deliverable.getProject().getId() : null,
                deliverable.getProject() != null ? deliverable.getProject().getName() : null,
                deliverable.getSubmittedBy() != null ? deliverable.getSubmittedBy().getId() : null,
                deliverable.getSubmittedBy() != null ? deliverable.getSubmittedBy().getFirstname() + " " + deliverable.getSubmittedBy().getLastname() : null,
                deliverable.getGrade(), 
                deliverable.getRemarks()
        );
    }

    public StudentDTO toStudentDTO(User user, long projectsCount, long completedTasksCount) {
        return new StudentDTO(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                projectsCount,
                completedTasksCount
        );
    }

    public void updateSubtaskFromDTO(SubtaskUpdateRequestDTO dto, Subtask subtask) {
        if (dto.getTitle() != null) {
            subtask.setTitle(dto.getTitle());
        }
        if (dto.getCompleted() != null) {
            subtask.setStatus(dto.getCompleted() ? "Fait" : "À faire");
        }
    }
}
