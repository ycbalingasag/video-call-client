// ✅ Room.jsx (Messenger-style video call)
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('https://video-call-server-tmhu.onrender.com'); // ← Replace with your Render backend

export default function Room() {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const peerRef = useRef(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      streamRef.current = stream;
      localVideoRef.current.srcObject = stream;
      socket.emit('join-room', roomId);

      socket.on('user-joined', (userId) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (signal) => {
          socket.emit('signal', { signal, to: userId });
        });

        peer.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });

        peerRef.current = peer;
      });

      socket.on('receive-signal', ({ signal, from }) => {
        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (returnSignal) => {
          socket.emit('return-signal', { signal: returnSignal, to: from });
        });

        peer.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });

        peer.signal(signal);
        peerRef.current = peer;
      });

      socket.on('receive-return-signal', ({ signal }) => {
        peerRef.current?.signal(signal);
      });

      socket.on('chat-message', ({ message, from }) => {
        setChat(prev => [...prev, { message, from }]);
      });
    });

    return () => {
      socket.disconnect();
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [roomId]);

  const toggleMic = () => {
    const tracks = streamRef.current?.getAudioTracks();
    if (tracks) {
      tracks.forEach(track => (track.enabled = !micOn));
      setMicOn(!micOn);
    }
  };

  const toggleCam = () => {
    const tracks = streamRef.current?.getVideoTracks();
    if (tracks) {
      tracks.forEach(track => (track.enabled = !camOn));
      setCamOn(!camOn);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('chat-message', { message, from: 'You' });
    setChat(prev => [...prev, { message, from: 'You' }]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Room ID: {roomId}</h2>
      <div className="flex gap-4 mb-4">
        <div>
          <p className="text-center text-sm">You</p>
          <video ref={localVideoRef} autoPlay playsInline muted className="w-64 rounded-xl shadow" />
        </div>
        <div>
          <p className="text-center text-sm">Other</p>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-64 rounded-xl shadow" />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={toggleMic} className="bg-blue-600 px-4 py-2 rounded">
          {micOn ? 'Mute Mic' : 'Unmute Mic'}
        </button>
        <button onClick={toggleCam} className="bg-green-600 px-4 py-2 rounded">
          {camOn ? 'Turn Off Cam' : 'Turn On Cam'}
        </button>
      </div>

      <div className="bg-gray-700 w-full max-w-md rounded p-2 h-40 overflow-y-auto mb-2">
        {chat.map((c, i) => (
          <div key={i} className="text-sm"><strong>{c.from}:</strong> {c.message}</div>
        ))}
      </div>
      <div className="flex gap-2 w-full max-w-md">
        <input
          className="flex-1 px-2 py-1 text-black rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={sendMessage} className="bg-purple-600 px-3 py-1 rounded">Send</button>
      </div>
    </div>
  );
}
