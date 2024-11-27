import React, { useState, useEffect } from "react";
import { socket } from "socket/socket";

const DummySettings = () => {
    const [settings, setSettings] = useState({
        rooms: {
            room1: { least: "192.168.0.0", greatest: "192.168.0.100" },
            room2: { least: "192.168.0.101", greatest: "192.168.0.255" },
        },
    }); // 초기 설정값

    useEffect(() => {
        // Event listener for receiving settings
        socket.on("receive_settings", (data) => {
            if (data.status === "success") {
                setSettings(data.settings); // Settings 데이터 상태에 저장
                console.log("Settings received:", data.settings);
            } else {
                console.error("Failed to receive settings:", data.message);
            }
        });

        // Clean up listeners on unmount
        return () => {
            socket.off("receive_settings");
        };
    }, [settings]);

    const updateServerSettings = (updatedSettings) => {
        // 서버로 settings 데이터 전달
        socket.emit("update_settings", updatedSettings, (response) => {
            if (response.status === "success") {
                console.log("Settings updated successfully:", updatedSettings);
            } else {
                console.error("Failed to update settings:", response.message);
            }
        });
    };

    const handleInputChange = (roomKey, field, event) => {
        const input = event.target.value;

        // 입력값에 따라 settings 업데이트
        const updatedSettings = {
            ...settings,
            rooms: {
                ...settings.rooms,
                [roomKey]: {
                    ...settings.rooms[roomKey],
                    [field]: input,
                },
            },
        };

        setSettings(updatedSettings);
        updateServerSettings(updatedSettings); // 변경된 데이터를 서버로 전달
    };

    const addRoom = () => {
        const newRoomKey = `room${Object.keys(settings.rooms).length + 1}`;
        const updatedSettings = {
            ...settings,
            rooms: {
                ...settings.rooms,
                [newRoomKey]: { least: "192.168.0.0", greatest: "192.168.0.0" }, // 기본값
            },
        };

        setSettings(updatedSettings);
        updateServerSettings(updatedSettings);
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
        </div>
    );
};

export default DummySettings;