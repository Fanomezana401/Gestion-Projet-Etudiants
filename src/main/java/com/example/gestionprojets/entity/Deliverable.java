package com.example.gestionprojets.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "deliverables")
public class Deliverable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String fileUrl; // URL ou chemin d'accès au fichier

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @ToString.Exclude
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_user_id", nullable = false)
    @ToString.Exclude
    private User submittedBy;

    // CORRECTION: Ajout de l'annotation @Column
    @Column(name = "grade")
    private Integer grade; // Note attribuée par le professeur

    // CORRECTION: Ajout de l'annotation @Column
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks; // Remarques du professeur
}
