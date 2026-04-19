import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  MdPlayArrow,
  MdPause,
  MdVolumeUp,
  MdVolumeOff,
  MdVolumeMute,
  MdFullscreen,
  MdFullscreenExit,
  MdPictureInPicture,
  MdPictureInPictureAlt,
  MdSpeed,
  MdReplay10,
  MdForward10,
} from "react-icons/md";


type VideoPlayerProps = {
  src?: string;
  poster?: string;
  className?: string;
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const formatTime = (secs: number): string => {
  if (isNaN(secs)) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};


const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, className = "" }) => {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing,       setPlaying]       = useState(false);
  const [muted,         setMuted]         = useState(false);
  const [volume,        setVolume]        = useState(1);
  const [prevVolume,    setPrevVolume]    = useState(1);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [buffered,      setBuffered]      = useState(0);
  const [showControls,  setShowControls]  = useState(true);
  const [showSpeed,     setShowSpeed]     = useState(false);
  const [playbackRate,  setPlaybackRate]  = useState(1);
  const [isPiP,         setIsPiP]         = useState(false);
  const [isFullscreen,  setIsFullscreen]  = useState(false);
  const [showVolSlider, setShowVolSlider] = useState(false);


  const handleCanPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    v.play().then(() => setPlaying(true)).catch(() => {});
  };


  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.buffered.length > 0)
      setBuffered(v.buffered.end(v.buffered.length - 1));
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    setVolume(v.volume);
  };

  const handleEnded = () => setPlaying(false);


  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [playing, resetHideTimer]);

 
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);


  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnter = () => setIsPiP(true);
    const onLeave = () => setIsPiP(false);
    v.addEventListener("enterpictureinpicture", onEnter);
    v.addEventListener("leavepictureinpicture", onLeave);
    return () => {
      v.removeEventListener("enterpictureinpicture", onEnter);
      v.removeEventListener("leavepictureinpicture", onLeave);
    };
  }, []);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!wrapperRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      const v = videoRef.current;
      if (!v) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowLeft")  { v.currentTime = Math.max(0, v.currentTime - 10); }
      if (e.code === "ArrowRight") { v.currentTime = Math.min(v.duration, v.currentTime + 10); }
      if (e.code === "KeyM") toggleMute();
      if (e.code === "KeyF") toggleFullscreen();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    if (muted) {
      v.muted = false;
      v.volume = prevVolume || 0.5;
      setVolume(prevVolume || 0.5);
      setMuted(false);
    } else {
      setPrevVolume(v.volume);
      v.muted = true;
      setMuted(true);
    }
  };

  const handleVolumeChange = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted  = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  };

  const skip = (secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + secs));
  };

  const setSpeed = (rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeed(false);
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await v.requestPictureInPicture();
  };

  const toggleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  const VolumeIcon = muted || volume === 0
    ? MdVolumeOff
    : volume < 0.5
    ? MdVolumeMute
    : MdVolumeUp;

  const progressPct  = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct  = duration ? (buffered   / duration) * 100 : 0;

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      style={{
        position: "relative",
        background: "#000",
        borderRadius: "0.75rem",
        overflow: "hidden",
        outline: "none",
        cursor: showControls ? "default" : "none",
      }}
      className={className}
    >
      {/* ── Video ── */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        autoPlay
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
        style={{ width: "100%", display: "block", aspectRatio: "16/9", cursor: "pointer" }}
      />

     
      <div
        onClick={togglePlay}
        style={{ position: "absolute", inset: 0, zIndex: 0, cursor: "pointer" }}
      />


      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: showControls
            ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)"
            : "transparent",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
 
        <div style={{ padding: "0 16px", marginBottom: 8, position: "relative", height: 20, display: "flex", alignItems: "center", pointerEvents: "auto", zIndex: 2 }}>
       
          <div style={{
            position: "absolute", left: 16, right: 16, height: 4,
            background: "rgba(255,255,255,0.15)", borderRadius: 2,
          }}>
            <div style={{ width: `${bufferedPct}%`, height: "100%", background: "rgba(255,255,255,0.3)", borderRadius: 2 }} />
          </div>

   
          <input
            type="range" min={0} max={duration || 100} step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: "100%", position: "relative", zIndex: 1,
              appearance: "none", background: "transparent", cursor: "pointer",
              height: 20,
              ["--pct" as any]: `${progressPct}%`,
            }}
            className="streamify-seek"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: "0 12px 12px", gap: 4, pointerEvents: "auto", position: "relative", zIndex: 2 }}>

        
          <button onClick={togglePlay} style={btnStyle} title={playing ? "Pause (Space)" : "Play (Space)"}>
            {playing ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
          </button>


          <button onClick={() => skip(-10)} style={btnStyle} title="Rewind 10s (←)">
            <MdReplay10 size={22} />
          </button>

  
          <button onClick={() => skip(10)} style={btnStyle} title="Forward 10s (→)">
            <MdForward10 size={22} />
          </button>


          <div
            style={{ position: "relative", display: "flex", alignItems: "center" }}
            onMouseEnter={() => setShowVolSlider(true)}
            onMouseLeave={() => setShowVolSlider(false)}
          >
            <button onClick={toggleMute} style={btnStyle} title="Mute (M)">
              <VolumeIcon size={22} />
            </button>
            <div style={{
              overflow: "hidden",
              width: showVolSlider ? 80 : 0,
              transition: "width 0.2s ease",
              display: "flex", alignItems: "center",
            }}>
              <input
                type="range" min={0} max={1} step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                style={{
                  width: 72, appearance: "none", cursor: "pointer",
                  background: "transparent", height: 20,
                  ["--pct" as any]: `${(muted ? 0 : volume) * 100}%`,
                }}
                className="streamify-seek"
              />
            </div>
          </div>

     
          <span style={{ color: "#fff", fontSize: "0.8rem", fontFamily: "Inter, sans-serif", marginLeft: 4, whiteSpace: "nowrap" }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

   
          <div style={{ flex: 1 }} />

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSpeed((p) => !p)}
              style={{ ...btnStyle, fontSize: "0.78rem", fontFamily: "Inter, sans-serif", fontWeight: 600, minWidth: 42, letterSpacing: "0.01em" }}
              title="Playback speed"
            >
              <MdSpeed size={18} style={{ marginRight: 2 }} />
              {playbackRate === 1 ? "1×" : `${playbackRate}×`}
            </button>

            {showSpeed && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 8px)", right: 0,
                background: "rgba(16,20,24,0.95)",
                border: "1px solid rgba(171,199,255,0.12)",
                borderRadius: "0.75rem",
                overflow: "hidden", minWidth: 90,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}>
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    style={{
                      display: "block", width: "100%", textAlign: "center",
                      padding: "8px 16px",
                      background: playbackRate === s ? "rgba(68,143,255,0.2)" : "transparent",
                      color: playbackRate === s ? "#abc7ff" : "#e2e8f0",
                      fontFamily: "Inter, sans-serif", fontSize: "0.82rem",
                      fontWeight: playbackRate === s ? 600 : 400,
                      border: "none", cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (playbackRate !== s) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { if (playbackRate !== s) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {s === 1 ? "Normal" : `${s}×`}
                  </button>
                ))}
              </div>
            )}
          </div>

   
          {"pictureInPictureEnabled" in document && (
            <button onClick={togglePiP} style={btnStyle} title="Picture in Picture">
              {isPiP ? <MdPictureInPicture size={20} /> : <MdPictureInPictureAlt size={20} />}
            </button>
          )}

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} style={btnStyle} title="Fullscreen (F)">
            {isFullscreen ? <MdFullscreenExit size={22} /> : <MdFullscreen size={22} />}
          </button>
        </div>
      </div>

   
      <style>{`
        .streamify-seek::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(
            to right,
            #448fff 0%,
            #448fff var(--pct),
            rgba(255,255,255,0.2) var(--pct),
            rgba(255,255,255,0.2) 100%
          );
        }
        .streamify-seek::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #abc7ff;
          margin-top: -5px;
          box-shadow: 0 0 6px rgba(68,143,255,0.6);
          transition: transform 0.15s;
        }
        .streamify-seek:hover::-webkit-slider-thumb { transform: scale(1.3); }
        .streamify-seek::-moz-range-track {
          height: 4px; border-radius: 2px;
          background: rgba(255,255,255,0.2);
        }
        .streamify-seek::-moz-range-progress {
          height: 4px; border-radius: 2px;
          background: #448fff;
        }
        .streamify-seek::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #abc7ff; border: none;
          box-shadow: 0 0 6px rgba(68,143,255,0.6);
        }
      `}</style>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
  flexShrink: 0,
};

export default VideoPlayer;