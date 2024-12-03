import React from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "socket/socket";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";

function Header({ isConnected }) {
  const navigate = useNavigate();

  // socket
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: "lightgrey", color: "black" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Navigation Links */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Typography
            variant="h6"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/main")}
          >
            Main
          </Typography>
          <Typography
            variant="h6"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/settings")}
          >
            Settings
          </Typography>
        </Box>

        {/* Connect/Disconnect Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant={isConnected ? "contained" : "outlined"}
            color="primary"
            onClick={connect}
          >
            Connect
          </Button>
          <Button
            variant={isConnected ? "outlined" : "contained"}
            color="primary"
            onClick={disconnect}
          >
            Disconnect
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
