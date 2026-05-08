package com.example.jwtauth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProfileResponse {

    private Long userId;
    private String name;
    private String email;
    private String role;

    @JsonProperty("class")
    private String studentClass;

    private String division;
    private String profileImage;

    public ProfileResponse(Long userId,
                           String name,
                           String email,
                           String role,
                           String studentClass,
                           String division,
                           String profileImage) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.studentClass = studentClass;
        this.division = division;
        this.profileImage = profileImage;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getStudentClass() {
        return studentClass;
    }

    public String getDivision() {
        return division;
    }

    public String getProfileImage() {
        return profileImage;
    }
}
