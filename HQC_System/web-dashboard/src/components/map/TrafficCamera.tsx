// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Video } from 'lucide-react';

// Traffic camera locations in Hanoi with video files
export interface TrafficCamera {
  id: string;
  name: string;
  location: [number, number]; // [lat, lng]
  videoUrl: string;
  description?: string;
  status: 'online' | 'offline' | 'demo';
}

// Demo traffic cameras with video files
export const TRAFFIC_CAMERAS: TrafficCamera[] = [
  {
    id: 'cam-1',
    name: 'Pháº¡m VÄƒn Báº¡ch - Viá»‡n Huyáº¿t Há»c',
    location: [21.024933, 105.789105], // NgÃ£ tÆ° Pháº¡m VÄƒn Báº¡ch - ÄÆ°á»ng LÃ¡ng
    videoUrl: '/video_traffic/HNI_LLGT_Pháº¡m VÄƒn Báº¡ch- Viá»‡n Huyáº¿t Há»c.mp4',
    description: 'Camera giao thÃ´ng ngÃ£ tÆ° Pháº¡m VÄƒn Báº¡ch - Viá»‡n Huyáº¿t Há»c',
    status: 'demo',
  },
  {
    id: 'cam-2',
    name: 'Khuáº¥t Duy Tiáº¿n - Nguyá»…n Xiá»ƒn (GÃ³c 1)',
    location: [20.991118, 105.802930], // NgÃ£ tÆ° Khuáº¥t Duy Tiáº¿n - Nguyá»…n Xiá»ƒn
    videoUrl: '/video_traffic/HNI_NT_KDT_Khuáº¥t Duy Tiáº¿n - Nguyá»…n Xiá»ƒn 1.mp4',
    description: 'Camera giao thÃ´ng Khuáº¥t Duy Tiáº¿n - Nguyá»…n Xiá»ƒn gÃ³c 1',
    status: 'demo',
  },
  {
    id: 'cam-3',
    name: 'Khuáº¥t Duy Tiáº¿n - Nguyá»…n Xiá»ƒn (GÃ³c 2)',
    location: [20.991761, 105.803992], // GÃ³c 2 cá»§a ngÃ£ tÆ°
    videoUrl: '/video_traffic/HNI_NT_KDT_Khuáº¥t Duy Tiáº¿n - Nguyá»…n Xiá»ƒn 2.mp4',
    description: 'Camera giao thÃ´ng Khuáº¥t Duy Tiáº¿n - Nguyá»…n Xiá»ƒn gÃ³c 2',
    status: 'demo',
  },
  {
    id: 'cam-4',
    name: 'Nguyá»…n Xiá»ƒn - Khuáº¥t Duy Tiáº¿n',
    location: [20.992635, 105.802553], // GÃ³c 3 cá»§a ngÃ£ tÆ°
    videoUrl: '/video_traffic/HNI_NT_KDT_Nguyá»…n Xiá»ƒn-Khuáº¥t Duy Tiáº¿n.mp4',
    description: 'Camera giao thÃ´ng ngÃ£ tÆ° Nguyá»…n Xiá»ƒn - Khuáº¥t Duy Tiáº¿n',
    status: 'demo',
  },
];

interface TrafficCameraPopupProps {
  camera: TrafficCamera;
}

// Compact popup content for Leaflet Popup - renders directly in map
export function TrafficCameraPopup({ camera }: TrafficCameraPopupProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Auto-play when opened
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, []);

  return (
    <div className="w-[320px]">
      {/* Header - Compact */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600/20">
          <Video className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{camera.name}</h3>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
            camera.status === 'online' ? 'bg-green-600/20 text-green-600' :
            camera.status === 'demo' ? 'bg-yellow-600/20 text-yellow-600' :
            'bg-red-600/20 text-red-600'
          }`}>
            {camera.status === 'online' ? 'â— Live' : 
             camera.status === 'demo' ? 'â— Demo' : 'â— Offline'}
          </span>
        </div>
      </div>

      {/* Video Player - Compact */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          src={camera.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Video Controls - Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
          <div className="flex items-center gap-1">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title={isPlaying ? 'Táº¡m dá»«ng' : 'PhÃ¡t'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title={isMuted ? 'Báº­t tiáº¿ng' : 'Táº¯t tiáº¿ng'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            <div className="flex-1" />

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="ToÃ n mÃ n hÃ¬nh"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Live indicator */}
        {camera.status === 'online' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        )}
      </div>
    </div>
  );
}

