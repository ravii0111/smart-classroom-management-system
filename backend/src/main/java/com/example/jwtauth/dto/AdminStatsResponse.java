package com.example.jwtauth.dto;

public class AdminStatsResponse {

    private long totalStudents;
    private long totalTeachers;
    private long totalUsers;
    private long totalLectures;
    private long totalExams;
    private long todayAttendance;
    private long activeLectures;

    public AdminStatsResponse(long totalStudents,
                              long totalTeachers,
                              long totalUsers,
                              long totalLectures,
                              long totalExams,
                              long todayAttendance,
                              long activeLectures) {
        this.totalStudents = totalStudents;
        this.totalTeachers = totalTeachers;
        this.totalUsers = totalUsers;
        this.totalLectures = totalLectures;
        this.totalExams = totalExams;
        this.todayAttendance = todayAttendance;
        this.activeLectures = activeLectures;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public long getTotalTeachers() {
        return totalTeachers;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalLectures() {
        return totalLectures;
    }

    public long getTotalExams() {
        return totalExams;
    }

    public long getTodayAttendance() {
        return todayAttendance;
    }

    public long getActiveLectures() {
        return activeLectures;
    }
}
