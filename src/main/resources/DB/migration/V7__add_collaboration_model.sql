-- Création de la table des membres du projet
CREATE TABLE project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(255) NOT NULL,
    
    CONSTRAINT fk_member_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (project_id, user_id) -- Un utilisateur ne peut avoir qu'un seul rôle par projet
);

-- Création de la table des invitations
CREATE TABLE invitations (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    project_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    role VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    
    CONSTRAINT fk_invitation_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_invitation_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Modification de la table des projets
-- 1. Supprimer l'ancienne contrainte de clé étrangère
ALTER TABLE projects DROP CONSTRAINT fk_owner;

-- 2. Supprimer l'ancienne colonne
ALTER TABLE projects DROP COLUMN user_id;
