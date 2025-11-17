import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface AudioPlayerProps {
  audioUrl?: string | null;
  text?: string;
}

export function AudioPlayer({ audioUrl, text }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // If audioUrl is provided, use audio element
  // Otherwise, use Web Speech API for text-to-speech
  const useAudioFile = !!audioUrl;

  useEffect(() => {
    if (useAudioFile && audioUrl) {
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current!.duration);
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setProgress(audioRef.current!.currentTime);
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    } else if (text) {
      // Prepare speech synthesis
      speechRef.current = new SpeechSynthesisUtterance(text);
      speechRef.current.rate = 1;
      speechRef.current.pitch = 1;
      
      speechRef.current.onend = () => {
        setIsPlaying(false);
      };
    }
  }, [audioUrl, text, useAudioFile]);

  const togglePlayPause = () => {
    if (useAudioFile && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (speechRef.current) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.speak(speechRef.current);
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (useAudioFile && audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (value: number[]) => {
    if (useAudioFile && audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl && !text) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlayPause}
          variant="default"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1">
          <div className="text-sm mb-2">
            {useAudioFile ? 'Audio Version' : 'Listen to Article (Text-to-Speech)'}
          </div>
          
          {useAudioFile && (
            <>
              <Slider
                value={[progress]}
                max={duration}
                step={1}
                onValueChange={handleSeek}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>

        {useAudioFile && (
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
