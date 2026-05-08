package com.example.jwtauth.controller;

import com.example.jwtauth.entity.StudentProfile;
import com.example.jwtauth.entity.User;
import com.example.jwtauth.repository.StudentProfileRepository;
import com.example.jwtauth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        return userRepository.findByEmail(currentPrincipalName).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = getCurrentUser();
        StudentProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return ResponseEntity.ok(buildProfileResponse(user, profile));
    }

    @PostMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestParam("name") String name,
                                           @RequestParam("class") String className,
                                           @RequestParam("division") String division,
                                           @RequestParam("rollNumber") String rollNumber,
                                           @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        User user = getCurrentUser();
        user.setName(name);
        userRepository.save(user);

        StudentProfile profile = profileRepository.findByUserId(user.getId()).orElse(new StudentProfile());
        profile.setUser(user);
        profile.setClassName(className);
        profile.setDivision(division);
        profile.setRollNumber(rollNumber);
        
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            try {
                String mimeType = profilePhoto.getContentType() != null ? profilePhoto.getContentType() : "image/jpeg";
                String encoded = Base64.getEncoder().encodeToString(profilePhoto.getBytes());
                profile.setProfilePhotoPath("data:" + mimeType + ";base64," + encoded);
            } catch (Exception ex) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to process profile photo."));
            }
        }

        profileRepository.save(profile);
        return ResponseEntity.ok(buildProfileResponse(user, profile));
    }

    private Map<String, Object> buildProfileResponse(User user, StudentProfile profile) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("name", user.getName() != null ? user.getName() : "");
        response.put("email", user.getEmail() != null ? user.getEmail() : "");
        response.put("class", profile != null && profile.getClassName() != null ? profile.getClassName() : "");
        response.put("division", profile != null && profile.getDivision() != null ? profile.getDivision() : "");
        response.put("rollNumber", profile != null && profile.getRollNumber() != null ? profile.getRollNumber() : "");
        response.put("profilePhotoPath", profile != null && profile.getProfilePhotoPath() != null ? profile.getProfilePhotoPath() : "");
        return response;
    }

}
