package com.example.jwtauth.dto;

public class TimelinePointResponse {

    private String time;
    private String behavior;

    public TimelinePointResponse(String time, String behavior) {
        this.time = time;
        this.behavior = behavior;
    }

    public String getTime() {
        return time;
    }

    public String getBehavior() {
        return behavior;
    }
}
