import React, { useCallback, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const acceptedTypes = 'audio/*';

const UploadPanel = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (!file) {
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const [file] = event.dataTransfer.files;
    handleFile(file);
  };

  const inputRef = useRef(null);

  return (
    <div
      className={`upload-panel ${isDragging ? 'is-dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="upload-panel__content">
        <div className="upload-panel__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3l4 4h-3v6h-2V7H8l4-4z"
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
        </div>
        <div className="upload-panel__text">
          <div className="upload-panel__title">Drop a recording</div>
          <div className="upload-panel__subtitle">WAV or M4A, or browse your files.</div>
        </div>
      </div>
      <Form.Group controlId="voice-upload">
        <Form.Control
          type="file"
          accept={acceptedTypes}
          onChange={(event) => handleFile(event.target.files[0])}
          className="upload-panel__input"
          ref={inputRef}
        />
      </Form.Group>
      <Button
        variant="outline-light"
        size="sm"
        className="upload-panel__button"
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>
    </div>
  );
};

export default UploadPanel;
