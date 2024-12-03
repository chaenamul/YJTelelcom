import React, { useState, useEffect } from "react";
import { socket } from "socket/socket";
import { Box, TextField, Button, Typography, Grid, Card, CardContent } from "@mui/material";

const DummySettings = () => {
  const [settings, setSettings] = useState({
    rooms: {
      room1: { least: "192.168.0.0", greatest: "192.168.0.100" },
      room2: { least: "192.168.0.101", greatest: "192.168.0.255" },
    },
  });

  useEffect(() => {
    socket.on("receive_settings", (data) => {
      if (data.status === "success") {
        setSettings(data.settings);
        console.log("Settings received:", data.settings);
      } else {
        console.error("Failed to receive settings:", data.message);
      }
    });

    return () => {
      socket.off("receive_settings");
    };
  }, []);

  const updateServerSettings = () => {
    const { rooms } = settings;
    socket.emit("update_settings", rooms, (response) => {
      if (response?.status === "success") {
        console.log("Settings updated successfully:", rooms);
      } else {
        console.error(
          "Failed to update settings:",
          response?.message || "No response from server"
        );
      }
    });
  };

  const addRoom = () => {
    const roomKeys = Object.keys(settings.rooms);
    const lastRoomKey = roomKeys[roomKeys.length - 1];
    const lastGreatestIP = settings.rooms[lastRoomKey].greatest;
    const [base, fourthOctet] = lastGreatestIP.split(".");

    const newLeastIP = `${base}.${parseInt(fourthOctet, 10) + 1}`;
    const newGreatestIP = `${base}.${parseInt(fourthOctet, 10) + 100}`;

    const newRoomKey = `room${roomKeys.length + 1}`;
    setSettings((prevSettings) => ({
      ...prevSettings,
      rooms: {
        ...prevSettings.rooms,
        [newRoomKey]: { least: newLeastIP, greatest: newGreatestIP },
      },
    }));
  };

  const handleInputChange = (roomKey, field, event) => {
    const input = event.target.value;
    setSettings((prevSettings) => ({
      ...prevSettings,
      rooms: {
        ...prevSettings.rooms,
        [roomKey]: {
          ...prevSettings.rooms[roomKey],
          [field]: input,
        },
      },
    }));
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Room Settings
      </Typography>

      {/* Render each room */}
      {Object.entries(settings.rooms).map(([roomKey, roomData]) => (
        <Card key={roomKey} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{roomKey}</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Least IP"
                  variant="outlined"
                  value={roomData.least}
                  onChange={(event) => handleInputChange(roomKey, "least", event)}
                  placeholder="Enter least IP"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Greatest IP"
                  variant="outlined"
                  value={roomData.greatest}
                  onChange={(event) => handleInputChange(roomKey, "greatest", event)}
                  placeholder="Enter greatest IP"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="contained" color="primary" onClick={addRoom}>
          Add Room
        </Button>
        <Button variant="outlined" color="secondary" onClick={updateServerSettings}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default DummySettings;
