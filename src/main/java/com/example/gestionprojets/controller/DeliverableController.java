package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.DeliverableResponseDTO;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.service.DeliverableService;
import com.example.gestionprojets.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/deliverables")
@RequiredArgsConstructor
public class DeliverableController {

    private final DeliverableService deliverableService;
    private final FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<DeliverableResponseDTO> submitDeliverable(
            @RequestParam("name") String name,
            @RequestParam("projectId") Long projectId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        String fileName = fileStorageService.storeFile(file);
        
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();

        DeliverableResponseDTO submittedDeliverable = deliverableService.submitDeliverable(projectId, name, fileDownloadUri, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(submittedDeliverable);
    }

    @DeleteMapping("/{deliverableId}")
    public ResponseEntity<Void> deleteDeliverable(@PathVariable Long deliverableId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        deliverableService.deleteDeliverable(deliverableId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
