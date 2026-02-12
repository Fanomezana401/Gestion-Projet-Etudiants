package com.example.gestionprojets.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserActivityService {

    // Map<UserId, ProjectId>
    private final Map<Long, Long> activeProjectConversations = new ConcurrentHashMap<>();

    public void setActiveConversation(Long userId, Long projectId) {
        activeProjectConversations.put(userId, projectId);
    }

    public void clearActiveConversation(Long userId) {
        activeProjectConversations.remove(userId);
    }

    public boolean isUserInConversation(Long userId, Long projectId) {
        return projectId.equals(activeProjectConversations.get(userId));
    }
}
