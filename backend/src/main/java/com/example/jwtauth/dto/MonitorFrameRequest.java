package com.example.jwtauth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class MonitorFrameRequest {

    private Long lectureId;

    private Long examId;

    @NotBlank(message = "Image is required.")
    private String image;

    private boolean saveImage;

    private List<DetectionResultResponse> detections;

    public Long getLectureId() {
        return lectureId;
    }

    public void setLectureId(Long lectureId) {
        this.lectureId = lectureId;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public boolean isSaveImage() {
        return saveImage;
    }

    public void setSaveImage(boolean saveImage) {
        this.saveImage = saveImage;
    }

    public List<DetectionResultResponse> getDetections() {
        return detections;
    }

    public void setDetections(List<DetectionResultResponse> detections) {
        this.detections = detections;
    }

    @AssertTrue(message = "Lecture id or exam id is required.")
    public boolean isTargetPresent() {
        return lectureId != null || examId != null;
    }
}
