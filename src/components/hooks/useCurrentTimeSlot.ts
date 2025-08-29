import { useState, useEffect } from 'react';

export const useCurrentTimeSlot = () => {
  const [currentSlot, setCurrentSlot] = useState(-1);
  
  useEffect(() => {
    const calculateCurrentSlot = () => {
      const now = new Date();
      const hr = now.getHours();
      const min = now.getMinutes();

      if (hr === 8 && min < 50) return 0;
      if ((hr === 8 && min >= 50) || (hr === 9 && min < 40)) return 1;
      if ((hr === 9 && min >= 40) || (hr === 10 && min < 35)) return 2;
      if ((hr === 10 && min >= 35) || (hr === 11 && min < 30)) return 3;
      if ((hr === 11 && min >= 30) || (hr === 12 && min < 25)) return 4;
      if ((hr === 12 && min >= 25) || (hr === 13 && min < 20)) return 5;
      if ((hr === 13 && min >= 20) || (hr === 14 && min < 15)) return 6;
      if ((hr === 14 && min >= 15) || (hr === 15 && min < 10)) return 7;
      if ((hr === 15 && min >= 10) || (hr === 16 && min < 0)) return 8;
      if ((hr === 16 && min >= 0) || (hr === 16 && min < 50)) return 9;
      if ((hr === 16 && min >= 50) || hr > 16) return -1;
      return -2;
    };

    setCurrentSlot(calculateCurrentSlot());
    
    // Update the current slot every minute
    const intervalId = setInterval(() => {
      setCurrentSlot(calculateCurrentSlot());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return currentSlot;
};