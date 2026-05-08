package com.example.jwtauth.controller;

import com.example.jwtauth.dto.ProfileResponse;
import com.example.jwtauth.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping("/update")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestParam("name") String name,
                                                         @RequestParam("email") String email,
                                                         @RequestParam(value = "class", required = false) String studentClass,
                                                         @RequestParam(value = "division", required = false) String division,
                                                         @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        return ResponseEntity.ok(profileService.updateProfile(name, email, studentClass, division, profileImage));
    }
}
