package com.example.gestionprojets.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tasks")
@EqualsAndHashCode(exclude = {"subtasks", "prerequisites"}) // Exclure les collections pour éviter StackOverflowError
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status; // Ex: "À faire", "En cours", "Terminé"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", nullable = false)
    @ToString.Exclude // Exclure pour éviter les boucles infinies dans toString
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user_id")
    @ToString.Exclude // Exclure pour éviter les boucles infinies dans toString
    private User assignedUser;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "task_dependencies",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "prerequisite_task_id")
    )
    @ToString.Exclude // Exclure pour éviter les boucles infinies dans toString
    private Set<Task> prerequisites = new HashSet<>();

    // Relation avec les sous-tâches
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude // Exclure pour éviter les boucles infinies dans toString
    private Set<Subtask> subtasks = new HashSet<>();
}
