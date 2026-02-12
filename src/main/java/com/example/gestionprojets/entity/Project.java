package com.example.gestionprojets.entity;

import jakarta.persistence.*;
import java.util.Set;
import java.util.HashSet; // Import pour HashSet

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProjectMember> members = new HashSet<>(); // Initialisation pour éviter les NPE

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Sprint> sprints = new HashSet<>(); // Initialisation pour éviter les NPE

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private Set<Message> messages = new HashSet<>(); // Initialisation pour éviter les NPE

    // Ajout de la relation avec Deliverable
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Deliverable> deliverables = new HashSet<>(); // Initialisation pour éviter les NPE

    // Constructeurs
    public Project() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Set<ProjectMember> getMembers() { return members; }
    public void setMembers(Set<ProjectMember> members) { this.members = members; }
    public Set<Sprint> getSprints() { return sprints; }
    public void setSprints(Set<Sprint> sprints) { this.sprints = sprints; }
    public Set<Message> getMessages() { return messages; }
    public void setMessages(Set<Message> messages) { this.messages = messages; }
    public Set<Deliverable> getDeliverables() { return deliverables; }
    public void setDeliverables(Set<Deliverable> deliverables) { this.deliverables = deliverables; }
}
