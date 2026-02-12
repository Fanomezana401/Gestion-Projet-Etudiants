package com.example.gestionprojets.service;

import com.example.gestionprojets.dto.DTOMapper;
import com.example.gestionprojets.dto.InvitationResponseDTO;
import com.example.gestionprojets.entity.Invitation;
import com.example.gestionprojets.entity.ProjectMember;
import com.example.gestionprojets.entity.User;
import com.example.gestionprojets.repository.InvitationRepository;
import com.example.gestionprojets.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final DTOMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<InvitationResponseDTO> getMyInvitations(String userEmail) {
        return invitationRepository.findByEmail(userEmail).stream()
                .filter(invitation -> "PENDING".equals(invitation.getStatus()))
                .map(dtoMapper::toInvitationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void acceptInvitation(Long invitationId, User user) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!invitation.getEmail().equals(user.getEmail()) || !"PENDING".equals(invitation.getStatus())) {
            throw new RuntimeException("Invalid invitation");
        }

        invitation.setStatus("ACCEPTED");
        invitationRepository.save(invitation);

        ProjectMember newMember = new ProjectMember(invitation.getProject(), user, invitation.getRole());
        projectMemberRepository.save(newMember);
    }

    @Transactional
    public void declineInvitation(Long invitationId, User user) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!invitation.getEmail().equals(user.getEmail()) || !"PENDING".equals(invitation.getStatus())) {
            throw new RuntimeException("Invalid invitation");
        }

        invitation.setStatus("DECLINED");
        invitationRepository.save(invitation);
    }
}
