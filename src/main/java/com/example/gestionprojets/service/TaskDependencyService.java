package com.example.gestionprojets.service;

import com.example.gestionprojets.entity.Task;
import com.example.gestionprojets.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskDependencyService {

    private final TaskRepository taskRepository;

    @Transactional
    public void addPrerequisite(Long taskId, Long prerequisiteTaskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        Task prerequisiteTask = taskRepository.findById(prerequisiteTaskId)
                .orElseThrow(() -> new RuntimeException("Prerequisite task not found with id: " + prerequisiteTaskId));

        // Éviter les dépendances circulaires simples
        if (prerequisiteTask.getPrerequisites().contains(task)) {
            throw new IllegalStateException("Circular dependency detected.");
        }

        task.getPrerequisites().add(prerequisiteTask);
        taskRepository.save(task);
    }

    @Transactional
    public void removePrerequisite(Long taskId, Long prerequisiteTaskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        
        task.getPrerequisites().removeIf(prerequisite -> prerequisite.getId().equals(prerequisiteTaskId));
        taskRepository.save(task);
    }
}
