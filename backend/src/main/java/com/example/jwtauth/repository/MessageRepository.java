package com.example.jwtauth.repository;

import com.example.jwtauth.entity.Message;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByLectureIdOrderByTimestampAsc(Long lectureId);
}
