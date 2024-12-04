import React, { useState, useEffect, useRef } from 'react';
import { socket } from 'socket/socket';
import {
  Box,
  Typography,
  TextField,
  Button
} from "@mui/material";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");  // Username state
  const [room, setRoom] = useState("");
  const bottomRef = useRef(null);

  // Listen for incoming messages
  useEffect(() => {
    // Event listener for receiving messages
    socket.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setTimeout(() => {
    	  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 10);
    });

    // Clean up listeners on unmount
    return () => {
      socket.off("receive_message");
    };
  }, [messages]);
  
  // Listen for username update
  useEffect(() => {
    // Listen for initial username from server
    socket.on("set_username", (data) => {
      setUsername(data.username);  // Set the initial username
    });

    socket.on("set_room", (data) => {
      setRoom(data.room);
    });

    // Clean up listeners on unmount
    return () => {
      socket.off("set_username");
      socket.off("set_room");
    };
  }, [username, room]);

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
    socket.emit("change_username", username);  // Emit username change to server
  };

  // Send the message to the server
  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", message);  // Send message to server
      setMessage("");  // Clear input after sending
    }
  };

  return (
    <Box
      sx={{
        width: "80%",
        height: "80vh",
        float: "left",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        p: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Chat Room - {room}
      </Typography>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 2,
          mb: 2,
          height: "80%",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>{msg.sender}:</strong> {msg.text}
            </Typography>
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          label="Username"
          value={username}
          onChange={handleUsernameChange}
          onBlur={handleUsernameBlur}
          size="small"
          fullWidth
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <TextField
          value={message}
          disabled={socket.disconnected}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          multiline
          rows={2}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBox;
