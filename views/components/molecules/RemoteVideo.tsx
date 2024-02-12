import { useEffect, useState } from 'react';
import { useCalculateVoiceVolume } from '../../hooks/use-calculate-voice-volume.hook';
import { Video, VideoContainer } from '../atoms/Video';
import { VoiceVisualizer } from '../atoms/VoiceVisualizer';

export const RemoteVideo = (props) => {
  // --------------------------------------------------------------------
  // Variables
  // --------------------------------------------------------------------

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // --------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------

  useCalculateVoiceVolume(mediaStream, props.id);

  useEffect(() => {
    const interval = setInterval(() => {
      const stream = (document?.getElementById(props.id) as any)
        .srcObject as MediaStream;

      if (stream) {
        setMediaStream(stream);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [props.id]);

  // --------------------------------------------------------------------
  return (
    <VideoContainer>
      <VoiceVisualizer id={props.id} />
      <Video {...props} />
    </VideoContainer>
  );
};
