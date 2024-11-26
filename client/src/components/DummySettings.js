import React, { useState, useEffect } from 'react';
import { socket } from "socket/socket";

const DummySettings = () => {
    const [roomCount, setRoomCount] = useState(2); // 초기 방 개수 설정

    const updateServerRoomCount = (newRoomCount) => {
        // 서버로 방 개수 전달
        socket.emit('update_room_count', newRoomCount, (response) => {
            if (response.status === "success") {
                console.log(`Room count updated successfully to ${newRoomCount}`);
            } else {
                console.error(`Failed to update room count: ${response.message}`);
            }
        });
    };

    useEffect(() => {
        // roomCount가 변경될 때 서버로 설정값 전달
        updateServerRoomCount(roomCount);
    }, [roomCount]); // roomCount 변경 시 실행

    const handleInputChange = (event) => {
        const input = event.target.value;
        const parsedValue = parseInt(input, 10);

        if (!isNaN(parsedValue) && parsedValue > 0) {
            setRoomCount(parsedValue);
        } else {
            console.log('Invalid room count input. Must be a positive number.');
        }
    };

    return (
        <div>
            <h3>Current Room Count: {roomCount}</h3>
            <label htmlFor="roomCountInput">Enter Room Count:</label>
            <input
                type="text"
                id="roomCountInput"
                value={roomCount}
                onChange={handleInputChange}
                placeholder="Enter room count (e.g., 3)"
            />
        </div>
    );
};

export default DummySettings;