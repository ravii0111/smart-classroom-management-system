package com.example.jwtauth.controller;

import com.example.jwtauth.dto.DetectionResultResponse;
import com.example.jwtauth.dto.AlertResponse;
import com.example.jwtauth.dto.LiveMonitorStudentResponse;
import com.example.jwtauth.dto.MonitorFrameRequest;
import com.example.jwtauth.dto.ReportResponse;
import com.example.jwtauth.service.MonitoringService;
import jakarta.validation.Valid;
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
public class MonitoringController {

    private final MonitoringService monitoringService;

    public MonitoringController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @PostMapping("/monitor/frame")
    public ResponseEntity<List<DetectionResultResponse>> processFrame(
            @Valid @RequestBody MonitorFrameRequest request) {
        return ResponseEntity.ok(monitoringService.processFrame(request));
    }

    @PostMapping("/exam/frame")
    public ResponseEntity<List<DetectionResultResponse>> processExamFrame(
            @Valid @RequestBody MonitorFrameRequest request) {
        return ResponseEntity.ok(monitoringService.processExamFrame(request));
    }

    @GetMapping("/report/{lectureId}")
    public ResponseEntity<ReportResponse> getReport(@PathVariable Long lectureId) {
        return ResponseEntity.ok(monitoringService.getReport(lectureId));
    }

    @GetMapping("/monitor/live/{lectureId}")
    public ResponseEntity<List<LiveMonitorStudentResponse>> getLiveMonitoring(@PathVariable Long lectureId) {
        return ResponseEntity.ok(monitoringService.getLiveMonitoring(lectureId));
    }

    @GetMapping("/alerts/{lectureId}")
    public ResponseEntity<List<AlertResponse>> getLectureAlerts(@PathVariable Long lectureId) {
        return ResponseEntity.ok(monitoringService.getLectureAlerts(lectureId));
    }

    @GetMapping("/exam/live/{examId}")
    public ResponseEntity<List<LiveMonitorStudentResponse>> getExamLive(@PathVariable Long examId) {
        return ResponseEntity.ok(monitoringService.getExamLive(examId));
    }

    @GetMapping("/exam/alerts/{examId}")
    public ResponseEntity<List<AlertResponse>> getExamAlerts(@PathVariable Long examId) {
        return ResponseEntity.ok(monitoringService.getExamAlerts(examId));
    }

    @GetMapping("/exam/report/{examId}")
    public ResponseEntity<ReportResponse> getExamReport(@PathVariable Long examId) {
        return ResponseEntity.ok(monitoringService.getExamReport(examId));
    }
}
