package com.example.jwtauth.dto;

import java.util.List;

public class ReportResponse {

    private long totalFrames;
    private long totalImages;
    private long focusedCount;
    private long distractedCount;
    private long sleepingCount;
    private long cheatingCount;
    private double focusPercentage;
    private String finalStatus;
    private List<String> images;
    private List<TimelinePointResponse> timeline;

    public long getTotalFrames() {
        return totalFrames;
    }

    public void setTotalFrames(long totalFrames) {
        this.totalFrames = totalFrames;
    }

    public long getTotalImages() {
        return totalImages;
    }

    public void setTotalImages(long totalImages) {
        this.totalImages = totalImages;
    }

    public long getFocusedCount() {
        return focusedCount;
    }

    public void setFocusedCount(long focusedCount) {
        this.focusedCount = focusedCount;
    }

    public long getDistractedCount() {
        return distractedCount;
    }

    public void setDistractedCount(long distractedCount) {
        this.distractedCount = distractedCount;
    }

    public long getSleepingCount() {
        return sleepingCount;
    }

    public void setSleepingCount(long sleepingCount) {
        this.sleepingCount = sleepingCount;
    }

    public long getCheatingCount() {
        return cheatingCount;
    }

    public void setCheatingCount(long cheatingCount) {
        this.cheatingCount = cheatingCount;
    }

    public double getFocusPercentage() {
        return focusPercentage;
    }

    public void setFocusPercentage(double focusPercentage) {
        this.focusPercentage = focusPercentage;
    }

    public String getFinalStatus() {
        return finalStatus;
    }

    public void setFinalStatus(String finalStatus) {
        this.finalStatus = finalStatus;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public List<TimelinePointResponse> getTimeline() {
        return timeline;
    }

    public void setTimeline(List<TimelinePointResponse> timeline) {
        this.timeline = timeline;
    }
}
