package com.example.jwtauth.service;

import com.example.jwtauth.dto.AdminCreateUserRequest;
import com.example.jwtauth.dto.AdminLectureResponse;
import com.example.jwtauth.dto.AdminStatsResponse;
import com.example.jwtauth.dto.AdminUserResponse;
import com.example.jwtauth.dto.ExamRequest;
import com.example.jwtauth.dto.ExamResponse;
import com.example.jwtauth.dto.MessageResponse;
import com.example.jwtauth.entity.Exam;
import com.example.jwtauth.entity.Lecture;
import com.example.jwtauth.entity.Role;
import com.example.jwtauth.entity.User;
import com.example.jwtauth.entity.UserStatus;
import com.example.jwtauth.repository.ExamRepository;
import com.example.jwtauth.repository.AttendanceRepository;
import com.example.jwtauth.repository.LectureRepository;
import com.example.jwtauth.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final LectureRepository lectureRepository;
    private final ExamRepository examRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final String superAdminEmail;

    public AdminService(UserRepository userRepository,
                        LectureRepository lectureRepository,
                        ExamRepository examRepository,
                        AttendanceRepository attendanceRepository,
                        PasswordEncoder passwordEncoder,
                        @Value("${app.super-admin.email:superadmin@example.com}") String superAdminEmail) {
        this.userRepository = userRepository;
        this.lectureRepository = lectureRepository;
        this.examRepository = examRepository;
        this.attendanceRepository = attendanceRepository;
        this.passwordEncoder = passwordEncoder;
        this.superAdminEmail = superAdminEmail.toLowerCase();
    }

    public AdminStatsResponse getStats() {
        long totalStudents = userRepository.findAll().stream().filter(user -> user.getRole() == Role.STUDENT).count();
        long totalTeachers = userRepository.findAll().stream().filter(user -> user.getRole() == Role.TEACHER).count();
        long todayAttendance = attendanceRepository.countByDate(LocalDate.now());
        long activeLectures = lectureRepository.countByStartTimeBeforeAndEndTimeAfter(LocalDateTime.now(), LocalDateTime.now());
        return new AdminStatsResponse(
                totalStudents,
                totalTeachers,
                userRepository.count(),
                lectureRepository.count(),
                examRepository.count(),
                todayAttendance,
                activeLectures
        );
    }

    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getStatus().name()
                ))
                .toList();
    }

    public MessageResponse createUser(AdminCreateUserRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Use the Add Admin section. Regular user creation does not allow admin accounts.");
        }
        return createAccount(request, false);
    }

    public MessageResponse createAdmin(AdminCreateUserRequest request) {
        if (request.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Add Admin can only create admin accounts.");
        }

        User currentUser = getCurrentUser();
        if (!currentUser.getEmail().equalsIgnoreCase(superAdminEmail)) {
            throw new IllegalArgumentException("Only the superadmin can create new admin accounts.");
        }

        return createAccount(request, true);
    }

    private MessageResponse createAccount(AdminCreateUserRequest request, boolean allowAdmin) {
        String normalizedEmail = request.getEmail().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        if (!allowAdmin && request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin accounts cannot be created from this section.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        return new MessageResponse("User created successfully.");
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found."));
    }

    public MessageResponse updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setStatus(status);
        userRepository.save(user);
        return new MessageResponse("User status updated successfully.");
    }

    public MessageResponse deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found.");
        }
        userRepository.deleteById(userId);
        return new MessageResponse("User deleted successfully.");
    }

    public List<AdminLectureResponse> getLectures() {
        return lectureRepository.findAll().stream()
                .map(lecture -> new AdminLectureResponse(
                        lecture.getId(),
                        lecture.getTitle(),
                        "Teacher",
                        lecture.getStartTime(),
                        lecture.getEndTime()
                ))
                .toList();
    }

    public MessageResponse deleteLecture(Long lectureId) {
        if (!lectureRepository.existsById(lectureId)) {
            throw new IllegalArgumentException("Lecture not found.");
        }
        lectureRepository.deleteById(lectureId);
        return new MessageResponse("Lecture deleted successfully.");
    }

    public ExamResponse createExam(ExamRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time.");
        }

        Exam exam = new Exam();
        exam.setTitle(request.getTitle().trim());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setExamType(request.getExamType());
        Exam savedExam = examRepository.save(exam);
        return mapExam(savedExam);
    }

    public List<ExamResponse> getExams() {
        return examRepository.findAll().stream().map(this::mapExam).toList();
    }

    public ExamResponse getExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found."));
        return mapExam(exam);
    }

    private ExamResponse mapExam(Exam exam) {
        return new ExamResponse(
                exam.getId(),
                exam.getTitle(),
                exam.getStartTime(),
                exam.getEndTime(),
                exam.getExamType().name(),
                getExamStatus(exam)
        );
    }

    private String getExamStatus(Exam exam) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime())) {
            return "UPCOMING";
        }
        if (now.isAfter(exam.getEndTime())) {
            return "COMPLETED";
        }
        return "ONGOING";
    }
}
