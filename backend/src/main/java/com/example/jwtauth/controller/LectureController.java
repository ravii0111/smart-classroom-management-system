package com.example.jwtauth.controller;

import com.example.jwtauth.dto.LectureRequest;
import com.example.jwtauth.dto.LectureResponse;
import com.example.jwtauth.service.LectureService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lectures")
public class LectureController {

    private final LectureService lectureService;

    public LectureController(LectureService lectureService) {
        this.lectureService = lectureService;
    }

    @PostMapping
    public ResponseEntity<LectureResponse> createLecture(@Valid @RequestBody LectureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lectureService.createLecture(request));
    }

    @GetMapping
    public ResponseEntity<List<LectureResponse>> getLectures() {
        return ResponseEntity.ok(lectureService.getAllLectures());
    }
}
