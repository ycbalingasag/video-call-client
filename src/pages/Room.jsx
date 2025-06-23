import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';

// PALITAN ITO ng Render URL mo
const socket = io('https://video-call-server-tmhu.onrender.com');

export default function Room() {
  const { roomId } = useParams();
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;

      socket.emit('join-room', roomId);

      socket.on('user-joined', (userId) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (signal) => {
          socket.emit('signal', { signal, to: userId });
        });

        peer.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
          remoteVideoRef.current.srcObject = remoteStream;
        });

        peerRef.current = peer;
      });

      socket.on('receive-signal', ({ signal }) => {
        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (signal) => {
          socket.emit('return-signal', { signal });
        });

        peer.signal(signal);

        peer.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
          remoteVideoRef.current.srcObject = remoteStream;
        });

        peerRef.current = peer;
      });

      socket.on('receive-return-signal', ({ signal }) => {
        peerRef.current?.signal(signal);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return (
    <div className="h-screen bg-gray-800 text-white p-4 flex flex-col items-center justify-center gap-6">
      <h2 className="text-xl">Room: {roomId}</h2>
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay playsInline muted className="rounded-xl shadow-md w-64" />
        <video ref={remoteVideoRef} autoPlay playsInline className="rounded-xl shadow-md w-64" />
      </div>
    </div>
  );
}
