CREATE TABLE task_dependencies (
    task_id BIGINT NOT NULL,
    prerequisite_task_id BIGINT NOT NULL,
    PRIMARY KEY (task_id, prerequisite_task_id),
    CONSTRAINT fk_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT fk_prerequisite_task FOREIGN KEY (prerequisite_task_id) REFERENCES tasks (id) ON DELETE CASCADE
);
