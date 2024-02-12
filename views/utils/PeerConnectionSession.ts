import { Socket } from 'socket.io';
import * as io from 'socket.io-client';

export class PeerConnectionSession {
  _onConnected?: (event: Event, id: string) => void;
  _onDisconnected?: (event: Event, id: string) => void;
  _room?: number;
  peerConnections: { [n in string]: RTCPeerConnection } = {};
  senders: RTCRtpSender[] = [];
  listeners: { [n in string]: (event: Event) => void } = {};
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.onCallMade();
  }

  addPeerConnection(
    id: string,
    stream: MediaStream,
    callback: (stream: MediaStream) => void
  ) {
    this.peerConnections[id] = new window.RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach((track: any) => {
      const data = this.peerConnections[id].addTrack(track, stream);
      this.senders.push(data);
    });

    this.listeners[id] = (event: Event) => {
      const connState = this.peerConnections[id].connectionState;
      const actionName = ('_on' + this.capitalize(connState)) as
        | '_onConnected'
        | '_onDisconnected';
      const fn = this[actionName];
      fn && fn(event, id);
    };

    this.peerConnections[id].addEventListener(
      'connectionstatechange',
      this.listeners[id]
    );

    this.peerConnections[id].ontrack = ({ streams: [stream] }) => {
      callback(stream);
    };
  }

  removePeerConnection(id: string) {
    this.peerConnections[id].removeEventListener(
      'connectionstatechange',
      this.listeners[id]
    );
    delete this.peerConnections[id];
    delete this.listeners[id];
  }

  isAlreadyCalling = false;

  async callUser(to: string) {
    if (this.peerConnections[to].iceConnectionState === 'new') {
      const offer = await this.peerConnections[to].createOffer();
      await this.peerConnections[to].setLocalDescription(
        new window.RTCSessionDescription(offer)
      );
      this.socket.emit('call-user', { offer, to });
    }
  }

  onConnected(callback: (event: Event, id: string) => void) {
    this._onConnected = callback;
  }

  onDisconnected(callback: (event: Event, id: string) => void) {
    this._onDisconnected = callback;
  }

  joinRoom(room: number) {
    this._room = room;
    this.socket.emit('joinRoom', room);
  }

  onCallMade() {
    this.socket.on(
      'call-made',
      async (data: { socket: string; offer: RTCSessionDescriptionInit }) => {
        const id = data.socket;
        await this.peerConnections[id].setRemoteDescription(
          new window.RTCSessionDescription(data.offer)
        );
        const answer = await this.peerConnections[id].createAnswer();
        await this.peerConnections[id].setLocalDescription(
          new window.RTCSessionDescription(answer)
        );

        this.socket.emit('make-answer', {
          answer,
          to: id
        });
      }
    );
  }

  onAddUser(callback: (user: string) => void) {
    this.socket.on(
      `${this._room}-add-user`,
      async ({ user }: { user: string }) => {
        callback(user);
      }
    );
  }

  onRemoveUser(callback: { (socketId: any): void; (arg0: any): void }) {
    this.socket.on(`${this._room}-remove-user`, ({ socketId }) => {
      callback(socketId);
    });
  }

  onUpdateUserList(callback: {
    (users: any): Promise<void>;
    (arg0: any, arg1: any): void;
  }) {
    this.socket.on(`${this._room}-update-user-list`, ({ users, current }) => {
      callback(users, current);
    });
  }

  onAnswerMade(callback: { (socket: any): Promise<void>; (arg0: any): void }) {
    this.socket.on(
      'answer-made',
      async (data: {
        socket: string | number;
        answer: RTCSessionDescriptionInit;
      }) => {
        await this.peerConnections[data.socket].setRemoteDescription(
          new window.RTCSessionDescription(data.answer)
        );
        callback(data.socket);
      }
    );
  }

  clearConnections() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.senders = [];
    Object.keys(this.peerConnections).forEach(
      this.removePeerConnection.bind(this)
    );
  }

  capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  static createConnection() {
    const socket = io(`${window.location.href}chat`);
    return new PeerConnectionSession(socket);
  }
}
