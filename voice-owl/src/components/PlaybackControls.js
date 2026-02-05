import React from 'react';
import { Button } from 'react-bootstrap';

const PlaybackControls = ({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onDownloadWav,
  onDownloadOriginal,
}) => {
  return (
    <div className="playback-controls">
      <div className="playback-controls__buttons">
        <Button variant="light" size="sm" onClick={onTogglePlay}>
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M7 5l11 7-11 7V5z" fill="currentColor" />
            </svg>
          )}
        </Button>
        <div className="playback-controls__time">
          {currentTime.toFixed(1)}s / {duration ? duration.toFixed(1) : '0.0'}s
        </div>
      </div>
      <div className="playback-controls__buttons">
        {onDownloadOriginal && (
          <Button variant="outline-light" size="sm" onClick={onDownloadOriginal}>
            <span className="icon-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v10m0 0l4-4m-4 4l-4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Original
            </span>
          </Button>
        )}
        {onDownloadWav && (
          <Button variant="outline-light" size="sm" onClick={onDownloadWav}>
            <span className="icon-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v10m0 0l4-4m-4 4l-4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              WAV
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlaybackControls;
