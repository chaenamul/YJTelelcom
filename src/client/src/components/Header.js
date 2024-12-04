import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { socket } from "socket/socket";

function Header({ isConnected }) {
  const navigate = useNavigate();

  // socket
  function connect() {
    socket.connect();
  }

  // function disconnect() {
  //   socket.disconnect();
  // }

  return (
    <Box
      sx={{
        backgroundColor: "lightgrey",
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Navigation Links */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography
          onClick={() => {
            navigate("/main");
            socket.emit("reload_info")
          }}
          sx={{
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Main
        </Typography>
        <Typography
          onClick={() => navigate("/settings")}
          sx={{
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Settings
        </Typography>
      </Box>

      {/* Connect/Disconnect Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: isConnected ? "#007bff" : "white",
            color: isConnected ? "white" : "#007bff",
            border: "1px solid #007bff",
            "&:hover": {
              backgroundColor: isConnected ? "#0056b3" : "#f0f8ff",
            },
          }}
          onClick={connect}
        >
          Connect
        </Button>
        {/* <Button
          variant="contained"
          sx={{
            backgroundColor: isConnected ? "white" : "#007bff",
            color: isConnected ? "#007bff" : "white",
            border: "1px solid #007bff",
            "&:hover": {
              backgroundColor: isConnected ? "#f0f8ff" : "#0056b3",
            },
          }}
          onClick={disconnect}
        >
          Disconnect
        </Button> */}
      </Box>
    </Box>
  );
}

export default Header;
