import { ForwardedRef, forwardRef } from 'react';
import { Video, VideoContainer } from '../atoms/Video';
import { VoiceVisualizer } from '../atoms/VoiceVisualizer';

export const LocalVideo = forwardRef(
  (
    props: React.DetailedHTMLProps<
      React.VideoHTMLAttributes<HTMLVideoElement>,
      HTMLVideoElement
    >,
    ref: ForwardedRef<HTMLVideoElement>
  ) => {
    return (
      <VideoContainer>
        <VoiceVisualizer id="local" />
        <Video {...props} ref={ref} />
      </VideoContainer>
    );
  }
);
