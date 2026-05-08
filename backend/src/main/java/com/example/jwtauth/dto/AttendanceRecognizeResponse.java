package com.example.jwtauth.dto;

public class AttendanceRecognizeResponse {

    private Long studentId;
    private String studentName;
    private double confidence;

    public AttendanceRecognizeResponse() {
    }

    public AttendanceRecognizeResponse(Long studentId, String studentName, double confidence) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.confidence = confidence;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
}
