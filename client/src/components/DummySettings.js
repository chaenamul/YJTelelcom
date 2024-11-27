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
        // Send the current settings data to the server
        socket.emit("update_settings", settings, (response) => {
            if (response.status === "success") {
                console.log("Settings updated successfully:", settings);
            } else {
                console.error("Failed to update settings:", response.message);
            }
        });
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

    const addRoom = () => {
        const newRoomKey = `room${Object.keys(settings.rooms).length + 1}`;
        setSettings((prevSettings) => ({
            ...prevSettings,
            rooms: {
                ...prevSettings.rooms,
                [newRoomKey]: { least: "192.168.0.0", greatest: "192.168.0.0" }, // Default values
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
