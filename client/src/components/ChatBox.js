import React, { useState, useEffect } from 'react';
import { socket, Event } from 'socket/socket';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");  // Username state

  // Listen for incoming messages when component mounts
  useEffect(() => {
    // Listen for initial username from server
    socket.on('set_username', (data) => {
      setUsername(data.username);  // Set the initial username
    });

    // Event listener for receiving messages
    socket.on(Event.RECEIVE_MESSAGE, (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Clean up listeners on unmount
    return () => {
      socket.off('set_username');
      socket.off(Event.RECEIVE_MESSAGE);
    };
  }, []);

  // Handle message change with Shift+Enter for new lines
  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle Enter key press for sending messages
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        setMessage((prevMessage) => prevMessage + "\n");  // Shift+Enter inserts a newline
      } else {
        e.preventDefault();  // Prevent new line on Enter
        handleSendMessage();
      }
    }
  };

  // Handle nickname change
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);  // Update username in state
  };

  // Emit the change_username event to the server
  const handleUsernameBlur = () => {
    socket.emit('change_username', username);  // Emit username change to server
  };

  // Send the message to the server
  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit(Event.SEND_MESSAGE, message);  // Send message to server
      setMessage("");  // Clear input after sending
    }
  };

  return (
    <div>
      <h2>Chat Room</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
          height: "200px",
          overflowY: "scroll"
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          onBlur={handleUsernameBlur}  // Trigger change when the input loses focus
        />
      </div>
      <textarea
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        style={{
          width: "50%",
          height: "50px"
        }}
      />
      <button onClick={handleSendMessage} disabled={!message.trim()}>
        Send
      </button>
    </div>
  );
};

export default ChatBox;
