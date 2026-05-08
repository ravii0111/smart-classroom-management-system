package com.example.jwtauth.service;

import com.example.jwtauth.dto.LectureRequest;
import com.example.jwtauth.dto.LectureResponse;
import com.example.jwtauth.entity.Lecture;
import com.example.jwtauth.repository.LectureRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LectureService {

    private final LectureRepository lectureRepository;

    public LectureService(LectureRepository lectureRepository) {
        this.lectureRepository = lectureRepository;
    }

    public LectureResponse createLecture(LectureRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime())
                || request.getEndTime().isEqual(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time.");
        }

        Lecture lecture = new Lecture();
        lecture.setTitle(request.getTitle().trim());
        lecture.setStartTime(request.getStartTime());
        lecture.setEndTime(request.getEndTime());
        lecture.setStudentClass(request.getStudentClass());
        lecture.setDivision(request.getDivision());

        Lecture savedLecture = lectureRepository.save(lecture);
        return mapToResponse(savedLecture);
    }

    public List<LectureResponse> getAllLectures() {
        return lectureRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LectureResponse mapToResponse(Lecture lecture) {
        return new LectureResponse(
                lecture.getId(),
                lecture.getTitle(),
                lecture.getStartTime(),
                lecture.getEndTime(),
                lecture.getStudentClass(),
                lecture.getDivision()
        );
    }
}
