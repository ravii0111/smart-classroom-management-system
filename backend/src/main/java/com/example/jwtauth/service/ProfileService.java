package com.example.jwtauth.service;

import com.example.jwtauth.dto.ProfileResponse;
import com.example.jwtauth.entity.Role;
import com.example.jwtauth.entity.StudentProfile;
import com.example.jwtauth.entity.User;
import com.example.jwtauth.entity.UserProfile;
import com.example.jwtauth.repository.StudentProfileRepository;
import com.example.jwtauth.repository.UserProfileRepository;
import com.example.jwtauth.repository.UserRepository;
import java.util.Base64;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final StudentProfileRepository studentProfileRepository;

    public ProfileService(UserRepository userRepository,
                          UserProfileRepository userProfileRepository,
                          StudentProfileRepository studentProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    public ProfileResponse getMyProfile() {
        User user = getCurrentUser();
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        return mapResponse(user, profile);
    }

    public ProfileResponse updateProfile(String name,
                                         String email,
                                         String studentClass,
                                         String division,
                                         MultipartFile profileImage) {
        User user = getCurrentUser();
        String normalizedEmail = email.trim().toLowerCase();

        userRepository.findByEmail(normalizedEmail)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email is already registered.");
                });

        user.setName(name.trim());
        user.setEmail(normalizedEmail);
        userRepository.save(user);

        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseGet(UserProfile::new);
        profile.setUser(user);

        if (user.getRole() == Role.STUDENT) {
            profile.setStudentClass(studentClass != null ? studentClass.trim() : "");
            profile.setDivision(division != null ? division.trim() : "");
        } else {
            profile.setStudentClass(null);
            profile.setDivision(null);
        }

        if (profileImage != null && !profileImage.isEmpty()) {
            profile.setProfileImage(toDataUrl(profileImage));
        }

        UserProfile savedProfile = userProfileRepository.save(profile);
        syncStudentProfile(user, savedProfile);
        return mapResponse(user, savedProfile);
    }

    private void syncStudentProfile(User user, UserProfile profile) {
        if (user.getRole() != Role.STUDENT) {
            return;
        }

        StudentProfile studentProfile = studentProfileRepository.findByUserId(user.getId())
                .orElseGet(StudentProfile::new);
        studentProfile.setUser(user);
        studentProfile.setClassName(profile.getStudentClass());
        studentProfile.setDivision(profile.getDivision());
        if (profile.getProfileImage() != null && !profile.getProfileImage().isBlank()) {
            studentProfile.setProfilePhotoPath(profile.getProfileImage());
        }
        studentProfileRepository.save(studentProfile);
    }

    private ProfileResponse mapResponse(User user, UserProfile profile) {
        return new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                profile != null ? profile.getStudentClass() : "",
                profile != null ? profile.getDivision() : "",
                profile != null ? profile.getProfileImage() : ""
        );
    }

    private String toDataUrl(MultipartFile image) {
        try {
            String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
            return "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(image.getBytes());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Failed to process profile image.");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Current user not found."));
    }
}
