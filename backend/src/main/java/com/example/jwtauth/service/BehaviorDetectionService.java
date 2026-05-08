package com.example.jwtauth.service;

import com.example.jwtauth.dto.DetectionResultResponse;
import java.util.List;

public interface BehaviorDetectionService {
    List<DetectionResultResponse> detectBehaviors(String imageBase64);
}
