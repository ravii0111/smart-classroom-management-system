package com.example.jwtauth.dto;

import com.example.jwtauth.entity.BehaviorType;

public class DetectionResultResponse {

    private int x;
    private int y;
    private int width;
    private int height;
    private BehaviorType behavior;

    public DetectionResultResponse() {
    }

    public DetectionResultResponse(int x, int y, int width, int height, BehaviorType behavior) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.behavior = behavior;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public BehaviorType getBehavior() {
        return behavior;
    }

    public void setBehavior(BehaviorType behavior) {
        this.behavior = behavior;
    }
}
