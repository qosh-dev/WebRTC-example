import { useRef } from 'react';
import { Button } from '../components/atoms/Button';
import { Gallery } from '../components/layout/Gallery';
import { LocalVideo } from '../components/molecules/LocalVideo';
import { RemoteVideo } from '../components/molecules/RemoteVideo';
import { VideoControls } from '../components/molecules/VideoControls';
import { Header } from '../components/organisms/Header';
import { useCalculateVideoLayout } from '../hooks/use-calculate-video-layout.hook';
import { useCreateMediaStream } from '../hooks/use-create-media-stream.hook';
import { useCurrentRoom } from '../hooks/use-current-room.hook';
import { useStartPeerSession } from '../hooks/use-start-peer-session.hook';
import { toggleFullscreen } from '../utils/helpers';

export const Room = () => {
  // --------------------------------------------------------------------
  // Variables
  // --------------------------------------------------------------------
  const room = useCurrentRoom();
  const galleryRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<any>();
  const { mediaStream, refreshMediaStream } =
    useCreateMediaStream(localVideoRef);
  const {
    connectedUsers,
    shareScreen,
    cancelScreenSharing,
    isScreenShared,
    refreshPeerVideoConnection
  } = useStartPeerSession(room.roomId, mediaStream, localVideoRef);

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
    <div>
      <Header title="WEBRTC Example">
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
              style={{
                padding: '10px',
                background: '#37526d',
                border: '0px',
                fontSize: '16px',
                color: 'white'
              }}
              value={room.tempRoomId}
              onChange={(v) => room.setRoomId(+v.target.value)}
              id="room"
              type="number"
            />

            <Button onClick={() => room.openRoom()}>Open room</Button>
          </div>
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
