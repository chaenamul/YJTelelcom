import React, { useState, useEffect } from 'react';
import { socket } from 'socket/socket';
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const UserListBox = () => {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    socket.on("update_user_list", (data) => {
      if (data.users) {
        setUserList(data.users);
      }
    });

    socket.on("disconnect", () => {
      setUserList([]); // Clear the user list when disconnected
    });

    // Emit a request to join the room and get the current user list
    socket.emit("get_user_list", { room: "your_room_name" });

    return () => {
      socket.off("disconnect");
      socket.off("update_user_list");
    };
  }, []);

  return (
    <Box sx={{ width: '25%', float: 'right', height: '40vh', boxSizing: 'border-box' }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
        User List
      </Typography>

      <Paper
        elevation={3}
        sx={{
          border: '1px solid #ccc',
          padding: 2,
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <List>
          {userList.map((user, index) => (
            <ListItem key={index} sx={{ padding: '5px 0' }}>
              <ListItemText primary={user} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default UserListBox;
