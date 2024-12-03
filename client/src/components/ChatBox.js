import React, { useState, useEffect, useRef } from 'react';
import { socket } from 'socket/socket';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 10);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', message);
      setMessage('');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 2,
      }}
    >
      {/* Chat Header */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Chat Room
      </Typography>

      {/* Chat Messages */}
      <Box
        sx={{
          flex: 1, // flexible
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: 2,
          mb: 2,
        }}
      >
        {messages.map((msg, index) => (
          <Typography key={index} variant="body1" sx={{ mb: 1 }}>
            {msg.sender}: {msg.text}
          </Typography>
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Chat Input */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Type your message..."
          multiline
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatBox;
