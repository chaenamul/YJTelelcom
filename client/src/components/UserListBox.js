import React, { useState, useEffect } from 'react';
import { socket } from 'socket/socket';

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
    <div>
      <h2>User List</h2>
      <div
        style={{
          width: '20%',
          height: '40vh',
          float: 'right',
          border: "1px solid #ccc",
          padding: "10px",
          boxSizing: 'border-box',
          //overflowY: 'scroll',
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {userList.map((user, index) => (
            <li key={index} style={{ marginBottom: "5px" }}>
              {user}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserListBox;
