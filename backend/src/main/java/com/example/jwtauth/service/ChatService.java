package com.example.jwtauth.service;

import com.example.jwtauth.dto.ChatMessageResponse;
import com.example.jwtauth.dto.ChatParticipantResponse;
import com.example.jwtauth.dto.ChatRequest;
import com.example.jwtauth.dto.MessageResponse;
import com.example.jwtauth.entity.Lecture;
import com.example.jwtauth.entity.Role;
import com.example.jwtauth.entity.Message;
import com.example.jwtauth.entity.User;
import com.example.jwtauth.entity.UserProfile;
import com.example.jwtauth.repository.LectureRepository;
import com.example.jwtauth.repository.MessageRepository;
import com.example.jwtauth.repository.UserProfileRepository;
import com.example.jwtauth.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final LectureRepository lectureRepository;
    private final UserProfileRepository userProfileRepository;

    public ChatService(MessageRepository messageRepository,
                       UserRepository userRepository,
                       LectureRepository lectureRepository,
                       UserProfileRepository userProfileRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.lectureRepository = lectureRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public MessageResponse send(ChatRequest request) {
        User sender = getCurrentUser();
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found."));
        Lecture lecture = lectureRepository.findById(request.getLectureId())
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));

        Message message = new Message();
        message.setSenderId(sender.getId());
        message.setReceiverId(receiver.getId());
        message.setLectureId(lecture.getId());
        message.setMessage(request.getMessage().trim());
        message.setTimestamp(LocalDateTime.now());
        messageRepository.save(message);

        return new MessageResponse("Message sent successfully.");
    }

    public List<ChatMessageResponse> getLectureMessages(Long lectureId) {
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));

        return messageRepository.findByLectureIdOrderByTimestampAsc(lectureId).stream()
                .map(this::mapResponse)
                .toList();
    }

    public List<ChatParticipantResponse> getParticipants(Long lectureId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture not found."));
        User currentUser = getCurrentUser();

        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> user.getRole() == Role.TEACHER
                        || (user.getRole() == Role.STUDENT && isStudentEligible(user, lecture)))
                .map(user -> new ChatParticipantResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name()
                ))
                .toList();
    }

    private ChatMessageResponse mapResponse(Message message) {
        User sender = userRepository.findById(message.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("Sender not found."));
        User receiver = userRepository.findById(message.getReceiverId())
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found."));

        return new ChatMessageResponse(
                message.getId(),
                sender.getId(),
                sender.getName(),
                receiver.getId(),
                receiver.getName(),
                message.getLectureId(),
                message.getMessage(),
                message.getTimestamp()
        );
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Current user not found."));
    }

    private boolean isStudentEligible(User user, Lecture lecture) {
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null) {
            return false;
        }

        String lectureClass = lecture.getStudentClass() != null ? lecture.getStudentClass().trim() : "";
        String lectureDivision = lecture.getDivision() != null ? lecture.getDivision().trim() : "";
        String profileClass = profile.getStudentClass() != null ? profile.getStudentClass().trim() : "";
        String profileDivision = profile.getDivision() != null ? profile.getDivision().trim() : "";

        boolean classMatches = lectureClass.isBlank() || lectureClass.equalsIgnoreCase(profileClass);
        boolean divisionMatches = lectureDivision.isBlank() || lectureDivision.equalsIgnoreCase(profileDivision);
        return classMatches && divisionMatches;
    }
}
