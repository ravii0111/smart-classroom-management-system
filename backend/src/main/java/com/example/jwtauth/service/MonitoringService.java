package com.example.jwtauth.service;

import com.example.jwtauth.dto.AlertResponse;
import com.example.jwtauth.dto.DetectionResultResponse;
import com.example.jwtauth.dto.LiveMonitorStudentResponse;
import com.example.jwtauth.dto.MonitorFrameRequest;
import com.example.jwtauth.dto.ReportResponse;
import com.example.jwtauth.dto.TimelinePointResponse;
import com.example.jwtauth.entity.BehaviorType;
import com.example.jwtauth.entity.Exam;
import com.example.jwtauth.entity.Lecture;
import com.example.jwtauth.entity.MonitoringDetection;
import com.example.jwtauth.entity.MonitoringFrame;
import com.example.jwtauth.repository.ExamRepository;
import com.example.jwtauth.repository.LectureRepository;
import com.example.jwtauth.repository.MonitoringFrameRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.stereotype.Service;

@Service
public class MonitoringService {

    private final LectureRepository lectureRepository;
    private final ExamRepository examRepository;
    private final MonitoringFrameRepository monitoringFrameRepository;
    private final BehaviorDetectionService behaviorDetectionService;

    public MonitoringService(LectureRepository lectureRepository,
                             ExamRepository examRepository,
                             MonitoringFrameRepository monitoringFrameRepository,
                             BehaviorDetectionService behaviorDetectionService) {
        this.lectureRepository = lectureRepository;
        this.examRepository = examRepository;
        this.monitoringFrameRepository = monitoringFrameRepository;
        this.behaviorDetectionService = behaviorDetectionService;
    }

