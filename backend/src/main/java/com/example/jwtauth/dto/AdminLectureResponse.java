package com.example.jwtauth.dto;

import java.time.LocalDateTime;

public class AdminLectureResponse {

    private Long id;
    private String title;
    private String teacherName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public AdminLectureResponse(Long id, String title, String teacherName, LocalDateTime startTime, LocalDateTime endTime) {
        this.id = id;
        this.title = title;
        this.teacherName = teacherName;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }
}
