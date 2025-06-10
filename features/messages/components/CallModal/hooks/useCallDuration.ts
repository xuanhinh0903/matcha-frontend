import { useEffect, useState } from 'react';
import { CallStatus } from '../types';

export const useCallDuration = (
  callStatus: CallStatus,
  initialDuration = 0
) => {
  const [formattedDuration, setFormattedDuration] = useState('00:00');
  const [localDuration, setLocalDuration] = useState(0);

  // Format call duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setLocalDuration((prev) => {
          const newDuration = prev + 1;
          const minutes = Math.floor(newDuration / 60)
            .toString()
            .padStart(2, '0');
          const seconds = (newDuration % 60).toString().padStart(2, '0');
          setFormattedDuration(`${minutes}:${seconds}`);
          return newDuration;
        });
      }, 1000);
    } else if (initialDuration > 0) {
      const minutes = Math.floor(initialDuration / 60)
        .toString()
        .padStart(2, '0');
      const seconds = (initialDuration % 60).toString().padStart(2, '0');
      setFormattedDuration(`${minutes}:${seconds}`);
    } else {
      setFormattedDuration('00:00');
      setLocalDuration(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus, initialDuration]);

  return formattedDuration;
};
