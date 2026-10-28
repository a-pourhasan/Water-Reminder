import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

export function useTiltSensor() {
  const [tiltX, setTiltX] = useState<number>(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(16); // Set the update interval to 100ms

    const subscription = Accelerometer.addListener((data) => {
      setTiltX(data.x);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return tiltX;
}
