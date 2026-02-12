package com.example.gestionprojets.controller;

import com.example.gestionprojets.dto.InvitationResponseDTO;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.service.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @GetMapping("/my-invitations")
    public ResponseEntity<List<InvitationResponseDTO>> getMyInvitations(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<InvitationResponseDTO> invitations = invitationService.getMyInvitations(currentUser.getEmail());
        return ResponseEntity.ok(invitations);
    }

    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<Void> acceptInvitation(@PathVariable Long invitationId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        invitationService.acceptInvitation(invitationId, currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{invitationId}/decline")
    public ResponseEntity<Void> declineInvitation(@PathVariable Long invitationId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        invitationService.declineInvitation(invitationId, currentUser);
        return ResponseEntity.ok().build();
    }
}
