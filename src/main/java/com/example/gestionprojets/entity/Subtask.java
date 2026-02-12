package com.example.gestionprojets.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "subtasks")
@EqualsAndHashCode(exclude = {"task"}) // Exclure la tâche parente pour éviter StackOverflowError
public class Subtask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = true) // CORRECTION: Rendre le champ nullable temporairement
    private String status = "À faire"; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @ToString.Exclude // Exclure pour éviter les boucles infinies dans toString
    private Task task;
}
