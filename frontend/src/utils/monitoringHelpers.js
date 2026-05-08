export function getBehaviorColor(behavior) {
  switch (behavior) {
    case 'FOCUSED':
      return '#15a34a';
    case 'DISTRACTED':
      return '#f59e0b';
    case 'SLEEPING':
      return '#dc2626';
    default:
      return '#2563eb';
  }
}

export function drawDetectionsOnCanvas(canvas, detections) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 3;
  context.font = '16px sans-serif';

  detections.forEach((detection) => {
    const color = getBehaviorColor(detection.behavior);

    context.strokeStyle = color;
    context.fillStyle = color;
    context.strokeRect(detection.x, detection.y, detection.width, detection.height);

    const label = detection.label || detection.behavior;
    const labelWidth = context.measureText(label).width + 14;
    const labelY = Math.max(24, detection.y - 12);

    context.fillRect(detection.x, labelY - 18, labelWidth, 24);
    context.fillStyle = '#ffffff';
    context.fillText(label, detection.x + 7, labelY);
  });
}

export function getFrameDataUrl(video, canvas) {
  if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
    return null;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}

let faceMeshLoaderPromise;

export function loadFaceMesh() {
  if (window.FaceMesh) {
    return Promise.resolve(window.FaceMesh);
  }

  if (faceMeshLoaderPromise) {
    return faceMeshLoaderPromise;
  }

  faceMeshLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    script.async = true;
    script.onload = () => {
      if (window.FaceMesh) {
        resolve(window.FaceMesh);
        return;
      }

      reject(new Error('FaceMesh script loaded but the global API is unavailable.'));
    };
    script.onerror = () => reject(new Error('Unable to load MediaPipe Face Mesh.'));
    document.body.appendChild(script);
  });

  return faceMeshLoaderPromise;
}

export async function createFaceMeshAnalyzer() {
  const FaceMesh = await loadFaceMesh();
  const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 4,
    refineLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });

  let pendingResolve = null;
  let pendingReject = null;

  faceMesh.onResults((results) => {
    if (!pendingResolve) {
      return;
    }

    const detections = mapResultsToDetections(results);
    pendingResolve(detections);
    pendingResolve = null;
    pendingReject = null;
  });

  return {
    async analyze(videoElement) {
      if (!videoElement) {
        return [];
      }

      return new Promise(async (resolve, reject) => {
        pendingResolve = resolve;
        pendingReject = reject;

        try {
          await faceMesh.send({ image: videoElement });
        } catch (error) {
          pendingResolve = null;
          pendingReject = null;
          reject(error);
        }
      });
    },
    close() {
      if (pendingReject) {
        pendingReject(new Error('Face mesh analyzer was closed.'));
      }
      pendingResolve = null;
      pendingReject = null;
      if (typeof faceMesh.close === 'function') {
        faceMesh.close();
      }
    },
  };
}

function mapResultsToDetections(results) {
  if (!results?.multiFaceLandmarks?.length || !results.image) {
    return [];
  }

  const width = results.image.videoWidth || results.image.width || 0;
  const height = results.image.videoHeight || results.image.height || 0;

  if (!width || !height) {
    return [];
  }

  return results.multiFaceLandmarks.map((landmarks) => {
    const box = getBoundingBox(landmarks, width, height);
    const eyeAspectRatio = getAverageEyeAspectRatio(landmarks);
    const headTurnRatio = getHeadTurnRatio(landmarks);

    let behavior = 'FOCUSED';
    if (eyeAspectRatio < 0.19) {
      behavior = 'SLEEPING';
    } else if (headTurnRatio > 0.17) {
      behavior = 'DISTRACTED';
    }

    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      behavior,
    };
  });
}

function getBoundingBox(landmarks, width, height) {
  const xs = landmarks.map((point) => point.x * width);
  const ys = landmarks.map((point) => point.y * height);

  const minX = Math.max(0, Math.min(...xs));
  const maxX = Math.min(width, Math.max(...xs));
  const minY = Math.max(0, Math.min(...ys));
  const maxY = Math.min(height, Math.max(...ys));

  return {
    x: Math.round(minX),
    y: Math.round(minY),
    width: Math.round(maxX - minX),
    height: Math.round(maxY - minY),
  };
}

function getAverageEyeAspectRatio(landmarks) {
  const leftEye = calculateEyeAspectRatio(landmarks, [33, 160, 158, 133, 153, 144]);
  const rightEye = calculateEyeAspectRatio(landmarks, [362, 385, 387, 263, 373, 380]);
  return (leftEye + rightEye) / 2;
}

function calculateEyeAspectRatio(landmarks, indexes) {
  const [p1, p2, p3, p4, p5, p6] = indexes.map((index) => landmarks[index]);
  const vertical = distance(p2, p6) + distance(p3, p5);
  const horizontal = 2 * distance(p1, p4);

  if (!horizontal) {
    return 0;
  }

  return vertical / horizontal;
}

function getHeadTurnRatio(landmarks) {
  const leftEyeOuter = landmarks[33];
  const rightEyeOuter = landmarks[263];
  const noseTip = landmarks[1];
  const eyeMidpointX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const halfFaceWidth = Math.abs(rightEyeOuter.x - leftEyeOuter.x) / 2;

  if (!halfFaceWidth) {
    return 0;
  }

  return Math.abs(noseTip.x - eyeMidpointX) / halfFaceWidth;
}

function distance(pointA, pointB) {
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}
