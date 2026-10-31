/* ==========================================================================
   AudioRecorder Component
   Interactive voice prayer recorder:
   - Requests microphone access via getUserMedia
   - Handles permission denial gracefully with error feedback
   - Live timer (MM:SS) and pulsating audio waveform bars
   - Pause / Resume / Stop / Playback preview / Attach to request
   ========================================================================== */

function AudioRecorder({ isOpen, onClose, onAttachAudio }) {
  const [recordState, setRecordState] = React.useState("idle"); // "idle" | "recording" | "paused" | "stopped"
  const [duration, setDuration] = React.useState(0);
  const [audioUrl, setAudioUrl] = React.useState(null);
  const [audioBlob, setAudioBlob] = React.useState(null);
  const [audioFile, setAudioFile] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isPlayingPreview, setIsPlayingPreview] = React.useState(false);

  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const timerIntervalRef = React.useRef(null);
  const audioPlayerRef = React.useRef(null);
  const streamRef = React.useRef(null);

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Format file size
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Start recording
  const startRecording = async () => {
    setErrorMessage("");
    audioChunksRef.current = [];
    setDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio recording is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        const ext = mime.includes("mp4") ? "m4a" : "webm";
        const filename = `prayer_voice_${Date.now()}.${ext}`;
        const file = new File([blob], filename, { type: mime, lastModified: Date.now() });

        setAudioBlob(blob);
        setAudioUrl(url);
        setAudioFile(file);
        setRecordState("stopped");

        // Stop all stream tracks to turn off mic indicator
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(250);
      setRecordState("recording");

      // Start duration counter
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      let msg = "Microphone access was denied or unavailable. Please check your browser settings or use 'Upload Audio' instead.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Microphone permission was denied. Please allow microphone access in your browser address bar to record prayer audio.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No microphone hardware found on your device. You can still upload a recorded audio file.";
      }
      setErrorMessage(msg);
      setRecordState("idle");
    }
  };

  // Pause or Resume
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (recordState === "recording") {
      mediaRecorderRef.current.pause();
      clearInterval(timerIntervalRef.current);
      setRecordState("paused");
    } else if (recordState === "paused") {
      mediaRecorderRef.current.resume();
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      setRecordState("recording");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordState !== "idle" && recordState !== "stopped") {
      mediaRecorderRef.current.stop();
      clearInterval(timerIntervalRef.current);
    }
  };

  // Attach recorded audio to prayer form
  const handleAttach = () => {
    if (audioFile && onAttachAudio) {
      onAttachAudio({
        id: `rec-${Date.now()}`,
        file: audioFile,
        name: audioFile.name,
        size: audioFile.size,
        formattedSize: formatBytes(audioFile.size),
        duration: formatTime(duration),
        durationSeconds: duration,
        type: "audio",
        url: audioUrl,
        isRecorded: true
      });
      handleClose();
    }
  };

  // Preview Playback Toggle
  const togglePreviewPlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  // Cleanup on close
  const handleClose = () => {
    if (mediaRecorderRef.current && recordState === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setRecordState("idle");
    setDuration(0);
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioFile(null);
    setErrorMessage("");
    setIsPlayingPreview(false);
    if (onClose) onClose();
  };

  React.useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="audio-recorder-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="recorder-title">
      <div className="audio-recorder-modal-card">
        {/* Modal Header */}
        <div className="recorder-modal-header">
          <div className="recorder-header-left">
            <span className="recorder-mic-badge">🎙️</span>
            <div>
              <h3 id="recorder-title" className="recorder-title">Record Voice Prayer</h3>
              <p className="recorder-subtitle">Speak your prayer request directly from your heart</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={handleClose} aria-label="Close recorder">
            ✕
          </button>
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <div className="recorder-error-alert" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Recording Visual Area */}
        <div className="recorder-visual-stage">
          {/* Animated Waveform Bars */}
          <div className={`audio-waveform-container ${recordState === "recording" ? "is-live" : ""}`}>
            {[40, 65, 85, 45, 95, 60, 75, 100, 70, 50, 85, 40, 60, 90, 55].map((h, i) => (
              <span
                key={i}
                className="waveform-bar"
                style={{
                  "--bar-height": `${recordState === "recording" ? h : 20}%`,
                  "--bar-delay": `${(i * 0.08).toFixed(2)}s`
                }}
              />
            ))}
          </div>

          {/* Time Counter */}
          <div className="recorder-time-display">
            {recordState === "recording" && <span className="recording-live-dot" />}
            <span className="recorder-time-digits">{formatTime(duration)}</span>
            <span className="recorder-state-label">
              {recordState === "idle" && "Ready to record"}
              {recordState === "recording" && "Recording..."}
              {recordState === "paused" && "Paused"}
              {recordState === "stopped" && "Recording finished"}
            </span>
          </div>

          {/* Hidden HTML5 Audio Element for preview */}
          {audioUrl && (
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlayingPreview(false)}
              style={{ display: "none" }}
            />
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="recorder-controls-footer">
          {recordState === "idle" && (
            <button
              type="button"
              className="btn-recorder-action btn-start-record"
              onClick={startRecording}
            >
              <span className="btn-record-circle" />
              <span>Start Recording</span>
            </button>
          )}

          {(recordState === "recording" || recordState === "paused") && (
            <div className="recorder-active-actions">
              <button
                type="button"
                className="btn-recorder-action btn-pause-record"
                onClick={togglePause}
              >
                {recordState === "recording" ? "⏸ Pause" : "▶ Resume"}
              </button>

              <button
                type="button"
                className="btn-recorder-action btn-stop-record"
                onClick={stopRecording}
              >
                ⏹ Stop Recording
              </button>
            </div>
          )}

          {recordState === "stopped" && (
            <div className="recorder-finished-actions">
              <button
                type="button"
                className="btn-recorder-action btn-preview-playback"
                onClick={togglePreviewPlayback}
              >
                {isPlayingPreview ? "⏸ Pause Preview" : "▶ Play Preview"}
              </button>

              <button
                type="button"
                className="btn-recorder-action btn-rerecord"
                onClick={startRecording}
              >
                🔄 Re-record
              </button>

              <button
                type="button"
                className="btn-recorder-action btn-attach-audio"
                onClick={handleAttach}
              >
                ✓ Attach Audio ({formatBytes(audioBlob?.size || 0)})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.AudioRecorder = AudioRecorder;
