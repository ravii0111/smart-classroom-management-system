package com.example.jwtauth.controller;

import com.example.jwtauth.dto.AttendanceMarkRequest;
import com.example.jwtauth.dto.AttendanceRecognizeRequest;
import com.example.jwtauth.dto.AttendanceRecognizeResponse;
import com.example.jwtauth.dto.AttendanceViewResponse;
import com.example.jwtauth.dto.MessageResponse;
import com.example.jwtauth.entity.User;
import com.example.jwtauth.repository.UserRepository;
import com.example.jwtauth.service.AttendanceService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    public AttendanceController(AttendanceService attendanceService, UserRepository userRepository) {
        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
    }

    @PostMapping("/attendance/recognize")
    public ResponseEntity<AttendanceRecognizeResponse> recognize(@Valid @RequestBody AttendanceRecognizeRequest request) {
        return ResponseEntity.ok(attendanceService.recognizeStudent(request));
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<MessageResponse> markAttendance(@Valid @RequestBody AttendanceMarkRequest request) {
        return ResponseEntity.ok(attendanceService.markAttendance(request));
    }

    @GetMapping("/student/attendance")
    public ResponseEntity<List<AttendanceViewResponse>> getStudentAttendance(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return ResponseEntity.ok(attendanceService.getStudentAttendance(user.getId()));
    }

    @GetMapping("/teacher/attendance/{lectureId}")
    public ResponseEntity<List<AttendanceViewResponse>> getTeacherAttendance(@PathVariable Long lectureId) {
        return ResponseEntity.ok(attendanceService.getLectureAttendance(lectureId));
    }

    @GetMapping("/admin/attendance/{lectureId}")
    public ResponseEntity<List<AttendanceViewResponse>> getAdminAttendance(@PathVariable Long lectureId) {
        return ResponseEntity.ok(attendanceService.getLectureAttendance(lectureId));
    }
}
