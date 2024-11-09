import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ChatApp = () => {
    const [online, setOnline] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (online) {
            const newSocket = io('http://localhost:8000');
            setSocket(newSocket);

            newSocket.on('join_room', (data) => {
                console.log(`Joined room: ${data.room}`);
            });

            return () => newSocket.disconnect();
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [online]);

    const handleToggle = () => {
        setOnline((prev) => !prev);
    };

    return (
        <div>
            <button onClick={handleToggle}>
                {online ? 'Go Offline' : 'Go Online'}
            </button>
            {online ? <p>You are online and in the chat room.</p> : <p>You are offline.</p>}
        </div>
    );
};

export default ChatApp;