    public List<DetectionResultResponse> processFrame(MonitorFrameRequest request) {
        Lecture lecture = lectureRepository.findById(request.getLectureId())
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));

        List<DetectionResultResponse> detections = getDetectionsForRequest(request);

        MonitoringFrame frame = new MonitoringFrame();
        frame.setLectureId(lecture.getId());
        frame.setCapturedAt(LocalDateTime.now());
        frame.setSaveImage(request.isSaveImage());
        frame.setSnapshotImage(request.isSaveImage() ? request.getImage() : null);

        List<MonitoringDetection> detectionEntities = new ArrayList<>();
        for (DetectionResultResponse detection : detections) {
            MonitoringDetection entity = new MonitoringDetection();
            entity.setFrame(frame);
            entity.setX(detection.getX());
            entity.setY(detection.getY());
            entity.setWidth(detection.getWidth());
            entity.setHeight(detection.getHeight());
            entity.setBehavior(detection.getBehavior());
            detectionEntities.add(entity);
        }

        frame.setDetections(detectionEntities);
        monitoringFrameRepository.save(frame);

        return detections;
    }

    public List<DetectionResultResponse> processExamFrame(MonitorFrameRequest request) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new IllegalArgumentException("Exam not found."));

        List<DetectionResultResponse> detections = getDetectionsForRequest(request);

        MonitoringFrame frame = new MonitoringFrame();
        frame.setLectureId(null);
        frame.setExamId(exam.getId());
        frame.setCapturedAt(LocalDateTime.now());
        frame.setSaveImage(request.isSaveImage());
        frame.setSnapshotImage(request.isSaveImage() ? request.getImage() : null);

        List<MonitoringDetection> detectionEntities = new ArrayList<>();
        for (DetectionResultResponse detection : detections) {
            MonitoringDetection entity = new MonitoringDetection();
            entity.setFrame(frame);
            entity.setX(detection.getX());
            entity.setY(detection.getY());
            entity.setWidth(detection.getWidth());
            entity.setHeight(detection.getHeight());
            entity.setBehavior(detection.getBehavior());
            detectionEntities.add(entity);
        }

        frame.setDetections(detectionEntities);
        monitoringFrameRepository.save(frame);
        return detections;
    }

    public ReportResponse getReport(Long lectureId) {
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));

        List<MonitoringFrame> frames = monitoringFrameRepository.findByLectureIdOrderByCapturedAtAsc(lectureId);

        long focusedCount = 0;
        long distractedCount = 0;
        long sleepingCount = 0;

        for (MonitoringFrame frame : frames) {
            for (MonitoringDetection detection : frame.getDetections()) {
                if (detection.getBehavior() == BehaviorType.FOCUSED) {
                    focusedCount++;
                } else if (detection.getBehavior() == BehaviorType.DISTRACTED) {
                    distractedCount++;
                } else if (detection.getBehavior() == BehaviorType.SLEEPING) {
                    sleepingCount++;
                }
            }
        }

        long totalDetections = focusedCount + distractedCount + sleepingCount;
        double focusPercentage = totalDetections == 0 ? 0 : (focusedCount * 100.0) / totalDetections;

        ReportResponse response = new ReportResponse();
        response.setTotalFrames(frames.size());
        response.setTotalImages(countSavedImages(frames));
        response.setFocusedCount(focusedCount);
        response.setDistractedCount(distractedCount);
        response.setSleepingCount(sleepingCount);
        response.setCheatingCount(0);
        response.setFocusPercentage(Math.round(focusPercentage * 100.0) / 100.0);
        response.setFinalStatus(focusPercentage >= 60 ? "Focused" : "Distracted");
        response.setImages(
                frames.stream()
                        .filter(MonitoringFrame::isSaveImage)
                        .map(MonitoringFrame::getSnapshotImage)
                        .filter(image -> image != null && !image.isBlank())
                        .toList()
        );
        response.setTimeline(buildLectureTimeline(frames));
        return response;
    }

    public List<LiveMonitorStudentResponse> getLiveMonitoring(Long lectureId) {
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));

        List<MonitoringFrame> frames = monitoringFrameRepository.findByLectureIdOrderByCapturedAtAsc(lectureId);
        if (frames.isEmpty()) {
            return List.of();
        }

        MonitoringFrame latestFrame = frames.get(frames.size() - 1);
        return latestFrame.getDetections().stream()
                .map(detection -> new LiveMonitorStudentResponse(
                        detection.getId(),
                        "Student " + detection.getId(),
                        detection.getBehavior().name(),
                        latestFrame.getSnapshotImage(),
                        getStatusIcon(detection.getBehavior()),
                        getBehaviorReason(detection.getBehavior())
                ))
                .toList();
    }

    public List<AlertResponse> getLectureAlerts(Long lectureId) {
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        return monitoringFrameRepository.findByLectureIdOrderByCapturedAtAsc(lectureId).stream()
                .flatMap(frame -> frame.getDetections().stream()
                        .filter(detection -> detection.getBehavior() != BehaviorType.FOCUSED)
                        .map(detection -> new AlertResponse(
                                detection.getId(),
                                detection.getBehavior() == BehaviorType.SLEEPING
                                        ? "Student appears sleepy"
                                        : "Student looking away",
                                "Student " + detection.getId(),
                                frame.getCapturedAt().format(formatter)
                        )))
                .toList();
    }

    public List<LiveMonitorStudentResponse> getExamLive(Long examId) {
        examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found."));

        List<MonitoringFrame> frames = monitoringFrameRepository.findByExamIdOrderByCapturedAtAsc(examId);
        if (frames.isEmpty()) {
            return List.of();
        }

        MonitoringFrame latestFrame = frames.get(frames.size() - 1);
        List<MonitoringDetection> detections = latestFrame.getDetections();
        return IntStream.range(0, detections.size())
                .mapToObj(index -> {
                    MonitoringDetection detection = detections.get(index);
                    return new LiveMonitorStudentResponse(
                        detection.getId(),
                        "Candidate " + (index + 1),
                        mapExamStatus(detection.getBehavior(), latestFrame.getExamId()),
                        latestFrame.getSnapshotImage(),
                        mapExamStatusIcon(detection.getBehavior(), latestFrame.getExamId()),
                        mapExamReason(detection.getBehavior(), latestFrame.getExamId())
                    );
                })
                .toList();
    }

    public List<AlertResponse> getExamAlerts(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found."));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        return monitoringFrameRepository.findByExamIdOrderByCapturedAtAsc(examId).stream()
                .flatMap(frame -> frame.getDetections().stream()
                        .filter(detection -> !"FOCUSED".equals(mapExamStatus(detection.getBehavior(), exam.getId())))
                        .map(detection -> new AlertResponse(
                                detection.getId(),
                                mapExamAlertMessage(detection.getBehavior(), exam.getId()),
                                "Candidate " + detection.getId(),
                                frame.getCapturedAt().format(formatter)
                        )))
                .toList();
    }

    public ReportResponse getExamReport(Long examId) {
        examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found."));
        List<MonitoringFrame> frames = monitoringFrameRepository.findByExamIdOrderByCapturedAtAsc(examId);

        long focusedCount = 0;
        long distractedCount = 0;
        long sleepingCount = 0;
        long cheatingCount = 0;

        for (MonitoringFrame frame : frames) {
            for (MonitoringDetection detection : frame.getDetections()) {
                String status = mapExamStatus(detection.getBehavior(), examId);
                if ("FOCUSED".equals(status)) {
                    focusedCount++;
                } else if ("DISTRACTED".equals(status)) {
                    distractedCount++;
                } else if ("CHEATING".equals(status)) {
                    cheatingCount++;
                } else if ("SLEEPING".equals(status)) {
                    sleepingCount++;
                }
            }
        }

        long totalDetections = focusedCount + distractedCount + sleepingCount + cheatingCount;
        double focusPercentage = totalDetections == 0 ? 0 : (focusedCount * 100.0) / totalDetections;

        ReportResponse response = new ReportResponse();
        response.setTotalFrames(frames.size());
        response.setTotalImages(countSavedImages(frames));
        response.setFocusedCount(focusedCount);
        response.setDistractedCount(distractedCount);
        response.setSleepingCount(sleepingCount);
        response.setCheatingCount(cheatingCount);
        response.setFocusPercentage(Math.round(focusPercentage * 100.0) / 100.0);
        response.setFinalStatus(focusPercentage >= 60 ? "Focused" : "Needs Review");
        response.setImages(
                frames.stream()
                        .filter(MonitoringFrame::isSaveImage)
                        .map(MonitoringFrame::getSnapshotImage)
                        .filter(image -> image != null && !image.isBlank())
                        .toList()
        );
        response.setTimeline(buildExamTimeline(frames, examId));
        return response;
    }

    private String getStatusIcon(BehaviorType behavior) {
        return switch (behavior) {
            case FOCUSED -> "🟢";
            case DISTRACTED -> "🟡";
            case SLEEPING -> "🔴";
        };
    }

    private String getBehaviorReason(BehaviorType behavior) {
        return switch (behavior) {
            case FOCUSED -> "Paying attention";
            case DISTRACTED -> "Looking away";
            case SLEEPING -> "Eyes closed";
        };
    }

    private String mapExamStatus(BehaviorType behavior, Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found."));

        if (behavior == BehaviorType.SLEEPING) {
            return "SLEEPING";
        }

        if (behavior == BehaviorType.DISTRACTED) {
            return exam.getExamType().name().equals("THEORY") ? "CHEATING" : "DISTRACTED";
        }

        return "FOCUSED";
    }

    private String mapExamStatusIcon(BehaviorType behavior, Long examId) {
        return switch (mapExamStatus(behavior, examId)) {
            case "FOCUSED" -> "🟢";
            case "DISTRACTED" -> "🟡";
            case "SLEEPING" -> "🔴";
            default -> "⚠️";
        };
    }

    private String mapExamReason(BehaviorType behavior, Long examId) {
        String status = mapExamStatus(behavior, examId);
        return switch (status) {
            case "FOCUSED" -> "Looking forward";
            case "DISTRACTED" -> "Looking away";
            case "SLEEPING" -> "Eyes closed";
            default -> "Looking sideways or invalid face posture";
        };
    }

    private String mapExamAlertMessage(BehaviorType behavior, Long examId) {
        String status = mapExamStatus(behavior, examId);
        return switch (status) {
            case "SLEEPING" -> "Student appears sleepy";
            case "DISTRACTED" -> "Student looking away";
            case "CHEATING" -> "Student looking sideways";
            default -> "Attention drop detected";
        };
    }

    private List<DetectionResultResponse> getDetectionsForRequest(MonitorFrameRequest request) {
        if (request.getDetections() != null && !request.getDetections().isEmpty()) {
            return request.getDetections();
        }

        return behaviorDetectionService.detectBehaviors(request.getImage());
    }

    private long countSavedImages(List<MonitoringFrame> frames) {
        return frames.stream()
                .map(MonitoringFrame::getSnapshotImage)
                .filter(image -> image != null && !image.isBlank())
                .count();
    }

    private List<TimelinePointResponse> buildLectureTimeline(List<MonitoringFrame> frames) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
        return frames.stream()
                .filter(frame -> !frame.getDetections().isEmpty())
                .map(frame -> new TimelinePointResponse(
                        frame.getCapturedAt().format(formatter),
                        frame.getDetections().get(0).getBehavior().name()
                ))
                .toList();
    }

    private List<TimelinePointResponse> buildExamTimeline(List<MonitoringFrame> frames, Long examId) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
        return frames.stream()
                .filter(frame -> !frame.getDetections().isEmpty())
                .map(frame -> new TimelinePointResponse(
                        frame.getCapturedAt().format(formatter),
                        mapExamStatus(frame.getDetections().get(0).getBehavior(), examId)
                ))
                .toList();
    }
}
