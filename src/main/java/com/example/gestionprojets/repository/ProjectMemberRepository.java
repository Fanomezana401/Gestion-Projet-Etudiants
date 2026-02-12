package com.example.gestionprojets.repository;

import com.example.gestionprojets.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    @Query("SELECT COUNT(DISTINCT pm.user.id) FROM ProjectMember pm WHERE pm.project.id IN (SELECT p.id FROM Project p JOIN p.members m WHERE m.user.id = :teacherId AND m.role = 'TEACHER') AND pm.role = 'MEMBER'")
    long countDistinctStudentsByTeacherId(Long teacherId);
}
