import { RefObject, useEffect, useState } from 'react';

export const useCreateMediaStream = (
  localVideoRef: RefObject<HTMLVideoElement>
) => {
  // ---------------------------------------------------------------------------
  // Variables
  // ---------------------------------------------------------------------------

  const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(
    null
  );

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const createMediaStream = async () => {
      if (!localVideoRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 640, ideal: 1920 },
          height: { min: 400, ideal: 1080 },
          aspectRatio: { ideal: 1.7777777778 }
        },
        audio: true
      });

      localVideoRef.current.srcObject = stream;

      setUserMediaStream(stream);
    };

    createMediaStream();
  }, [localVideoRef]);

  return userMediaStream;
};
