package com.example.jwtauth.repository;

import com.example.jwtauth.entity.Lecture;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureRepository extends JpaRepository<Lecture, Long> {
    long countByStartTimeBeforeAndEndTimeAfter(LocalDateTime currentAfter, LocalDateTime currentBefore);
}
