import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExamAlerts from '../components/ExamAlerts';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  createFaceMeshAnalyzer,
  drawDetectionsOnCanvas,
  getFrameDataUrl,
} from '../utils/monitoringHelpers';

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/lectures', label: 'Lectures' },
  { to: '/admin/exams', label: 'Exams' },
];

function ExamMonitor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('Initializing exam camera...');
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const faceAnalyzerRef = useRef(null);
  const streamRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const gridIntervalRef = useRef(null);
  const requestInFlightRef = useRef(false);
  const lastSavedAtRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const examResponse = await api.get(`/admin/exam/${id}`);
        if (!mounted) {
          return;
        }

        setExam(examResponse.data);
        await startCamera();
        await fetchLiveGrid();

        gridIntervalRef.current = window.setInterval(() => {
          fetchLiveGrid();
        }, 2500);
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }

        setErrorMessage(error.response?.data?.error || 'Unable to load exam monitor.');
        setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
      cleanupResources();
    };
  }, [id, logout, navigate]);

  const cleanupResources = () => {
    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    if (gridIntervalRef.current) {
      window.clearInterval(gridIntervalRef.current);
      gridIntervalRef.current = null;
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = async () => {
          if (!videoRef.current || !overlayCanvasRef.current) {
            return;
          }

          overlayCanvasRef.current.width = videoRef.current.videoWidth;
          overlayCanvasRef.current.height = videoRef.current.videoHeight;
          faceAnalyzerRef.current = faceAnalyzerRef.current || await createFaceMeshAnalyzer();
          setCameraReady(true);
          setStatusMessage('Exam camera active. Frames are being analyzed.');
          setLoading(false);

          frameIntervalRef.current = window.setInterval(() => {
            captureAndSendFrame();
          }, 2000);
        };
      }
    } catch (error) {
      setErrorMessage(
        error?.name === 'NotAllowedError'
          ? 'Camera permission was denied.'
          : 'Unable to access camera. Please check browser permissions.'
      );
      setLoading(false);
    }
  };

  const fetchLiveGrid = async () => {
    try {
      const liveResponse = await api.get(`/exam/live/${id}`);
      setStudents(Array.isArray(liveResponse.data) ? liveResponse.data : []);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setErrorMessage(error.response?.data?.error || 'Unable to refresh exam grid.');
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
      const detections = faceAnalyzerRef.current
        ? await faceAnalyzerRef.current.analyze(videoRef.current)
        : [];
      const response = await api.post('/exam/frame', {
        examId: Number(id),
        image,
        saveImage,
        detections,
      });

      if (saveImage) {
        lastSavedAtRef.current = now;
      }

      drawDetectionsOnCanvas(overlayCanvasRef.current, Array.isArray(response.data) ? response.data : []);
      await fetchLiveGrid();
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setErrorMessage(error.response?.data?.error || 'Unable to process exam frame.');
    } finally {
      requestInFlightRef.current = false;
    }
  };

  const behaviorHint =
    exam?.examType === 'THEORY'
      ? 'Theory exams allow downward gaze. Sideways looks, no face, or multiple faces should be treated as cheating.'
      : 'MCQ exams expect forward attention. Looking away should be treated as distracted behavior.';

  const handleUnauthorized = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-page admin-dashboard">
      <Navbar title="AI Admin Control" eyebrow="System Control" logoText="AD" links={adminLinks} />

      <section className="dashboard-section">
        <div className="page-header-inline">
          <div>
            <p className="eyebrow">Exam Monitoring</p>
            <h2>{exam?.title || `Exam #${id}`}</h2>
            <p>{behaviorHint}</p>
          </div>
        </div>

        {loading ? <div className="loading-spinner" aria-label="Loading" /> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <div className="teacher-panel">
          <p className="dashboard-subtext">{statusMessage}</p>

          <div className="monitor-stage">
            <video ref={videoRef} className="monitor-video" autoPlay playsInline muted />
            <canvas ref={overlayCanvasRef} className="monitor-overlay" />
            <canvas ref={captureCanvasRef} className="monitor-capture-canvas" />
          </div>
        </div>

        {!loading && !errorMessage && cameraReady && students.length === 0 ? (
          <div className="empty-state">
            <h4>No candidates detected yet</h4>
            <p>The live grid will fill in as frames are analyzed.</p>
          </div>
        ) : null}

        {students.length > 0 ? (
          <div className="live-student-grid">
            {students.map((student, index) => (
              <article
                className={`live-student-card live-student-card--${String(student.behavior || '').toLowerCase()}`}
                key={student.studentId || `${student.studentName}-${index}`}
              >
                <div className="live-student-card__image-wrap">
                  {student.snapshotUrl ? (
                    <img src={student.snapshotUrl} alt={student.studentName || 'Candidate snapshot'} className="live-student-card__image" />
                  ) : (
                    <div className="live-student-card__placeholder">No Snapshot</div>
                  )}
                </div>
                <div className="live-student-card__body">
                  <h4>{student.studentName || `Candidate ${index + 1}`}</h4>
                  <p>{student.statusIcon || ''} {student.behavior || 'UNKNOWN'}</p>
                  <small>{student.behaviorReason || exam?.examType || 'Live exam status'}</small>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <ExamAlerts examId={id} onUnauthorized={handleUnauthorized} />
    </div>
  );
}

export default ExamMonitor;
