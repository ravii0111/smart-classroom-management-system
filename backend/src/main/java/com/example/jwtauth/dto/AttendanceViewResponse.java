package com.example.jwtauth.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceViewResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long lectureId;
    private String lectureTitle;
    private LocalDate date;
    private String status;
    private LocalDateTime timestamp;

    public AttendanceViewResponse(Long id,
                                  Long studentId,
                                  String studentName,
                                  Long lectureId,
                                  String lectureTitle,
                                  LocalDate date,
                                  String status,
                                  LocalDateTime timestamp) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.lectureId = lectureId;
        this.lectureTitle = lectureTitle;
        this.date = date;
        this.status = status;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public Long getLectureId() {
        return lectureId;
    }

    public String getLectureTitle() {
        return lectureTitle;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
