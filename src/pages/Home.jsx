import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  const handleCreate = () => {
    const newRoomId = uuidV4();
    navigate(`/room/${newRoomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">🎥 CallPro Video Call</h1>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="mb-4 px-4 py-2 text-black rounded"
      />
      <div className="flex gap-4">
        <button onClick={handleJoin} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Join Room</button>
        <button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Create Room</button>
      </div>
    </div>
  );
}
