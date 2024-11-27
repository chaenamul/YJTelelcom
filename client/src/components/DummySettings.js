import React, { useState, useEffect } from "react";
import { socket } from "socket/socket";

const DummySettings = () => {
    const [settings, setSettings] = useState({
        rooms: {
            room1: { least: "192.168.0.0", greatest: "192.168.0.100" },
            room2: { least: "192.168.0.101", greatest: "192.168.0.255" },
        },
    }); // Initial settings

    useEffect(() => {
        // Event listener for receiving settings
        socket.on("receive_settings", (data) => {
            if (data.status === "success") {
                setSettings(data.settings); // Save settings data to state
                console.log("Settings received:", data.settings);
            } else {
                console.error("Failed to receive settings:", data.message);
            }
        });

        // Clean up listeners on unmount
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

        // Update settings based on input
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
        <div>
            <h3>Room Settings</h3>
            {Object.entries(settings.rooms).map(([roomKey, roomData]) => (
                <div key={roomKey}>
                    <h4>{roomKey}</h4>
                    <label htmlFor={`${roomKey}-least`}>
                        Least IP:
                    </label>
                    <input
                        type="text"
                        id={`${roomKey}-least`}
                        value={roomData.least}
                        onChange={(event) => handleInputChange(roomKey, "least", event)}
                        placeholder="Enter least IP"
                    />
                    <label htmlFor={`${roomKey}-greatest`}>
                        Greatest IP:
                    </label>
                    <input
                        type="text"
                        id={`${roomKey}-greatest`}
                        value={roomData.greatest}
                        onChange={(event) => handleInputChange(roomKey, "greatest", event)}
                        placeholder="Enter greatest IP"
                    />
                </div>
            ))}
            <button onClick={addRoom}>Add Room</button>
            <button onClick={updateServerSettings}>Change</button>
        </div>
    );
};

export default DummySettings;
