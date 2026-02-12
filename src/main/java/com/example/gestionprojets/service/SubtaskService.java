package com.example.gestionprojets.service;

import com.example.gestionprojets.dto.DTOMapper;
import com.example.gestionprojets.dto.SubtaskResponseDTO;
import com.example.gestionprojets.entity.Subtask;
import com.example.gestionprojets.entity.Task;
import com.example.gestionprojets.repository.SubtaskRepository;
import com.example.gestionprojets.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;
    private final DTOMapper dtoMapper;

    @Transactional
    public SubtaskResponseDTO createSubtask(Long taskId, String title) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        
        Subtask subtask = Subtask.builder()
                .title(title)
                .status("À faire") // CORRECTION: Utiliser status
                .task(task)
                .build();
        
        // Sauvegarder directement la sous-tâche pour garantir la persistance et la génération de l'ID
        Subtask savedSubtask = subtaskRepository.save(subtask);
        
        return dtoMapper.toSubtaskDTO(savedSubtask);
    }

    @Transactional
    public SubtaskResponseDTO updateSubtaskStatus(Long subtaskId, String status) { // CORRECTION: Utiliser String status
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new RuntimeException("Subtask not found with id: " + subtaskId));
        
        subtask.setStatus(status); // CORRECTION: Utiliser setStatus
        
        // La transaction garantit que la modification est sauvegardée à la fin de la méthode.
        // Un save explicite est une bonne pratique pour la clarté.
        Subtask updatedSubtask = subtaskRepository.save(subtask);
        
        return dtoMapper.toSubtaskDTO(updatedSubtask);
    }

    @Transactional
    public void deleteSubtask(Long subtaskId) {
        // La suppression directe par ID est la méthode la plus simple et la plus fiable.
        if (!subtaskRepository.existsById(subtaskId)) {
            throw new RuntimeException("Subtask not found with id: " + subtaskId);
        }
        subtaskRepository.deleteById(subtaskId);
    }
}
