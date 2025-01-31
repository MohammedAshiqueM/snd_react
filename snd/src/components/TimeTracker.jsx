import React, { useEffect, useState, useCallback } from 'react';
import { Clock } from 'lucide-react';

const TimeTracker = ({ duration, onTimeOver, isConnected, onCallEnd }) => {
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const validDuration = typeof duration === 'number' && duration > 0 ? duration : 60;

  // Start timer when connection is established
  useEffect(() => {
    if (isConnected && !startTime) {
      setStartTime(Date.now());
      setCurrentTime(Date.now());
      setTimerActive(true);
      console.log("TimeTracker: Connection established, starting timer");
    } else if (!isConnected && startTime) {
      // Optional: Pause timer when connection is lost
      setTimerActive(false);
      console.log("TimeTracker: Connection lost, pausing timer");
    }
  }, [isConnected, startTime]);

  const calculateTimeRemaining = useCallback(() => {
    if (!startTime) return validDuration * 60;

    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    const remainingSeconds = (validDuration * 60) - elapsedSeconds;
    return Math.max(0, remainingSeconds);
  }, [currentTime, startTime, validDuration]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    console.log("TimeTracker mounted with duration:", duration, "valid duration:", validDuration);
    let intervalId;

    if (timerActive) {
      intervalId = setInterval(() => {
        setCurrentTime(Date.now());
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [duration, validDuration, timerActive, startTime]);

  useEffect(() => {
    if (timerActive) {
      const remaining = calculateTimeRemaining();
      console.log("Time remaining:", remaining);
      if (remaining <= 0) {
        setTimerActive(false);
        onTimeOver?.();
      }
    }
  }, [calculateTimeRemaining, onTimeOver, timerActive]);

  const handleCallEnd = () => {
    const totalElapsedTime = Math.floor((Date.now() - startTime) / 1000);
    onCallEnd?.(totalElapsedTime);
  };

  const remainingSeconds = calculateTimeRemaining();
  const isWarning = remainingSeconds <= 300; // 5 minutes

  return (
    <div className="absolute top-4 left-4 z-10">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
          !isConnected 
            ? 'bg-gray-600/90 text-gray-300'
            : isWarning
              ? 'bg-red-500/90 text-white animate-pulse'
              : 'bg-gray-800/90 text-white'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span className="font-medium tracking-wider">
          {isConnected ? formatTime(remainingSeconds) : '--:--'}
        </span>
      </div>
    </div>
  );
};

export default TimeTracker;