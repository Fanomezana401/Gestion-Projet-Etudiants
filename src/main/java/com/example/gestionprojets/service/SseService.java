package com.example.gestionprojets.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SseService {

    private static final Logger logger = LoggerFactory.getLogger(SseService.class);
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<Long, Long> userLastSeen = new ConcurrentHashMap<>();

    // CORRECTION: Planificateur pour le heartbeat
    private ScheduledExecutorService scheduler;

    @PostConstruct
    public void init() {
        scheduler = Executors.newSingleThreadScheduledExecutor();
        // Envoyer un heartbeat toutes les 10 secondes
        scheduler.scheduleAtFixedRate(this::sendHeartbeatToAll, 10, 10, TimeUnit.SECONDS);
    }

    @PreDestroy
    public void destroy() {
        if (scheduler != null) {
            scheduler.shutdown();
        }
    }

    public SseEmitter createEmitter(Long userId) {
        // CORRECTION: Timeout très long (ou infini) pour l'émetteur
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); 
        
        this.emitters.put(userId, emitter);
        userLastSeen.put(userId, System.currentTimeMillis());

        emitter.onCompletion(() -> {
            logger.info("Emitter completed for user {}", userId);
            this.emitters.remove(userId, emitter);
            userLastSeen.remove(userId);
        });
        emitter.onTimeout(() -> {
            logger.info("Emitter timed out for user {}", userId);
            this.emitters.remove(userId, emitter);
            userLastSeen.remove(userId);
        });
        emitter.onError(e -> {
            logger.error("Emitter error for user {}: {}", userId, e.getMessage());
            this.emitters.remove(userId, emitter);
            userLastSeen.remove(userId);
        });

        try {
            emitter.send(SseEmitter.event().name("connection-established").data("Connection successful"));
            logger.info("Initial connection event sent to user {}", userId);
        } catch (IOException e) {
            logger.error("Failed to send initial event to user {}, removing emitter.", userId, e);
            this.emitters.remove(userId, emitter);
            userLastSeen.remove(userId);
        }

        logger.info("New emitter created for user {}. Total emitters: {}", userId, this.emitters.size());
        return emitter;
    }

    public void sendEventToUser(Long userId, String eventName, Object data) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                logger.warn("Failed to send event to user {}, removing emitter. Error: {}", userId, e.getMessage());
                emitters.remove(userId);
                userLastSeen.remove(userId);
            }
        }
    }

    public void sendHeartbeatToAll() {
        emitters.forEach((userId, emitter) -> {
            try {
                // Envoyer un commentaire pour le heartbeat, qui ne sera pas traité comme un événement
                emitter.send(SseEmitter.event().comment("heartbeat"));
                userLastSeen.put(userId, System.currentTimeMillis()); // Mettre à jour le temps de dernière activité
            } catch (IOException e) {
                logger.warn("Heartbeat failed for user {}, removing emitter. Error: {}", userId, e.getMessage());
                emitters.remove(userId);
                userLastSeen.remove(userId);
            }
        });
    }

    public boolean isUserOnline(Long userId) {
        return emitters.containsKey(userId);
    }

    public Long getUserLastSeen(Long userId) {
        return userLastSeen.get(userId);
    }
}
