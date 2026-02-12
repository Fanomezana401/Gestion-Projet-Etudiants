package com.example.gestionprojets.service;

import com.example.gestionprojets.dto.DeliverableDTO;
import com.example.gestionprojets.dto.DeliverableResponseDTO;
import com.example.gestionprojets.dto.DTOMapper;
import com.example.gestionprojets.dto.GradeRequest;
import com.example.gestionprojets.entity.Deliverable;
import com.example.gestionprojets.entity.Project;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.repository.DeliverableRepository;
import com.example.gestionprojets.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliverableService {

    private final DeliverableRepository deliverableRepository;
    private final ProjectRepository projectRepository;
    private final FileStorageService fileStorageService;
    private final DTOMapper dtoMapper;

    @Transactional
    public void gradeDeliverable(Long deliverableId, GradeRequest gradeRequest) {
        Deliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé avec l'ID : " + deliverableId));

        deliverable.setGrade(gradeRequest.getGrade());
        deliverable.setRemarks(gradeRequest.getRemarks());

        deliverableRepository.save(deliverable);
    }

    @Transactional(readOnly = true)
    public List<DeliverableDTO> getDeliverablesToGrade(Long teacherId) {
        return deliverableRepository.findAllSubmittedBySupervisorId(teacherId).stream()
                .map(dtoMapper::toDeliverableDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliverableResponseDTO submitDeliverable(Long projectId, String name, String fileUrl, User submittedBy) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'ID : " + projectId));

        Deliverable deliverable = Deliverable.builder()
                .name(name)
                .fileUrl(fileUrl)
                .submittedAt(LocalDateTime.now())
                .project(project)
                .submittedBy(submittedBy)
                .build();
        
        Deliverable savedDeliverable = deliverableRepository.save(deliverable);
        
        // On retourne un DTO simple pour éviter les problèmes de mapping
        return new DeliverableResponseDTO(
            savedDeliverable.getId(),
            savedDeliverable.getName(),
            savedDeliverable.getFileUrl(),
            savedDeliverable.getSubmittedAt(),
            savedDeliverable.getProject().getId(),
            savedDeliverable.getProject().getName(),
            savedDeliverable.getSubmittedBy().getId(),
            savedDeliverable.getSubmittedBy().getFirstname() + " " + savedDeliverable.getSubmittedBy().getLastname(),
            savedDeliverable.getGrade(),
            savedDeliverable.getRemarks()
        );
    }

    @Transactional
    public void deleteDeliverable(Long deliverableId, User currentUser) {
        Deliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new RuntimeException("Livrable non trouvé avec l'ID : " + deliverableId));

        if (!deliverable.getSubmittedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à supprimer ce livrable.");
        }

        String fileName = deliverable.getFileUrl().substring(deliverable.getFileUrl().lastIndexOf('/') + 1);
        
        fileStorageService.deleteFile(fileName);

        deliverableRepository.delete(deliverable);
    }
}
