package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.MessageResponseDTO;
import com.example.gestionprojets.dto.SendMessageRequest;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<Void> sendMessage(@RequestBody SendMessageRequest request, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        messageService.sendMessage(request, currentUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<MessageResponseDTO>> getProjectMessages(
            @PathVariable Long projectId,
            Authentication authentication
            // Suppression des paramètres @RequestParam(defaultValue = "0") int page,
            // et @RequestParam(defaultValue = "20") int size
    ) {
        User currentUser = (User) authentication.getPrincipal();
        List<MessageResponseDTO> messages = messageService.getProjectMessages(projectId, currentUser.getId());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/count/unread")
    public ResponseEntity<Map<String, Long>> countUnreadMessages(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        long count = messageService.countUnreadMessages(currentUser.getId());
        return ResponseEntity.ok(Collections.singletonMap("count", count));
    }

    @GetMapping("/count/unread-per-project")
    public ResponseEntity<Map<Long, Long>> getUnreadMessagesCountsPerProject(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Map<Long, Long> counts = messageService.getUnreadMessagesCountsPerProject(currentUser.getId());
        return ResponseEntity.ok(counts);
    }

    @PutMapping("/project/{projectId}/mark-as-read")
    public ResponseEntity<Void> markProjectMessagesAsRead(@PathVariable Long projectId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        messageService.markMessagesAsRead(projectId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
