package com.example.jwtauth.controller;

import com.example.jwtauth.dto.AdminCreateUserRequest;
import com.example.jwtauth.dto.AdminLectureResponse;
import com.example.jwtauth.dto.AdminStatsResponse;
import com.example.jwtauth.dto.AdminUserResponse;
import com.example.jwtauth.dto.ExamRequest;
import com.example.jwtauth.dto.ExamResponse;
import com.example.jwtauth.dto.MessageResponse;
import com.example.jwtauth.entity.UserStatus;
import com.example.jwtauth.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    @PostMapping("/user")
    public ResponseEntity<MessageResponse> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    @PostMapping("/admin-user")
    public ResponseEntity<MessageResponse> createAdmin(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.ok(adminService.createAdmin(request));
    }

    @PutMapping("/block/{userId}")
    public ResponseEntity<MessageResponse> blockUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, UserStatus.BLOCKED));
    }

    @PutMapping("/unblock/{userId}")
    public ResponseEntity<MessageResponse> unblockUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, UserStatus.ACTIVE));
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.deleteUser(userId));
    }

    @GetMapping("/lectures")
    public ResponseEntity<List<AdminLectureResponse>> getLectures() {
        return ResponseEntity.ok(adminService.getLectures());
    }

    @DeleteMapping("/lecture/{lectureId}")
    public ResponseEntity<MessageResponse> deleteLecture(@PathVariable Long lectureId) {
        return ResponseEntity.ok(adminService.deleteLecture(lectureId));
    }

    @PostMapping("/exam")
    public ResponseEntity<ExamResponse> createExam(@Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(adminService.createExam(request));
    }

    @GetMapping("/exams")
    public ResponseEntity<List<ExamResponse>> getExams() {
        return ResponseEntity.ok(adminService.getExams());
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<ExamResponse> getExam(@PathVariable Long examId) {
        return ResponseEntity.ok(adminService.getExam(examId));
    }
}
