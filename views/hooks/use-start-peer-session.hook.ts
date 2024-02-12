import { MutableRefObject, useEffect, useState } from 'react';
import { PeerConnectionSession } from '../utils/PeerConnectionSession';

export const useStartPeerSession = (
  room: number | undefined,
  mediaStream: MediaStream | null,
  localVideoRef: MutableRefObject<HTMLVideoElement | null>
) => {
  // ---------------------------------------------------------------------------
  // Variables
  // ---------------------------------------------------------------------------

  const [peerVideoConnection, setPeerVideoConnection] =
    useState<PeerConnectionSession | null>(null);
  const [displayMediaStream, setDisplayMediaStream] =
    useState<MediaStream | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!room || !peerVideoConnection) {
      return;
    }
    if (mediaStream) {
      peerVideoConnection.joinRoom(room);
      peerVideoConnection.onAddUser((user) => {
        console.log({"onAddUser": user})
        setConnectedUsers((users) => [...users, user]);
        peerVideoConnection.addPeerConnection(
          `${user}`,
          mediaStream,
          (_stream) => {
            (document.getElementById(user) as any).srcObject = _stream;
          }
        );
        peerVideoConnection.callUser(user);
      });

      peerVideoConnection.onRemoveUser((socketId: string) => {
        setConnectedUsers((users) => users.filter((user) => user !== socketId));
        peerVideoConnection.removePeerConnection(socketId);
      });

      peerVideoConnection.onUpdateUserList(async (users: string[]) => {
        console.log("onUpdateUserList", users)
        setConnectedUsers(users);
        for (const user of users) {
          peerVideoConnection.addPeerConnection(
            `${user}`,
            mediaStream,
            (_stream) => {
              (document.getElementById(user) as any).srcObject = _stream;
            }
          );
        }
      });

      peerVideoConnection.onAnswerMade((socket: string) =>
        peerVideoConnection.callUser(socket)
      );
    }

    return () => {
      if (mediaStream) {
        peerVideoConnection.clearConnections();
        mediaStream?.getTracks()?.forEach((track) => track.stop());
      }
    };
  }, [peerVideoConnection, room, mediaStream]);

  useEffect(() => {
    if (!room) {
      return;
    }
    wait(1000).then(() => {
      setPeerVideoConnection(PeerConnectionSession.createConnection());
    })
  }, [room]);

  // ---------------------------------------------------------------------------
  // Functions
  // ---------------------------------------------------------------------------

  function refreshPeerVideoConnection() {
    setPeerVideoConnection(PeerConnectionSession.createConnection());
  }

  async function cancelScreenSharing() {
    if (!peerVideoConnection) {
      return;
    }
    if (!localVideoRef.current) {
      return;
    }
    if (!mediaStream) {
      return;
    }
    if (!displayMediaStream) {
      return;
    }
    const senders = peerVideoConnection.senders.filter(
      (sender) => sender?.track && sender.track.kind === 'video'
    );

    if (senders) {
      senders.forEach((sender) => {
        const track = mediaStream
          .getTracks()
          .find((track) => track.kind === 'video');
        if (!track) {
          return;
        }
        sender.replaceTrack(track);
      });
    }

    localVideoRef.current.srcObject = mediaStream;
    displayMediaStream.getTracks().forEach((track) => track.stop());
    setDisplayMediaStream(null);
  }

  async function shareScreen() {
    if (!peerVideoConnection) {
      return;
    }
    if (!localVideoRef.current) {
      return;
    }
    let stream = displayMediaStream;

    if (!stream) {
      stream = await (navigator.mediaDevices as any).getDisplayMedia();
    }

    if (!stream) {
      return;
    }

    const senders = peerVideoConnection.senders.filter(
      (sender) => sender.track && sender.track.kind === 'video'
    );

    if (senders) {
      senders.forEach((sender) => {
        if (stream) {
          sender.replaceTrack(stream.getTracks()[0]);
        }
      });
    }

    stream
      .getVideoTracks()[0]
      .addEventListener('ended', () => cancelScreenSharing());

    localVideoRef.current.srcObject = stream;

    setDisplayMediaStream(stream);
  }

  // ---------------------------------------------------------------------------
  return {
    connectedUsers,
    peerVideoConnection,
    refreshPeerVideoConnection,
    shareScreen,
    cancelScreenSharing,
    isScreenShared: !!displayMediaStream
  };
};

async function wait(milliseconds: number): Promise<boolean> {
  return new Promise((res) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      res(true);
    }, milliseconds);
  });
}
