import { MutableRefObject, useEffect, useMemo, useState } from 'react';
import { PeerConnectionSession } from '../utils/PeerConnectionSession';

export const useStartPeerSession = (
  room: number,
  userMediaStream: MediaStream | null,
  localVideoRef: MutableRefObject<HTMLVideoElement | null>
) => {
  // ---------------------------------------------------------------------------
  // Variables
  // ---------------------------------------------------------------------------

  const peerVideoConnection = useMemo(
    () => PeerConnectionSession.createConnection(),
    []
  );
  const [displayMediaStream, setDisplayMediaStream] =
    useState<MediaStream | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (userMediaStream) {
      peerVideoConnection.joinRoom(room);
      peerVideoConnection.onAddUser((user) => {
        console.log({ user11111: user });
        setConnectedUsers((users) => [...users, user]);
        peerVideoConnection.addPeerConnection(
          `${user}`,
          userMediaStream,
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
        setConnectedUsers(users);
        for (const user of users) {
          peerVideoConnection.addPeerConnection(
            `${user}`,
            userMediaStream,
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
      if (userMediaStream) {
        peerVideoConnection.clearConnections();
        userMediaStream?.getTracks()?.forEach((track) => track.stop());
      }
    };
  }, [peerVideoConnection, room, userMediaStream]);

  // ---------------------------------------------------------------------------
  // Functions
  // ---------------------------------------------------------------------------

  async function cancelScreenSharing() {
    if (!localVideoRef.current) {
      return;
    }
    if (!userMediaStream) {
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
        const track = userMediaStream
          .getTracks()
          .find((track) => track.kind === 'video');
        if (!track) {
          return;
        }
        sender.replaceTrack(track);
      });
    }

    localVideoRef.current.srcObject = userMediaStream;
    displayMediaStream.getTracks().forEach((track) => track.stop());
    setDisplayMediaStream(null);
  }

  async function shareScreen() {
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
        if(stream){
          sender.replaceTrack(stream.getTracks()[0])
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
    shareScreen,
    cancelScreenSharing,
    isScreenShared: !!displayMediaStream
  };
};
