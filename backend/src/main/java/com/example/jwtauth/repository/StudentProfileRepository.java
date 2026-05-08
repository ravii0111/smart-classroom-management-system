package com.example.jwtauth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.jwtauth.entity.StudentProfile;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
}
