package com.example.jwtauth.controller;

import com.example.jwtauth.entity.StudyMaterial;
import com.example.jwtauth.repository.StudyMaterialRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/material")
public class MaterialController {

    private final StudyMaterialRepository studyMaterialRepository;

    public MaterialController(StudyMaterialRepository studyMaterialRepository) {
        this.studyMaterialRepository = studyMaterialRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(@RequestParam("file") MultipartFile file, 
                                            @RequestParam("lectureId") Long lectureId) {
        try {
            Optional<StudyMaterial> existingOpt = studyMaterialRepository.findByLectureId(lectureId);
            StudyMaterial material = existingOpt.orElse(new StudyMaterial());
            
            material.setLectureId(lectureId);
            material.setFileName(file.getOriginalFilename());
            material.setContentType(file.getContentType());
            material.setData(file.getBytes());
            
            studyMaterialRepository.save(material);

            return ResponseEntity.ok(Map.of(
                    "message", "Notes uploaded successfully",
                    "fileName", material.getFileName(),
                    "lectureId", lectureId
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process file bytes"));
        }
    }

    @GetMapping("/{lectureId}")
    public ResponseEntity<?> getMaterial(@PathVariable Long lectureId) {
        return studyMaterialRepository.findByLectureId(lectureId)
                .map(material -> ResponseEntity.ok(Map.of(
                        "fileName", material.getFileName(),
                        "downloadUrl", "http://localhost:8080/api/material/download/" + lectureId,
                        "lectureId", lectureId
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No study material found")));
    }

    @GetMapping("/download/{lectureId}")
    public ResponseEntity<byte[]> downloadMaterial(@PathVariable Long lectureId) {
        return studyMaterialRepository.findByLectureId(lectureId)
                .map(material -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + material.getFileName() + "\"")
                        .contentType(MediaType.parseMediaType(material.getContentType() != null ? material.getContentType() : "application/octet-stream"))
                        .body(material.getData())
                )
                .orElse(ResponseEntity.notFound().build());
    }
}
