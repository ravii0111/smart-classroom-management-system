package com.example.jwtauth.dto;

public class LiveMonitorStudentResponse {

    private Long studentId;
    private String studentName;
    private String behavior;
    private String snapshotUrl;
    private String statusIcon;
    private String behaviorReason;

    public LiveMonitorStudentResponse(Long studentId,
                                      String studentName,
                                      String behavior,
                                      String snapshotUrl,
                                      String statusIcon,
                                      String behaviorReason) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.behavior = behavior;
        this.snapshotUrl = snapshotUrl;
        this.statusIcon = statusIcon;
        this.behaviorReason = behaviorReason;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getBehavior() {
        return behavior;
    }

    public String getSnapshotUrl() {
        return snapshotUrl;
    }

    public String getStatusIcon() {
        return statusIcon;
    }

    public String getBehaviorReason() {
        return behaviorReason;
    }
}
