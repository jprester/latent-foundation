"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

interface AudioPlayerProps {
  content: string;
  title: string;
}

export default function AudioPlayer({ content, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState(0.9);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textChunks = useRef<string[]>([]);
  const currentChunkIndex = useRef(0);

  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      // Load available voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Set default voice (prefer English voices)
        const englishVoices = availableVoices.filter(
          (voice) =>
            voice.lang.startsWith("en") && voice.name.includes("Enhanced")
        );
        if (englishVoices.length > 0) {
          setSelectedVoice(englishVoices[0].name);
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0].name);
        }
      };

      // Voices might load asynchronously
      if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        speechSynthesis.addEventListener("voiceschanged", loadVoices);
      }

      return () => {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }
  }, []);

  // Process content into manageable chunks
  useEffect(() => {
    if (content) {
      // Clean up markdown and split into sentences
      const cleanText = content
        .replace(/#{1,6}\s+/g, "") // Remove headers
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
        .replace(/\*(.*?)\*/g, "$1") // Remove italic
        .replace(/`(.*?)`/g, "$1") // Remove code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
        .replace(/\n\s*\n/g, "\n") // Remove extra newlines
        .trim();

      // Split into sentences but keep reasonable chunks
      const sentences = cleanText
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      const chunks: string[] = [];
      let currentChunk = "";

      sentences.forEach((sentence) => {
        const trimmedSentence = sentence.trim();
        if (currentChunk.length + trimmedSentence.length < 200) {
          currentChunk += (currentChunk ? ". " : "") + trimmedSentence;
        } else {
          if (currentChunk) chunks.push(currentChunk + ".");
          currentChunk = trimmedSentence;
        }
      });

      if (currentChunk) chunks.push(currentChunk + ".");

      textChunks.current = chunks;
      setTotalLength(chunks.length);
    }
  }, [content]);

  const speakChunk = (chunkIndex: number) => {
    if (!isSupported || !textChunks.current[chunkIndex]) return;

    const utterance = new SpeechSynthesisUtterance(
      textChunks.current[chunkIndex]
    );

    // Set voice
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      currentChunkIndex.current++;
      setCurrentPosition(currentChunkIndex.current);

      if (currentChunkIndex.current < textChunks.current.length && isPlaying) {
        // Continue to next chunk
        setTimeout(() => speakChunk(currentChunkIndex.current), 100);
      } else {
        // Finished or stopped
        setIsPlaying(false);
        setIsPaused(false);
        if (currentChunkIndex.current >= textChunks.current.length) {
          currentChunkIndex.current = 0;
          setCurrentPosition(0);
        }
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!isSupported) return;

    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      speakChunk(currentChunkIndex.current);
    }
  };

  const handlePause = () => {
    if (!isSupported) return;

    speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!isSupported) return;

    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    currentChunkIndex.current = 0;
    setCurrentPosition(0);
  };

  const handleSkipBack = () => {
    if (currentChunkIndex.current > 0) {
      speechSynthesis.cancel();
      currentChunkIndex.current = Math.max(0, currentChunkIndex.current - 1);
      setCurrentPosition(currentChunkIndex.current);

      if (isPlaying) {
        setTimeout(() => speakChunk(currentChunkIndex.current), 100);
      }
    }
  };

  const handleSkipForward = () => {
    if (currentChunkIndex.current < textChunks.current.length - 1) {
      speechSynthesis.cancel();
      currentChunkIndex.current = Math.min(
        textChunks.current.length - 1,
        currentChunkIndex.current + 1
      );
      setCurrentPosition(currentChunkIndex.current);

      if (isPlaying) {
        setTimeout(() => speakChunk(currentChunkIndex.current), 100);
      }
    }
  };

  const progressPercentage =
    totalLength > 0 ? (currentPosition / totalLength) * 100 : 0;

  if (!isSupported) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded border border-gray-300 dark:border-gray-600 mb-6">
        <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
          AUDIO PLAYBACK NOT SUPPORTED IN THIS BROWSER
        </p>
      </div>
    );
  }

  return (
    <div className="bg-scp-card dark:bg-scp-card-dark border border-scp-border dark:border-scp-border-dark p-6 rounded-none mb-6 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-5 h-5 text-scp-accent dark:text-scp-accent-dark" />
        <h3 className="font-mono font-bold text-scp-text dark:text-scp-text-dark">
          AUDIO PLAYBACK - {title}
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">
          <span>PROGRESS</span>
          <span>
            {currentPosition + 1} / {totalLength}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded">
          <div
            className="bg-scp-accent dark:bg-scp-accent-dark h-2 rounded transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleSkipBack}
          disabled={currentPosition === 0}
          className="p-2 text-scp-text dark:text-scp-text-dark hover:text-scp-accent dark:hover:text-scp-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Skip back">
          <SkipBack className="w-5 h-5" />
        </button>

        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="p-3 bg-scp-accent dark:bg-scp-accent-dark text-white rounded-full hover:bg-red-800 dark:hover:bg-red-600 transition-colors"
            aria-label={isPaused ? "Resume" : "Play"}>
            <Play className="w-6 h-6 ml-1" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-3 bg-scp-accent dark:bg-scp-accent-dark text-white rounded-full hover:bg-red-800 dark:hover:bg-red-600 transition-colors"
            aria-label="Pause">
            <Pause className="w-6 h-6" />
          </button>
        )}

        <button
          onClick={handleStop}
          className="p-2 text-scp-text dark:text-scp-text-dark hover:text-scp-accent dark:hover:text-scp-accent-dark transition-colors"
          aria-label="Stop">
          <Square className="w-5 h-5" />
        </button>

        <button
          onClick={handleSkipForward}
          disabled={currentPosition >= totalLength - 1}
          className="p-2 text-scp-text dark:text-scp-text-dark hover:text-scp-accent dark:hover:text-scp-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Skip forward">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Settings */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="font-mono text-gray-600 dark:text-gray-400">
            VOICE:
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs font-mono"
            disabled={isPlaying}>
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-mono text-gray-600 dark:text-gray-400">
            SPEED:
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-16"
            disabled={isPlaying}
          />
          <span className="font-mono text-xs text-gray-600 dark:text-gray-400 w-8">
            {rate.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
}
