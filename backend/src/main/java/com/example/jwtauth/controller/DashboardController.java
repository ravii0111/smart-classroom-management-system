package com.example.jwtauth.controller;

import com.example.jwtauth.dto.ReportResponse;
import com.example.jwtauth.entity.Attendance;
import com.example.jwtauth.entity.Lecture;
import com.example.jwtauth.entity.StudentProfile;
import com.example.jwtauth.entity.User;
import com.example.jwtauth.repository.AttendanceRepository;
import com.example.jwtauth.repository.LectureRepository;
import com.example.jwtauth.repository.StudentProfileRepository;
import com.example.jwtauth.repository.UserRepository;
import com.example.jwtauth.service.MonitoringService;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final LectureRepository lectureRepository;
    private final AttendanceRepository attendanceRepository;
    private final MonitoringService monitoringService;

    public DashboardController(UserRepository userRepository,
                               StudentProfileRepository profileRepository,
                               LectureRepository lectureRepository,
                               AttendanceRepository attendanceRepository,
                               MonitoringService monitoringService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.lectureRepository = lectureRepository;
        this.attendanceRepository = attendanceRepository;
        this.monitoringService = monitoringService;
    }

    @GetMapping("/student/dashboard")
    public Map<String, Object> studentDashboard(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            return Map.of("error", "User not found");
        }

        StudentProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null || profile.getClassName() == null || profile.getDivision() == null) {
            return Map.of(
                    "title", "Student Dashboard",
                    "message", "Welcome, please complete your profile to see correct metrics.",
                    "totalLectures", 0,
                    "attendedLectures", 0,
                    "attendancePercentage", 0.0,
                    "focusPercentage", 0.0
            );
        }

        List<Lecture> allLectures = lectureRepository.findAll();
        List<Lecture> studentLectures = allLectures.stream()
                .filter(l -> profile.getClassName().equals(l.getStudentClass()) &&
                             profile.getDivision().equals(l.getDivision()))
                .toList();

        int totalLectures = studentLectures.size();
        List<Attendance> attendanceRecords = attendanceRepository.findByStudentIdOrderByTimestampDesc(user.getId());
        int attendedLectures = attendanceRecords.size();
        double totalFocus = 0.0;

        for (Lecture l : studentLectures) {
            try {
                ReportResponse r = monitoringService.getReport(l.getId());
                if (r != null && r.getTotalFrames() > 0) {
                    totalFocus += r.getFocusPercentage();
                }
            } catch (Exception e) {
                // Skip if no report natively found
            }
        }

        double attendancePercentage = totalLectures == 0 ? 0 : (attendedLectures * 100.0) / totalLectures;
        double focusPercentage = attendedLectures == 0 ? 0 : totalFocus / attendedLectures;

        return Map.of(
                "title", "Student Dashboard",
                "message", "Welcome " + user.getName() + "!",
                "totalLectures", totalLectures,
                "attendedLectures", attendedLectures,
                "attendancePercentage", Math.round(attendancePercentage * 100.0) / 100.0,
                "focusPercentage", Math.round(focusPercentage * 100.0) / 100.0,
                "attendanceHistory", attendanceRecords.stream()
                        .map(record -> Map.of(
                                "lectureId", record.getLectureId(),
                                "title", studentLectures.stream()
                                        .filter(lecture -> lecture.getId().equals(record.getLectureId()))
                                        .map(Lecture::getTitle)
                                        .findFirst()
                                        .orElse("Lecture " + record.getLectureId()),
                                "status", record.getStatus().name()
                        ))
                        .toList()
        );
    }

    @GetMapping("/teacher/dashboard")
    public Map<String, String> teacherDashboard(Principal principal) {
        return Map.of(
                "title", "Teacher Dashboard",
                "message", "Welcome " + principal.getName() + ", you are logged in as TEACHER."
        );
    }

    @GetMapping("/admin/dashboard")
    public Map<String, String> adminDashboard(Principal principal) {
        return Map.of(
                "title", "Admin Dashboard",
                "message", "Welcome " + principal.getName() + ", you are logged in as ADMIN."
        );
    }

    @GetMapping("/user/me")
    public Map<String, String> currentUser(Principal principal) {
        return Map.of("email", principal.getName());
    }
}
