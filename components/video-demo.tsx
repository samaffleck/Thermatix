"use client";

import { Play, Pause, Maximize } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function VideoDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && videoRef.current && !isPlaying) {
          videoRef.current.play();
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observerRef.current.observe(videoRef.current);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    if (isPlaying && !isDragging) {
      controlsTimeout.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullScreen = async () => {
    if (containerRef.current) {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await containerRef.current.requestFullscreen();
        }
      } catch (err) {
        console.error("Error attempting to toggle full-screen:", err);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const updateVideoProgress = (clientX: number) => {
    if (videoRef.current && progressBarRef.current) {
      const bounds = progressBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - bounds.left, bounds.width));
      const percentage = x / bounds.width;
      setProgress(percentage * 100);
      if (!isDragging) {
        videoRef.current.currentTime = percentage * videoRef.current.duration;
      }
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateVideoProgress(e.clientX);
    document.addEventListener('mousemove', handleProgressDrag);
    document.addEventListener('mouseup', handleProgressMouseUp);
  };

  const handleProgressDrag = (e: MouseEvent) => {
    if (isDragging) {
      updateVideoProgress(e.clientX);
    }
  };

  const handleProgressMouseUp = () => {
    if (isDragging && videoRef.current) {
      setIsDragging(false);
      const percentage = progress / 100;
      videoRef.current.currentTime = percentage * videoRef.current.duration;
      document.removeEventListener('mousemove', handleProgressDrag);
      document.removeEventListener('mouseup', handleProgressMouseUp);
    }
  };

  return (
    <section className="relative py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-[1920px] mx-auto">
        <div 
          ref={containerRef}
          className="relative aspect-video w-full max-w-[70%] mx-auto overflow-hidden group"
          onMouseEnter={() => setIsControlsVisible(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            if (isPlaying && !isDragging && !isFullscreen) setIsControlsVisible(false);
          }}
        >
          <div onClick={togglePlay} className="absolute inset-0 cursor-pointer" />
          
          {isControlsVisible && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 z-20 transition-opacity duration-300">
              <div 
                ref={progressBarRef}
                className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer"
                onMouseDown={handleProgressMouseDown}
              >
                <div 
                  className="h-full bg-white rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button 
                  onClick={togglePlay}
                  className="text-white hover:text-white/80 transition-opacity"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button 
                  onClick={toggleFullScreen}
                  className="text-white hover:text-white/80 transition-opacity"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            src="/demo_video.mp4"
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      </div>
    </section>
  );
} 