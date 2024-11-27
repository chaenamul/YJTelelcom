import React, { useState } from 'react';
import { socket } from "socket/socket";

const DummySettings = () => {
    const [rooms, setRooms] = useState([
        { id: 1, capacity: 2 },
        { id: 2, capacity: 2 },
    ]); // 초기 방 데이터

    const updateServerRoomData = (newRooms) => {
        // 서버로 방 데이터 전달
        socket.emit('update_room_data', newRooms, (response) => {
            if (response.status === "success") {
                console.log(`Room data updated successfully:`, newRooms);
            } else {
                console.error(`Failed to update room data: ${response.message}`);
            }
        });
    };

    const handleInputChange = (roomId, event) => {
        const input = event.target.value;
        const parsedValue = parseInt(input, 10);

        if (!isNaN(parsedValue) && parsedValue > 0) {
            const updatedRooms = rooms.map((room) =>
                room.id === roomId ? { ...room, capacity: parsedValue } : room
            );
            setRooms(updatedRooms);
            updateServerRoomData(updatedRooms); // 변경된 데이터를 서버로 전달
        } else {
            console.log('Invalid capacity input. Must be a positive number.');
        }
    };

    const addRoom = () => {
        const newRoom = { id: rooms.length + 1, capacity: 2 }; // 새 방 기본 정원 2
        const updatedRooms = [...rooms, newRoom];
        setRooms(updatedRooms);
        updateServerRoomData(updatedRooms);
    };

    return (
        <div>
            <h3>Room Settings</h3>
            {rooms.map((room) => (
                <div key={room.id}>
                    <label htmlFor={`room-${room.id}`}>
                        Room {room.id} Capacity:
                    </label>
                    <input
                        type="text"
                        id={`room-${room.id}`}
                        value={room.capacity}
                        onChange={(event) => handleInputChange(room.id, event)}
                        placeholder={`Enter capacity for room ${room.id}`}
                    />
                </div>
            ))}
            <button onClick={addRoom}>Add Room</button>
        </div>
    );
};

export default DummySettings;