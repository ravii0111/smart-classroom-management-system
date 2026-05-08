import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  createFaceMeshAnalyzer,
  drawDetectionsOnCanvas,
  getFrameDataUrl,
} from '../utils/monitoringHelpers';

function MonitorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { logout } = useAuth();
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceAnalyzerRef = useRef(null);
  const intervalRef = useRef(null);
  const requestInFlightRef = useRef(false);
  const lastSavedAtRef = useRef(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('Initializing camera...');
  const [latestDetections, setLatestDetections] = useState([]);
  const [recognizedStudents, setRecognizedStudents] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            if (!videoRef.current || !overlayCanvasRef.current) {
              return;
            }

            overlayCanvasRef.current.width = videoRef.current.videoWidth;
            overlayCanvasRef.current.height = videoRef.current.videoHeight;
          };
        }

        faceAnalyzerRef.current = await createFaceMeshAnalyzer();
        setStatusMessage('Monitoring started with real-time face analysis.');

        intervalRef.current = window.setInterval(() => {
          captureAndSendFrame();
        }, 2000);
      } catch (error) {
        setErrorMessage(
          error?.name === 'NotAllowedError'
            ? 'Camera permission was denied.'
            : 'Unable to access camera. Please check browser permissions.'
        );
      }
    }

    startCamera();

    return () => {
      mounted = false;
      cleanupResources();
    };
  }, []);

  const cleanupResources = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (faceAnalyzerRef.current) {
      faceAnalyzerRef.current.close();
      faceAnalyzerRef.current = null;
    }
  };

  const captureAndSendFrame = async () => {
    if (requestInFlightRef.current) {
      return;
    }

    const image = getFrameDataUrl(videoRef.current, captureCanvasRef.current);

    if (!image) {
      return;
    }

    const now = Date.now();
    const saveImage = now - lastSavedAtRef.current >= 10000;

    requestInFlightRef.current = true;

    try {
      const localDetections = faceAnalyzerRef.current
        ? await faceAnalyzerRef.current.analyze(videoRef.current)
        : [];

      const response = await api.post('/monitor/frame', {
        lectureId: Number(id),
        image,
        saveImage,
        detections: localDetections,
      });

      if (saveImage) {
        lastSavedAtRef.current = now;
      }

      const detections = Array.isArray(response.data) ? response.data : [];
      const recognition = detections.length > 0
        ? await api.post('/attendance/recognize', {
            lectureId: Number(id),
            image,
          })
        : { data: null };

      const detectedName =
        recognition.data?.studentName && recognition.data?.confidence >= 0.55
          ? recognition.data.studentName
          : null;

      if (recognition.data?.studentId && recognition.data?.confidence >= 0.55) {
        await api.post('/attendance/mark', {
          studentId: recognition.data.studentId,
          lectureId: Number(id),
        });
      }

      const detectionsWithLabels = detectedName
        ? detections.map((detection) => ({
            ...detection,
            label: `${detectedName} - ${detection.behavior}`,
          }))
        : [];

      setLatestDetections(detectionsWithLabels);
      drawDetectionsOnCanvas(overlayCanvasRef.current, detectionsWithLabels);
      setRecognizedStudents(
        detectedName
          ? [{ name: detectedName, confidence: recognition.data.confidence }]
          : []
      );
      setStatusMessage(
        detectedName
          ? `Monitoring started... ${detectedName} recognized and attendance checked.`
          : detections.length > 0
          ? 'Face detected, but no student could be identified. Ask the student to update a clear profile photo and stay centered in the camera.'
          : 'Monitoring started... no faces detected in the latest frame.'
      );
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setErrorMessage(
        error.response?.data?.error || 'Unable to process monitoring frame. Please try again.'
      );
    } finally {
      requestInFlightRef.current = false;
    }
  };

  const handleStop = () => {
    cleanupResources();
    navigate('/lectures');
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Live Monitoring</p>
            <h2>Monitoring Lecture #{id}</h2>
            <p>{statusMessage}</p>
          </div>
        </div>

        <div className="teacher-panel">
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <div className="monitor-stage">
          <video ref={videoRef} className="monitor-video" autoPlay playsInline muted />
          <canvas ref={overlayCanvasRef} className="monitor-overlay" />
          <canvas ref={captureCanvasRef} className="monitor-capture-canvas" />
        </div>

        <div className="monitor-results">
          {latestDetections.length === 0 ? (
            <p>No detections yet. Frames are being analyzed every 2 seconds.</p>
          ) : (
            latestDetections.map((detection, index) => (
              <div key={`${detection.label || detection.behavior}-${index}`} className="monitor-detection-card">
                <strong>{detection.label || detection.behavior}</strong>
                <span>
                  Box: x={detection.x}, y={detection.y}, w={detection.width}, h={detection.height}
                </span>
              </div>
            ))
          )}
        </div>

        {recognizedStudents.length > 0 ? (
          <div className="monitor-results">
            {recognizedStudents.map((student) => (
              <div key={student.name} className="monitor-detection-card">
                <strong>{student.name}</strong>
                <span>Attendance recognized with {Math.round(student.confidence * 100)}% confidence</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="lecture-actions">
          <button type="button" className="primary-button" onClick={handleStop}>
            Stop
          </button>
        </div>
        </div>
      </section>
    </div>
  );
}

export default MonitorPage;
