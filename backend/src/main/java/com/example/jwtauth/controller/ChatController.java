package com.example.jwtauth.controller;

import com.example.jwtauth.dto.ChatMessageResponse;
import com.example.jwtauth.dto.ChatParticipantResponse;
import com.example.jwtauth.dto.ChatRequest;
import com.example.jwtauth.dto.MessageResponse;
import com.example.jwtauth.service.ChatService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/send")
    public ResponseEntity<MessageResponse> send(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.send(request));
    }

    @GetMapping("/{lectureId}")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable Long lectureId) {
        return ResponseEntity.ok(chatService.getLectureMessages(lectureId));
    }

    @GetMapping("/participants/{lectureId}")
    public ResponseEntity<List<ChatParticipantResponse>> getParticipants(@PathVariable Long lectureId) {
        return ResponseEntity.ok(chatService.getParticipants(lectureId));
    }
}
