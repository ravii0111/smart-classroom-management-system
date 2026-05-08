package com.example.jwtauth.service;

import com.example.jwtauth.dto.AttendanceMarkRequest;
import com.example.jwtauth.dto.AttendanceRecognizeRequest;
import com.example.jwtauth.dto.AttendanceRecognizeResponse;
import com.example.jwtauth.dto.AttendanceViewResponse;
import com.example.jwtauth.dto.MessageResponse;
import com.example.jwtauth.entity.Attendance;
import com.example.jwtauth.entity.AttendanceStatus;
import com.example.jwtauth.entity.Lecture;
import com.example.jwtauth.entity.Role;
import com.example.jwtauth.entity.StudentProfile;
import com.example.jwtauth.entity.User;
import com.example.jwtauth.repository.AttendanceRepository;
import com.example.jwtauth.repository.LectureRepository;
import com.example.jwtauth.repository.StudentProfileRepository;
import com.example.jwtauth.repository.UserRepository;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import javax.imageio.ImageIO;
import org.springframework.stereotype.Service;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final LectureRepository lectureRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentProfileRepository studentProfileRepository,
                             UserRepository userRepository,
                             LectureRepository lectureRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.lectureRepository = lectureRepository;
    }

    public AttendanceRecognizeResponse recognizeStudent(AttendanceRecognizeRequest request) {
        Lecture lecture = lectureRepository.findById(request.getLectureId())
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));

        List<StudentProfile> profiles = studentProfileRepository.findAll().stream()
                .filter(profile -> profile.getUser() != null)
                .filter(profile -> profile.getUser().getRole() == Role.STUDENT)
                .filter(profile -> isStudentEligibleForLecture(profile, lecture))
                .filter(profile -> profile.getProfilePhotoPath() != null && !profile.getProfilePhotoPath().isBlank())
                .toList();

        if (profiles.isEmpty()) {
            return new AttendanceRecognizeResponse(null, null, 0);
        }

        return profiles.stream()
                .map(profile -> {
                    double confidence = compareBase64Images(request.getImage(), profile.getProfilePhotoPath());
                    return new AttendanceRecognizeResponse(
                            profile.getUser().getId(),
                            profile.getUser().getName(),
                            confidence
                    );
                })
                .max(Comparator.comparingDouble(AttendanceRecognizeResponse::getConfidence))
                .filter(match -> match.getConfidence() >= getRecognitionThreshold(profiles.size()))
                .orElse(new AttendanceRecognizeResponse(null, null, 0));
    }

    public MessageResponse markAttendance(AttendanceMarkRequest request) {
        User user = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        if (user.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Attendance can only be marked for students.");
        }

        Lecture lecture = lectureRepository.findById(request.getLectureId())
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));

        LocalDate today = LocalDate.now();
        boolean exists = attendanceRepository.findByStudentIdAndLectureIdAndDate(
                request.getStudentId(),
                request.getLectureId(),
                today
        ).isPresent();

        if (exists) {
            return new MessageResponse("Attendance already marked today.");
        }

        Attendance attendance = new Attendance();
        attendance.setStudentId(user.getId());
        attendance.setLectureId(lecture.getId());
        attendance.setDate(today);
        attendance.setStatus(AttendanceStatus.PRESENT);
        attendance.setTimestamp(LocalDateTime.now());
        attendanceRepository.save(attendance);
        return new MessageResponse("Attendance marked successfully.");
    }

    public List<AttendanceViewResponse> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentIdOrderByTimestampDesc(studentId).stream()
                .map(this::mapAttendance)
                .toList();
    }

    public List<AttendanceViewResponse> getLectureAttendance(Long lectureId) {
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));
        return attendanceRepository.findByLectureIdOrderByTimestampDesc(lectureId).stream()
                .map(this::mapAttendance)
                .toList();
    }

    private AttendanceViewResponse mapAttendance(Attendance attendance) {
        User user = userRepository.findById(attendance.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));
        Lecture lecture = lectureRepository.findById(attendance.getLectureId())
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));

        return new AttendanceViewResponse(
                attendance.getId(),
                user.getId(),
                user.getName(),
                lecture.getId(),
                lecture.getTitle(),
                attendance.getDate(),
                attendance.getStatus().name(),
                attendance.getTimestamp()
        );
    }

    private double compareBase64Images(String firstImage, String secondImage) {
        try {
            BufferedImage frameImage = decodeBase64ToImage(firstImage);
            BufferedImage profileImage = decodeBase64ToImage(secondImage);

            if (frameImage == null || profileImage == null) {
                return 0;
            }

            BufferedImage croppedFrame = cropCenterRegion(frameImage);
            long firstHash = averageHash(croppedFrame);
            long secondHash = averageHash(profileImage);
            int distance = Long.bitCount(firstHash ^ secondHash);
            double hashScore = Math.max(0, 1 - (distance / 64.0));
            double histogramScore = histogramSimilarity(croppedFrame, profileImage);

            return Math.max(0, Math.min(1, (hashScore * 0.65) + (histogramScore * 0.35)));
        } catch (Exception ex) {
            return 0;
        }
    }

    private boolean isStudentEligibleForLecture(StudentProfile profile, Lecture lecture) {
        if (lecture.getStudentClass() == null || lecture.getStudentClass().isBlank()) {
            return true;
        }

        boolean classMatches = lecture.getStudentClass().equalsIgnoreCase(
                profile.getClassName() != null ? profile.getClassName().trim() : ""
        );
        boolean divisionMatches = lecture.getDivision() == null
                || lecture.getDivision().isBlank()
                || lecture.getDivision().equalsIgnoreCase(
                        profile.getDivision() != null ? profile.getDivision().trim() : ""
                );

        return classMatches && divisionMatches;
    }

    private double getRecognitionThreshold(int candidateCount) {
        if (candidateCount <= 1) {
            return 0.35;
        }

        if (candidateCount <= 3) {
            return 0.42;
        }

        return 0.5;
    }

    private BufferedImage decodeBase64ToImage(String imageData) throws Exception {
        String normalized = imageData.contains(",") ? imageData.substring(imageData.indexOf(',') + 1) : imageData;
        byte[] bytes = Base64.getDecoder().decode(normalized);
        return ImageIO.read(new ByteArrayInputStream(bytes));
    }

    private BufferedImage cropCenterRegion(BufferedImage source) {
        int cropWidth = Math.max(1, Math.min(source.getWidth(), source.getWidth() / 2));
        int cropHeight = Math.max(1, Math.min(source.getHeight(), source.getHeight() / 2));
        int x = Math.max(0, (source.getWidth() - cropWidth) / 2);
        int y = Math.max(0, (source.getHeight() - cropHeight) / 3);
        int safeHeight = Math.min(cropHeight, source.getHeight() - y);
        return source.getSubimage(x, y, cropWidth, safeHeight);
    }

    private long averageHash(BufferedImage source) {
        BufferedImage resized = new BufferedImage(8, 8, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D graphics = resized.createGraphics();
        Image scaledImage = source.getScaledInstance(8, 8, Image.SCALE_SMOOTH);
        graphics.drawImage(scaledImage, 0, 0, null);
        graphics.dispose();

        int[] pixels = new int[64];
        int total = 0;

        for (int y = 0; y < 8; y++) {
          for (int x = 0; x < 8; x++) {
                int value = resized.getRGB(x, y) & 0xff;
                pixels[(y * 8) + x] = value;
                total += value;
            }
        }

        int average = total / 64;
        long hash = 0L;
        for (int index = 0; index < pixels.length; index++) {
            if (pixels[index] >= average) {
                hash |= (1L << index);
            }
        }
        return hash;
    }

    private double histogramSimilarity(BufferedImage firstImage, BufferedImage secondImage) {
        double[] firstHistogram = grayscaleHistogram(firstImage);
        double[] secondHistogram = grayscaleHistogram(secondImage);
        double difference = 0;

        for (int index = 0; index < firstHistogram.length; index++) {
            difference += Math.abs(firstHistogram[index] - secondHistogram[index]);
        }

        return Math.max(0, 1 - (difference / 2.0));
    }

    private double[] grayscaleHistogram(BufferedImage source) {
        BufferedImage resized = new BufferedImage(32, 32, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D graphics = resized.createGraphics();
        Image scaledImage = source.getScaledInstance(32, 32, Image.SCALE_SMOOTH);
        graphics.drawImage(scaledImage, 0, 0, null);
        graphics.dispose();

        double[] histogram = new double[16];
        List<Integer> samples = new ArrayList<>();

        for (int y = 0; y < 32; y++) {
            for (int x = 0; x < 32; x++) {
                int value = resized.getRGB(x, y) & 0xff;
                samples.add(value);
            }
        }

        for (Integer sample : samples) {
            histogram[Math.min(15, sample / 16)]++;
        }

        double total = samples.size();
        for (int index = 0; index < histogram.length; index++) {
            histogram[index] = histogram[index] / total;
        }

        return histogram;
    }
}
