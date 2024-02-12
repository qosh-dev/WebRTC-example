import { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { LocalVideo } from '../components/molecules/LocalVideo';

import { Button } from '../components/atoms/Button';
import { Gallery } from '../components/layout/Gallery';
import { RemoteVideo } from '../components/molecules/RemoteVideo';
import { VideoControls } from '../components/molecules/VideoControls';
import { Header } from '../components/organisms/Header';
import { useCalculateVideoLayout } from '../hooks/use-calculate-video-layout.hook';
import { useCreateMediaStream } from '../hooks/use-create-media-stream.hook';
import { useStartPeerSession } from '../hooks/use-start-peer-session.hook';
import { toggleFullscreen } from '../utils/helpers';

export const Room = () => {
  // --------------------------------------------------------------------
  // Variables
  // --------------------------------------------------------------------
  // const { room = 1 } = useParams<{room: string}>();
  const room = 1;
  let history = useHistory();
  const inputRef = useRef<any>(null);
  const galleryRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<any>();

  const userMediaStream = useCreateMediaStream(localVideoRef);
  const { connectedUsers, shareScreen, cancelScreenSharing, isScreenShared } =
    useStartPeerSession(room, userMediaStream, localVideoRef);

  // --------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------

  useCalculateVideoLayout(galleryRef, connectedUsers.length + 1);

  // --------------------------------------------------------------------
  // Functions
  // --------------------------------------------------------------------

  async function handleScreenSharing(share: boolean) {
    if (share) {
      await shareScreen();
    } else {
      await cancelScreenSharing();
    }
  }

  function handleFullscreen(fullscreen: boolean) {
    toggleFullscreen(fullscreen, mainRef.current);
  }

  // --------------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: '100vh',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Header title="TESTING WEBRTC">
        <>
          <div
            style={{
              background: '#37526d',
              padding: '2px',
              marginRight: '10px',
              borderRadius: '5px'
            }}
          >
            <label
              style={{
                padding: '5px 5px',
                fontSize: '16px',
                borderRight: '1px solid black'
              }}
              htmlFor="room"
            >
              Room
            </label>
            <input
              ref={inputRef}
              style={{
                padding: '10px',
                background: '#37526d',
                border: '0px',
                fontSize: '16px',
                color: 'white'
              }}
              id="room"
              type="text"
            />
          </div>
          <Button onClick={() => history.push(`/${inputRef.current.value}`)}>
            Login
          </Button>
        </>
      </Header>

      <div
        style={{
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 64px)',
          backgroundColor: '#1c1c1e'
        }}
        ref={mainRef}
      >
        <Gallery ref={galleryRef}>
          <LocalVideo ref={localVideoRef} autoPlay playsInline muted />
          {connectedUsers.map((user) => (
            <RemoteVideo key={user} id={user} autoPlay playsInline />
          ))}
        </Gallery>

        <VideoControls
          isScreenShared={isScreenShared}
          onScreenShare={handleScreenSharing}
          onToggleFullscreen={handleFullscreen}
        />
      </div>
    </div>
  );
};
