package com.example.jwtauth.dto;

import java.time.LocalDateTime;

public class ExamResponse {

    private Long id;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String examType;
    private String status;

    public ExamResponse(Long id,
                        String title,
                        LocalDateTime startTime,
                        LocalDateTime endTime,
                        String examType,
                        String status) {
        this.id = id;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.examType = examType;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public String getExamType() {
        return examType;
    }

    public String getStatus() {
        return status;
    }
}
