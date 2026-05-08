package com.example.jwtauth.service;

import com.example.jwtauth.dto.DetectionResultResponse;
import com.example.jwtauth.entity.BehaviorType;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.List;
import javax.imageio.ImageIO;
import org.springframework.stereotype.Service;

@Service
public class MockBehaviorDetectionService implements BehaviorDetectionService {

    @Override
    public List<DetectionResultResponse> detectBehaviors(String imageBase64) {
        try {
            BufferedImage image = decodeBase64ToImage(imageBase64);
            if (image == null || image.getWidth() < 40 || image.getHeight() < 40) {
                return List.of();
            }

            int width = Math.max(120, image.getWidth() / 3);
            int height = Math.max(140, image.getHeight() / 2);
            int x = Math.max(0, (image.getWidth() - width) / 2);
            int y = Math.max(0, (image.getHeight() - height) / 4);

            return List.of(new DetectionResultResponse(x, y, width, height, BehaviorType.FOCUSED));
        } catch (Exception ex) {
            return List.of();
        }
    }

    private BufferedImage decodeBase64ToImage(String imageData) throws Exception {
        String normalized = imageData.contains(",") ? imageData.substring(imageData.indexOf(',') + 1) : imageData;
        byte[] bytes = Base64.getDecoder().decode(normalized);
        return ImageIO.read(new ByteArrayInputStream(bytes));
    }
}
