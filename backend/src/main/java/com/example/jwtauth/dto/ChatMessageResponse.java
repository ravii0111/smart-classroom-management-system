package com.example.jwtauth.dto;

import java.time.LocalDateTime;

public class ChatMessageResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private Long lectureId;
    private String message;
    private LocalDateTime timestamp;

    public ChatMessageResponse(Long id,
                               Long senderId,
                               String senderName,
                               Long receiverId,
                               String receiverName,
                               Long lectureId,
                               String message,
                               LocalDateTime timestamp) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.receiverName = receiverName;
        this.lectureId = lectureId;
        this.message = message;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public Long getLectureId() {
        return lectureId;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
