package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.DeliverableResponseDTO;
import com.example.gestionprojets.entity.Project;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.repository.ProjectRepository;
import com.example.gestionprojets.service.DeliverableService;
import com.example.gestionprojets.service.FileStorageService;
import com.example.gestionprojets.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ReportController {

    private final ProjectRepository projectRepository;
    private final PdfReportService pdfReportService;
    private final FileStorageService fileStorageService;
    private final DeliverableService deliverableService;

    @GetMapping("/{projectId}/report")
    public ResponseEntity<Resource> downloadProjectReport(@PathVariable Long projectId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));
        
        if (!isMember) {
            throw new AccessDeniedException("Vous n'êtes pas membre de ce projet.");
        }

        byte[] pdfBytes = pdfReportService.generateProjectReport(project);
        ByteArrayResource resource = new ByteArrayResource(pdfBytes);

        // CORRECTION: Nom de fichier intelligent et propre
        String safeProjectName = project.getName().replaceAll("[^a-zA-Z0-9._-]", "_");
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String filename = "Rapport_" + safeProjectName + "_" + date + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    @PostMapping("/{projectId}/report/submit")
    public ResponseEntity<DeliverableResponseDTO> submitProjectReport(@PathVariable Long projectId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));
        
        if (!isMember) {
            throw new AccessDeniedException("Vous n'êtes pas membre de ce projet.");
        }

        byte[] pdfBytes = pdfReportService.generateProjectReport(project);
        
        // CORRECTION: Même logique de nommage pour la soumission
        String safeProjectName = project.getName().replaceAll("[^a-zA-Z0-9._-]", "_");
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String fileName = "Rapport_" + safeProjectName + "_" + date + ".pdf";

        String storedFileName = fileStorageService.storeFile(pdfBytes, fileName);
        
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(storedFileName)
                .toUriString();

        DeliverableResponseDTO submittedDeliverable = deliverableService.submitDeliverable(projectId, "Rapport Automatique - " + project.getName(), fileDownloadUri, currentUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(submittedDeliverable);
    }
}
