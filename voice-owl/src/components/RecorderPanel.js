import React, { useEffect, useRef, useState } from 'react';
import { Button, Badge } from 'react-bootstrap';

const getSupportedMimeType = () => {
  const preferred = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
  return preferred.find((type) => MediaRecorder.isTypeSupported(type)) || '';
};

const RecorderPanel = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        onRecordingComplete(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access was blocked.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="recorder-panel">
      <div className="recorder-panel__header">
        <div className="recorder-panel__title">Record live</div>
        {isRecording && (
          <Badge bg="danger" className="recorder-panel__badge">
            Live
          </Badge>
        )}
      </div>
      <div className="recorder-panel__actions">
        <Button
          variant={isRecording ? 'outline-danger' : 'outline-light'}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
        >
          <span className="icon-label">
            {isRecording ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="4" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M6 11v1a6 6 0 0012 0v-1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            {isRecording ? 'Stop' : 'Record'}
          </span>
        </Button>
      </div>
      {error && <div className="recorder-panel__error">{error}</div>}
    </div>
  );
};

export default RecorderPanel;
