import './App.css';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import UploadPanel from './components/UploadPanel';
import RecorderPanel from './components/RecorderPanel';
import PitchGraph from './components/PitchGraph';
import PlaybackControls from './components/PlaybackControls';
import PitchStats from './components/PitchStats';
import SideMenu from './components/SideMenu';
import { analyzePitchSeries, encodeWav } from './utils/audio';
import { computePitchStats } from './utils/stats';

function App() {
  const [settings, setSettings] = useState({
    precisionMs: 100,
    graphLineWidth: 30,
    graphMarkers: false,
    graphTickGap: 50,
    graphLineHeight: 200,
    graphLower: 100,
    graphUpper: 300,
    showAvg1: false,
    showAvg3: false,
    showAvg10: false,
    pitchLowerBound: null,
    pitchUpperBound: null,
  });
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioName, setAudioName] = useState('');
  const [audioMime, setAudioMime] = useState('');
  const [pitchSeries, setPitchSeries] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cursorTime, setCursorTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const rafRef = useRef(null);

  const duration = audioBuffer?.duration || 0;

  const resetPlayback = () => {
    setCursorTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const loadAudioFromBlob = async (blob, name = 'recording') => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = getAudioContext();
    const decoded = await audioContext.decodeAudioData(arrayBuffer);
    setAudioBuffer(decoded);
    setAudioBlob(blob);
    setAudioName(name);
    setAudioMime(blob.type || '');
    const url = URL.createObjectURL(blob);
    setAudioUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return url;
    });
    resetPlayback();
  };

  useEffect(() => () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    if (!audioBuffer) {
      setPitchSeries([]);
      return;
    }
    setIsAnalyzing(true);
    const result = analyzePitchSeries(audioBuffer, settings.precisionMs);
    setPitchSeries(result);
    setIsAnalyzing(false);
  }, [audioBuffer, settings.precisionMs]);

  useEffect(() => {
    if (!audioRef.current) {
      return undefined;
    }
    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const audioEl = audioRef.current;
    audioEl.addEventListener('ended', handleEnded);
    audioEl.addEventListener('pause', handlePause);
    return () => {
      audioEl.removeEventListener('ended', handleEnded);
      audioEl.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      return undefined;
    }
    const tick = () => {
      if (audioRef.current) {
        setCursorTime(audioRef.current.currentTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  const handleFileSelected = async (file) => {
    if (!file) {
      return;
    }
    await loadAudioFromBlob(file, file.name);
  };

  const handleRecordingComplete = async (blob) => {
    await loadAudioFromBlob(blob, 'live-recording');
  };

  const handleTogglePlay = async () => {
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (time) => {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.currentTime = time;
    setCursorTime(time);
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadOriginal = () => {
    if (!audioBlob) {
      return;
    }
    downloadBlob(audioBlob, audioName || 'recording');
  };

  const handleDownloadWav = () => {
    if (!audioBuffer) {
      return;
    }
    const wavBlob = encodeWav(audioBuffer);
    downloadBlob(wavBlob, `${audioName || 'recording'}.wav`);
  };

  const stats = useMemo(() => computePitchStats(pitchSeries), [pitchSeries]);

  const adjustedSettings = useMemo(() => {
    const next = { ...settings };
    if (next.graphUpper < next.graphLower) {
      next.graphUpper = next.graphLower;
    }
    if (next.pitchLowerBound != null && next.pitchUpperBound != null && next.pitchUpperBound < next.pitchLowerBound) {
      next.pitchUpperBound = next.pitchLowerBound;
    }
    return next;
  }, [settings]);

  return (
    <div className="App">
      <Container fluid className="app-shell">
        <header className="app-header">
          <div className="app-title">Voice Owl</div>
          <div className="app-subtitle">Pitch-focused voice analysis in your browser.</div>
        </header>

        <Row className="app-row">
          <Col xs={12} lg={7} className="app-column">
            <div className="app-card">
              <div className="app-card__title">Pitch Graph</div>
              {isAnalyzing && (
                <div className="app-card__status">
                  <Spinner animation="border" size="sm" /> Analyzing pitch...
                </div>
              )}
              <PitchGraph
                series={pitchSeries}
                duration={duration}
                lineWidth={adjustedSettings.graphLineWidth}
                lineHeight={adjustedSettings.graphLineHeight}
                tickGap={adjustedSettings.graphTickGap}
                graphLower={adjustedSettings.graphLower}
                graphUpper={adjustedSettings.graphUpper}
                showMarkers={adjustedSettings.graphMarkers}
                showAvg1={adjustedSettings.showAvg1}
                showAvg3={adjustedSettings.showAvg3}
                showAvg10={adjustedSettings.showAvg10}
                pitchLowerBound={adjustedSettings.pitchLowerBound}
                pitchUpperBound={adjustedSettings.pitchUpperBound}
                cursorTime={cursorTime}
                onSeek={handleSeek}
                precisionMs={adjustedSettings.precisionMs}
              />
            </div>
          </Col>
          <Col xs={12} lg={5} className="app-column">
            <div className="app-card">
              <div className="app-card__title">Load Audio</div>
              <UploadPanel onFileSelected={handleFileSelected} />
              <RecorderPanel onRecordingComplete={handleRecordingComplete} />
              <div className="app-card__meta">
                <div>Format: {audioMime || '--'}</div>
                <div>Length: {duration ? `${duration.toFixed(1)}s` : '--'}</div>
              </div>
            </div>
          </Col>
        </Row>

        <div className="app-card app-card--wide">
          <div className="app-card__title">Playback</div>
          <PlaybackControls
            isPlaying={isPlaying}
            currentTime={cursorTime}
            duration={duration}
            onTogglePlay={handleTogglePlay}
            onDownloadOriginal={audioBlob ? handleDownloadOriginal : null}
            onDownloadWav={audioBuffer ? handleDownloadWav : null}
          />
          <audio ref={audioRef} src={audioUrl} />
        </div>

        <div className="app-card app-card--wide">
          <div className="app-card__title">Recording Statistics</div>
          <PitchStats
            stats={stats}
            duration={duration}
            pitchLowerBound={adjustedSettings.pitchLowerBound}
            pitchUpperBound={adjustedSettings.pitchUpperBound}
          />
        </div>
      </Container>

      <button className="tool-button" type="button" onClick={() => setShowMenu(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M10 4h4l.7 2.1 2.2.9 2.1-1.1 2 2-1.1 2.1.9 2.2L22 14v4l-2.1.7-.9 2.2 1.1 2.1-2 2-2.1-1.1-2.2.9L14 22h-4l-.7-2.1-2.2-.9-2.1 1.1-2-2 1.1-2.1-.9-2.2L2 18v-4l2.1-.7.9-2.2L3.9 9l2-2 2.1 1.1 2.2-.9L10 4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <SideMenu
        show={showMenu}
        onClose={() => setShowMenu(false)}
        settings={adjustedSettings}
        onChange={setSettings}
      />
    </div>
  );
}

export default App;
