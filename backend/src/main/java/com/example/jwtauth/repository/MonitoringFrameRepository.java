package com.example.jwtauth.repository;

import com.example.jwtauth.entity.MonitoringFrame;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitoringFrameRepository extends JpaRepository<MonitoringFrame, Long> {
    List<MonitoringFrame> findByLectureIdOrderByCapturedAtAsc(Long lectureId);

    List<MonitoringFrame> findByExamIdOrderByCapturedAtAsc(Long examId);
}
