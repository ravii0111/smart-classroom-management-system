package com.example.jwtauth.repository;

import com.example.jwtauth.entity.Attendance;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudentIdAndLectureIdAndDate(Long studentId, Long lectureId, LocalDate date);

    List<Attendance> findByStudentIdOrderByTimestampDesc(Long studentId);

    List<Attendance> findByLectureIdOrderByTimestampDesc(Long lectureId);

    long countByDate(LocalDate date);
}
