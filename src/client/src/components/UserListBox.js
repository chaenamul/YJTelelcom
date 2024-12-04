import React, { useState, useEffect } from 'react';
import { socket } from 'socket/socket';
import {
  Box,
  Typography
} from "@mui/material";

const UserListBox = () => {
  //const [username, setUsername] = useState("");
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
    <Box
      sx={{
        width: '20%',
        height: '50vh',
        float: 'right',
        padding: 2,
        paddingLeft: 0,
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="h5" gutterBottom>
        User List
      </Typography>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 2,
          mb: 2,
          height: "100%",
          overflowY: "scroll",
        }}
      >
        {userList.map((user, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            {user}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default UserListBox;
