package com.example.jwtauth.dto;

import jakarta.validation.constraints.NotNull;

public class AttendanceMarkRequest {

    @NotNull
    private Long studentId;

    @NotNull
    private Long lectureId;

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getLectureId() {
        return lectureId;
    }

    public void setLectureId(Long lectureId) {
        this.lectureId = lectureId;
    }
}
