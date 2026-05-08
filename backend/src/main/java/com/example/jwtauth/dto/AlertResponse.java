package com.example.jwtauth.dto;

public class AlertResponse {

    private Long id;
    private String message;
    private String studentName;
    private String time;

    public AlertResponse(Long id, String message, String studentName, String time) {
        this.id = id;
        this.message = message;
        this.studentName = studentName;
        this.time = time;
    }

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getTime() {
        return time;
    }
}
